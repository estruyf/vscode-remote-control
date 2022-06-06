import * as vscode from 'vscode';
import WebSocket, { MessageEvent } from 'ws';
import * as tcpPorts from 'tcp-port-used';
import { Logger } from './services/Logger';


let wss: WebSocket.Server | null = null;
let ws: WebSocket | null = null;

const EXTENSION_ID: string = "eliostruyf.vscode-remote-control";
const APP_NAME: string = "remoteControl";

const errorNotification = (port: number): void => {
	vscode.window.showErrorMessage(`Remote Control: Port "${port}" is already in use. Please configure another port for the "remotecontrol.port" workspace setting.`, 'Configure locally', 'Configure globally').then((option: string | undefined) => {
		if (option === "Configure globally") {
			vscode.commands.executeCommand(`${APP_NAME}.openSettings`);
		} else if (option === "Configure locally") {
			vscode.commands.executeCommand('workbench.action.openSettings', `@ext:${EXTENSION_ID}`);
			vscode.commands.executeCommand('workbench.action.openWorkspaceSettings');
		}
	});
}

const startWebsocketServer = async (host: string, port: number, fallbackPorts: number[], showNotification: boolean = false): Promise<void> => {

	const isInUse = await tcpPorts.check(port, host);
	if (isInUse) {
		if (fallbackPorts.length > 0) {
			const nextPort = fallbackPorts.shift();
			if (nextPort) {
				startWebsocketServer(host, nextPort, fallbackPorts, true);
				return;
			} else {
				errorNotification(port);
				return;
			}
		} else {
			errorNotification(port);
			return;
		}
	}

	// Start the API server
	wss = new WebSocket.Server({ host, port });
	
	wss.on('connection', (connection: any) => {
		ws = connection;

		if (ws) {
			ws.addEventListener('message', (event: MessageEvent) => {
				if (event && event.data && event.data) {
					const wsData: CommandData = JSON.parse(event.data as string);
					const args = wsData.args;

					if (wsData.command === "vscode.open" || 
							wsData.command === "vscode.openFolder") {
						if (args && args[0]) {
							args[0] = vscode.Uri.file(args[0]);
						}
					}

					vscode.commands.executeCommand(wsData.command, ...args);
				}
			});
		}
	});

	wss.on('listening', (error: any) => {
		Logger.info(`Remote Control: Listening on "ws://${host}:${port}"`);

		if (showNotification) {
			vscode.window.showInformationMessage(`Remote Control: Listening on "ws://${host}:${port}"`);
		}
	});

	wss.on('error', () => {
		errorNotification(port);
	});

	wss.on('close', () => {
		Logger.info('Closing the ws connection');
	});
};

export function activate({ subscriptions }: vscode.ExtensionContext) {
	const config = vscode.workspace.getConfiguration(APP_NAME);
	const enabled = config.get<number | null>("enable");
	const host = config.get<string | null>("host");
	const port = config.get<number | null>("port");
	const fallbackPorts = config.get<number[] | null>("fallbacks");

	const openSettings = vscode.commands.registerCommand(`${APP_NAME}.openSettings`, () => {
    vscode.commands.executeCommand('workbench.action.openSettings', `@ext:${EXTENSION_ID}`);
	});
	subscriptions.push(openSettings);

	if (enabled) {
		startWebsocketServer(host || "127.0.0.1", port || 3710, (fallbackPorts || []).filter(p => p !== port));

		Logger.info('VSCode Remote Control is now active!');
	} else {
		Logger.info('VSCode Remote Control is not running!');
	}
}

// this method is called when your extension is deactivated
export function deactivate() {
	ws?.close();
	wss?.close();
}
