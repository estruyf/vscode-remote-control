import * as vscode from 'vscode';
import WebSocket, { MessageEvent } from 'ws';


let wss: WebSocket.Server | null = null;
let ws: WebSocket | null = null;

const EXTENSION_ID: string = "eliostruyf.vscode-remote-control";
const APP_NAME: string = "remoteControl";

export function activate({ subscriptions }: vscode.ExtensionContext) {
	const config = vscode.workspace.getConfiguration(APP_NAME);
	const enabled = config.get<number | null>("enable");
	const port = config.get<number | null>("port");

	const openSettings = vscode.commands.registerCommand(`${APP_NAME}.openSettings`, () => {
    vscode.commands.executeCommand('workbench.action.openSettings', '@ext:${EXTENSION_ID}');
	});
	subscriptions.push(openSettings);

	if (enabled) {
		// Start the API
		wss = new WebSocket.Server({ port: port || 3710 });
	
		wss.on('connection', (connection: any) => {
			ws = connection;
	
			if (ws) {
				ws.addEventListener('message', (event: MessageEvent) => {
					if (event && event.data && event.data) {
						const wsData: CommandData = JSON.parse(event.data as string);
						vscode.commands.executeCommand(wsData.command, wsData.args);
					}
				});
			}
		});
	
		wss.on('error', () => {
			vscode.window.showErrorMessage(`Remote Control: Port "${port}" is already in use. Please configure another port for the "remotecontrol.port" workspace setting.`, 'Configure locally', 'Configure globally').then((option: string | undefined) => {
				if (option === "Configure globally") {
					vscode.commands.executeCommand(`${APP_NAME}.openSettings`);
				} else if (option === "Configure locally") {
					vscode.commands.executeCommand('workbench.action.openSettings', `@ext:${EXTENSION_ID}`);
					vscode.commands.executeCommand('workbench.action.openWorkspaceSettings');
				}
			});
		});
	
		wss.on('close', () => {
			console.log('Closing the ws connection');
		});

		console.log('VSCode Remote Control is now active!');
	} else {
		console.log('VSCode Remote Control is not running!');
	}
}

// this method is called when your extension is deactivated
export function deactivate() {
	ws?.close();
	wss?.close();
}
