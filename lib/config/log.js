import path from "node:path"
import fs from "node:fs"
import log4js from "log4js"
import { Chalk } from "chalk"
import cfg from "./config.js"

/** 日志目录（data/<用户ID>/snowbaby/logs，由宿主应用经 ESD_DATA_DIR 注入） */
const LOG_DIR = path.join(process.env.ESD_DATA_DIR, "logs")

/** 日志设置类 */
class Log {
  /** 配置 log4js 并设置全局 logger */
  setLog() {
    // 确保日志目录存在：log4js 的 dateFile appender 不会自动创建目录，
    // 目录缺失会导致日志写入失败（对应日志文件内容为空）
    fs.mkdirSync(LOG_DIR, { recursive: true })
    log4js.configure({
      appenders: {
        stderr: {
          type: "stderr",
          layout: {
            type: "pattern",
            pattern: "[%d{hh:mm:ss.SSS}][%4.4p] %m",
          },
        },
        stdout: {
          type: "stdout",
          layout: {
            type: "pattern",
            pattern: "[%d{hh:mm:ss.SSS}][%4.4p] %m",
          },
        },
        run: {
          type: "dateFile",
          filename: path.join(LOG_DIR, "run"),
          pattern: "yyyy-MM-dd.log",
          numBackups: 180,
          alwaysIncludePattern: true,
          layout: {
            type: "pattern",
            pattern: "[%d{hh:mm:ss.SSS}][%4.4p]%m",
          },
          compress: true,
        },
        command: {
          type: "dateFile",
          filename: path.join(LOG_DIR, "command"),
          pattern: "yyyy-MM-dd.log",
          numBackups: 180,
          alwaysIncludePattern: true,
          layout: {
            type: "pattern",
            pattern: "[%d{hh:mm:ss.SSS}][%4.4p]%m",
          },
          compress: true,
        },
        error: {
          type: "dateFile",
          filename: path.join(LOG_DIR, "error"),
          pattern: "yyyy-MM-dd.log",
          numBackups: 180,
          alwaysIncludePattern: true,
          layout: {
            type: "pattern",
            pattern: "[%d{hh:mm:ss.SSS}][%4.4p]%m",
          },
          compress: true,
        },
      },
      categories: {
        default: { appenders: ["stdout", "run"], level: cfg.bot.logLevel },
        command: { appenders: ["stdout", "command"], level: "warn" },
        error: { appenders: ["stderr", "command", "error"], level: "error" },
      },
    })

    /** 全局变量 logger */
    const chalk = new Chalk({ level: 0 })
    chalk.logger = {
      defaultLogger: log4js.getLogger("message"),
      commandLogger: log4js.getLogger("command"),
      errorLogger: log4js.getLogger("error"),
      trace(...args) {
        return this.defaultLogger.trace(...args)
      },
      debug(...args) {
        return this.defaultLogger.debug(...args)
      },
      info(...args) {
        return this.defaultLogger.info(...args)
      },
      warn(...args) {
        return this.commandLogger.warn(...args)
      },
      error(...args) {
        return this.errorLogger.error(...args)
      },
      fatal(...args) {
        return this.errorLogger.fatal(...args)
      },
      mark(...args) {
        return this.commandLogger.mark(...args)
      },
    }
    const defid = chalk.blue(`[${cfg.bot.logAlign || "snowbaby"}]`)
    for (const i in chalk.logger)
      if (typeof chalk.logger[i] == "function")
        chalk[i] = (...args) => chalk.logger[i](defid, ...args)
    global.logger = chalk
  }
}

/** 日志设置实例 */
export default new Log()
