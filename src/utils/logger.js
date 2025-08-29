import winston from "winston";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, reqId }) => {
      return `[${timestamp}] ${level}: ${reqId ? `[${reqId}] ` : ""}${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
  ],
});
