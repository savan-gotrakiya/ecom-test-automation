import winston, { format, Logger } from "winston";
import { LogMeta } from "../types/logger";

export const logger: Logger = winston.createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.colorize(),
    format.printf(({ timestamp, level, message, ...meta }) => {
      const { reqId } = meta as LogMeta;
      return `[${timestamp}] ${level}: ${reqId ? `[${reqId}] ` : ""}${message}`;
    })
  ),
  transports: [new winston.transports.Console()],
});
