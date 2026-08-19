import log from "./log.js"
import cfg from "./config.js"
import localStoreInit from "./localStore.js"

/** 初始化配置类 */
class Init {
  constructor() {
    /** 设置标题 */
    process.title = `snowbaby v${cfg.package.version}`

    /** 设置时区 */
    process.env.TZ = "Asia/Shanghai"

    for (const i of ["SIGHUP", "SIGTERM"]) process.on(i, (signal, code) => process.exit(code))

    /** 日志设置 */
    log.setLog()

    /** 捕获未处理的错误 */
    for (const i of ["uncaughtException", "unhandledRejection"])
      process.on(i, e => {
        try {
          Bot.makeLog("error", e, i)
        } catch (err) {
          console.error(i, e, err)
          process.exit()
        }
      })

    logger.mark(logger.yellow(`snowbaby v${cfg.package.version} 启动中...`))
    logger.mark(logger.cyan("项目地址：https://github.com/XueWerY/snowbaby"))
  }

  /** 初始化运行环境（本地存储、退出钩子） */
  async init() {
    if (this.stack !== undefined) return
    this.stack = ""

    await localStoreInit()
    const exit = process.exit
    process.exit = code => {
      this.stack = Error().stack
      return exit(code)
    }

    /** 退出事件 */
    process.on("exit", code => {
      Bot.makeLog(
        "mark",
        logger.magenta(`snowbaby 已停止运行，本次运行时长：${Bot.getTimeDiff()} (${code})`),
        "exit",
      )
      Bot.makeLog("trace", this.stack || Error().stack, "exit")
    })
  }
}

/** 初始化实例 */
export default new Init()
