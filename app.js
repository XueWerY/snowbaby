/**
 * snowbaby 启动入口
 *
 * - `node .`：正常启动机器人（创建 Bot 实例并运行）
 * - `node . stop`：向运行中的 HTTP 服务发送 /exit 请求后退出
 */
class App {
  /** 停止运行中的 snowbaby */
  async stop() {
    const cfg = (await import("./lib/config/config.js")).default
    await fetch(`http://localhost:${cfg.server.port}/exit`, {
      headers: cfg.server.auth || undefined,
    }).catch(() => {})
  }

  /** 主入口 */
  async run() {
    if ((process.env.app_type || process.argv[2]) === "stop") {
      await this.stop()
      process.exit()
    }

    global.Bot = new (await import("./lib/core/Bot.js")).default()
    Bot.run()
  }
}

new App().run()
