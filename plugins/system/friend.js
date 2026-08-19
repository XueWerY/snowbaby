import Plugin from "../../lib/plugins/plugin.js"
import cfg from "../../lib/config/config.js"

export class Friend extends Plugin {
  constructor() {
    super({
      name: "autoFriend",
      dsc: "自动同意好友",
      event: "request.friend",
    })
  }

  async accept() {
    if (["add", "single"].includes(this.e.sub_type) && cfg.other.autoFriend == 1) {
      logger.mark(`[自动同意][添加好友] ${this.e.user_id}`)
      await Bot.sleep(3000)
      this.e.approve(true)
    }
  }
}
