import { OutputChannel, window } from 'vscode';

export class Logger {
  private static instance: Logger;
  public static channel: OutputChannel | null = null; 

  private constructor() {
    const displayName = "Remote Control";
    Logger.channel = window.createOutputChannel(displayName);
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public static info(message: string, type: "INFO" | "WARNING" | "ERROR" = "INFO"): void {
    if (!Logger.channel) {
      Logger.getInstance();
    }

    Logger.channel?.appendLine(`["${type}" - ${new Date().getHours()}:${new Date().getMinutes()}]  ${message}`);
  }

  public static warning(message: string): void {
    Logger.info(message, "WARNING");
  }

  public static error(message: string): void {
    Logger.info(message, "ERROR");
  }
}