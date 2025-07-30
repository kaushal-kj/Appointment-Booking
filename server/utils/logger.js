import winston from "winston";
import path from "path";
import fs from "fs";

// Ensure logs directory exists
const logDir = path.resolve("logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(
      (info) =>
        `[${info.timestamp}] [${info.level.toUpperCase()}] ${info.message}`
    )
  ),
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

// If in development, also log to console
if (process.env.NODE_ENV !== "production") {
  logger.add(new winston.transports.Console());
}

export default logger;
