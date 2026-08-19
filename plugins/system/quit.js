import Plugin from "../../lib/plugins/plugin.js"
import cfg from "../../lib/config/config.js"
export class Quit extends Plugin {
  constructor() {
    super({
      name: "notice",
      dsc: "自动退群",
      event: "notice.group.increase",
    })
  }

  async accept() {
    if (this.e.user_id != this.e.self_id || !this.e.group?.quit || !this.e.group.getMemberMap)
      return false

    const other = cfg.other
    if (!other.autoQuit) return false

    const gml = await this.e.group.getMemberMap()
    if (!(gml instanceof Map)) return false

    /** 判断主人邀请不退群 */
    if (cfg.masterQQ.some(qq => gml.has(Number(qq) || String(qq)))) {
      logger.mark(`[主人拉群] ${this.e.group_id}`)
      return false
    }

    /** 自动退群 */
    if (gml.size <= other.autoQuit && !this.e.group.is_owner) {
      await this.reply("禁止拉群，已自动退出")
      logger.mark(`[自动退群] ${this.e.group_id}`)
      this.e.group.quit()
    }
  }
}
