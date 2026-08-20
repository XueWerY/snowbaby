import path from "node:path"
import fs from "node:fs"
import log4js from "log4js"
import { Chalk } from "chalk"
import cfg, { DATA_DIR } from "./config.js"

/** 日志目录（data/<用户ID>/snowbaby/logs，由宿主应用经 ESD_DATA_DIR 注入，回退至本地 data 目录） */
const LOG_DIR = path.join(DATA_DIR, "logs")

/** 日志设置类 */
class Log {
  /** 配置 log4js 并设置全局 logger */
  setLog() {
    // MARK 级别默认映射为灰色（grey），改为品红（magenta），使时间/级别文本非灰非白
    log4js.levels.MARK.colour = "magenta"
    // 确保日志目录存在：log4js 的 dateFile appender 不会自动创建目录，
    // 目录缺失会导致日志写入失败（对应日志文件内容为空）
    fs.mkdirSync(LOG_DIR, { recursive: true })
    log4js.configure({
      appenders: {
        stderr: {
          type: "stderr",
          layout: {
            type: "pattern",
            pattern: "%m",
          },
        },
        stdout: {
          type: "stdout",
          layout: {
            type: "pattern",
            pattern: "%m",
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
            pattern: "%m",
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
            pattern: "%m",
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
            pattern: "%m",
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

    /** 全局变量 logger（仅终端启用颜色，重定向/写文件时无色） */
    const chalk = new Chalk({ level: process.stdout.isTTY ? 3 : 0 })
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
    const defid = cfg.bot.logAlign || "snowbaby"

    /** 当前时间字符串 hh:mm:ss.SSS */
    const timeStr = () => {
      const d = new Date()
      const p = (n, l = 2) => String(n).padStart(l, "0")
      return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}.${p(d.getMilliseconds(), 3)}`
    }
    /** 按 log4js 级别色映射生成带色 [级别] */
    const levelColor = (level) => {
      const lv = String(level).toUpperCase()
      const colour = (log4js.levels[lv] && log4js.levels[lv].colour) || "white"
      return chalk[colour](`[${lv.slice(0, 4)}]`)
    }
    /** 日志行前缀：[时间] [级别] [标签]，时间固定黄色、标签固定青色 */
    chalk.head = (level, tag) =>
      chalk.yellow(`[${timeStr()}]`) + " " + levelColor(level) + " " + chalk.cyan(`[${tag}]`)

    for (const i in chalk.logger)
      if (typeof chalk.logger[i] == "function")
        chalk[i] = (...args) => chalk.logger[i](chalk.head(i, defid), ...args)
    global.logger = chalk
  }
}

/** 日志设置实例 */
export default new Log()
