import Plugin from "../../lib/plugins/plugin.js"

export class RecallReply extends Plugin {
  constructor() {
    super({
      name: "回复撤回",
      dsc: "撤回回复消息",
      event: "message",
      priority: -Infinity,
      rule: [
        {
          reg: `^#?撤回$`,
          fnc: "recall",
        },
      ],
    })
  }

  async recall(e) {
    if (!e.isMaster) return false
    const recall =
      e.group?.recallMsg?.bind(e.group) ||
      e.friend?.recallMsg?.bind(e.friend) ||
      e.bot.recallMsg?.bind(e.bot)
    if (!recall) return false
    if (e.message_id) recall(e.message_id)
    const reply_id = e.reply_id || (e.getReply && (await e.getReply())?.message_id)
    if (reply_id) recall(reply_id)
  }
}
