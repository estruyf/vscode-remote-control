import * as vscode from 'vscode';
import WebSocket, { AddressInfo, MessageEvent } from 'ws';
import * as tcpPorts from 'tcp-port-used';
import { Logger } from './services/Logger';
import http from 'http';
import url from 'url';


let wss: WebSocket.Server | null = null;
let ws: WebSocket | null = null;

let hasFocus: boolean = false;
let onlyWhenInFocus: boolean | null | undefined = false;

const EXTENSION_ID: string = "eliostruyf.vscode-remote-control";
const APP_NAME: string = "remoteControl";

const warningNotification = (port: number, newPort: number): void => {
	vscode.window.showWarningMessage(`Remote Control: Port "${port}" was already in use. The extension opened on a port "${newPort}". If you want, you can configure another port via the "remotecontrol.port" workspace setting.`, 'Configure locally').then(async (option: string | undefined) => {
		if (option === "Configure locally") {
			await vscode.commands.executeCommand('workbench.action.openSettings', `@ext:${EXTENSION_ID}`);
			await vscode.commands.executeCommand('workbench.action.openWorkspaceSettings');
		}
	});
};

const startWebsocketServer = async (context:vscode.ExtensionContext, host: string, port: number, fallbackPorts: number[], showNotification: boolean = false): Promise<void> => {

	let isInUse = false;
	if (port) {
		isInUse = await tcpPorts.check(port, host);
		if (isInUse) {
			if (fallbackPorts.length > 0) {
				const nextPort = fallbackPorts.shift();
				if (nextPort) {
					startWebsocketServer(context, host, nextPort, fallbackPorts, true);
					return;
				} else {
					isInUse = true;
				}
			} else {
				isInUse = true;
			}
		}
	}

	// Start the API server
	const server = http.createServer();
	wss = new WebSocket.Server({ noServer: true });

	server.on('upgrade', function upgrade(request, socket, head) {
		const pathname = url.parse(request.url).pathname;

		wss?.handleUpgrade(request, socket, head, function done(ws) {
			wss?.emit('connection', ws, request);
		});
	});
	
	wss.on('connection', (connection: any) => {
		ws = connection;

		if (ws) {
			ws.addEventListener('message', (event: MessageEvent) => {
				if ((!onlyWhenInFocus || hasFocus) && event && event.data && event.data) {
					const wsData: CommandData = JSON.parse(event.data as string);
					const args = wsData.args;

					if (wsData.command === "vscode.open" || 
							wsData.command === "vscode.openFolder") {
						if (args && args[0]) {
							args[0] = vscode.Uri.file(args[0]);
						}
					}

					if (wsData.command === "terminal.execute") {
						let terminal = vscode.window.activeTerminal;
					  
						if (terminal && args) {
						  terminal.show(true);
						  terminal.sendText(args);
						  return;
						}
						return;
					  }

					if (args instanceof Array) {
						vscode.commands.executeCommand(wsData.command, ...args);
					} else {
						vscode.commands.executeCommand(wsData.command, args);
					}
				}
			});
		}
	});

	server.listen(isInUse ? 0 : port, host, () => {
		const address = server.address();
		const verifiedPort = (address as AddressInfo).port;
		Logger.info(`Remote Control: Listening on "ws://${host}:${verifiedPort}"`);
		//set the remote control port as an environment variable
		context.environmentVariableCollection.replace("REMOTE_CONTROL_PORT", `${verifiedPort}`);

		if (showNotification) {
			vscode.window.showInformationMessage(`Remote Control: Listening on "ws://${host}:${verifiedPort}"`);
		}

		const statusbar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
		statusbar.text = `$(plug) RC Port: ${verifiedPort}`;
		statusbar.tooltip = `Remote Control: Listening on "ws://${host}:${verifiedPort}"`;
		statusbar.show();

		if (isInUse) {
			warningNotification(port, verifiedPort);
		}
	});

	wss.on('error', (e) => {
		Logger.error(`Error while starting the websocket server.`);
		Logger.error((e as Error).message);
		vscode.window.showErrorMessage(`Remote Control: Error while starting the websocket server. Check the output for more details.`);
	});

	wss.on('close', () => {
		Logger.info('Closing the ws connection');
	});
};

export function activate(context: vscode.ExtensionContext) {
	const subscriptions = context.subscriptions;
	const config = vscode.workspace.getConfiguration(APP_NAME);
	const enabled = config.get<number | null>("enable");
	const host = config.get<string | null>("host");
	const port = config.get<number | null>("port");
	const fallbackPorts = config.get<number[] | null>("fallbacks");
	onlyWhenInFocus = config.get<boolean | null>("onlyWhenInFocus");

	const openSettings = vscode.commands.registerCommand(`${APP_NAME}.openSettings`, () => {
    vscode.commands.executeCommand('workbench.action.openSettings', `@ext:${EXTENSION_ID}`);
	});
	subscriptions.push(openSettings);

	if (enabled) {
		startWebsocketServer(context, host || "127.0.0.1", port || 3710, (fallbackPorts || []).filter(p => p !== port));

		Logger.info('VSCode Remote Control is now active!');
	} else {
		Logger.warning('VSCode Remote Control is not running!');
	}

	vscode.window.onDidChangeWindowState((event) => { hasFocus = event.focused })
}

// this method is called when your extension is deactivated
export function deactivate() {
	ws?.close();
	wss?.close();
}
