# Change Log

All notable changes to the "vscode-ws-extension" extension will be documented in this file.

## [1.7.0]

- Log JSON parsing error
- Added support for `markdown.showPreview` command

## [1.6.0]

- [#9](https://github.com/estruyf/vscode-remote-control/issues/9): Run the commands in the VSCode editor which is focused. Thanks to [Mirko Kunze](https://github.com/mqnc).

## [1.5.0]

- [#7](https://github.com/estruyf/vscode-remote-control/issues/7): Execute terminal commands. Thanks to [eluce2](https://github.com/eluce2).

## [1.4.0]

- [#6](https://github.com/estruyf/vscode-remote-control/issues/6): Added `REMOTE_CONTROL_PORT` environment variable to the vscode integrated terminal. Thanks to [joshuaeke](https://github.com/joshuaeke).

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
