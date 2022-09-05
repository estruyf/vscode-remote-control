# Change Log

All notable changes to the "vscode-ws-extension" extension will be documented in this file.

## [1.3.0]

- When the port is in use, the extension will try one of your fallback ports. If none of them are available, it will use a random port.
- New status bar item to show the port number of the websocket server.

## [1.2.1]

- Fix to execute command with `array` or `object` arguments

## [1.2.0]

- Added output channel
- [#3](https://github.com/estruyf/vscode-remote-control/issues/3): Fix for using the `vscode.open` and `vscode.openFolder` command.

## [1.1.0]

- Allow to change the hostname of the websocket server

## [1.0.0]

- Documentation updates
- [#1](https://github.com/estruyf/vscode-remote-control/issues/1): Implemented fallback ports for the websocket server

## [0.0.3]

- Added `global` and `local` configuration buttons on error notification.
- Remove webpack local dev issues with internal node dependencies

## [0.0.2]

- Support for `args` has been added

## [0.0.1]

- Initial release