import Plugin from "../../lib/plugins/plugin.js"
import cfg from "../../lib/config/config.js"

export class DisPri extends Plugin {
  constructor() {
    super({
      name: "禁止私聊",
      dsc: "对私聊禁用做处理",
      event: "message.private",
      priority: -Infinity,
    })
  }

  async accept() {
    if (!cfg.other?.disablePrivate || this.e.isMaster) return

    /** 发送日志文件，xlsx，json */
    if (this.e.file) {
      if (!/(.*)\.txt|xlsx|json/gi.test(this.e.file?.name)) {
        this.sendTips()
        return "return"
      } else {
        return false
      }
    }

  }

  async sendTips() {
    if (this.e.user_id == this.e.self_id) return

    /** cd */
    const key = `snowbaby:disablePrivate:${this.e.user_id}`
    if (await localStore.get(key)) return

    this.e.reply(cfg.other.disableMsg)
    await localStore.setEx(key, 10, "1")
  }
}

export class DisFriPoke extends Plugin {
  constructor() {
    super({
      name: "禁止私聊",
      dsc: "开启私聊禁用时，仅放行日志文件等指定内容",
      event: "notice.friend.poke",
      priority: -Infinity,
    })
  }

  async accept() {
    if (!cfg.other?.disablePrivate || this.e.isMaster) return
    this.e.reply(cfg.other.disableMsg)
    return "return"
  }
}
