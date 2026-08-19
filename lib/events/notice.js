import EventListener from "../listener/listener.js"

/**
 * 监听群聊消息
 */
export default class NoticeEvent extends EventListener {
  constructor() {
    super({ event: "notice" })
  }

  async execute(e) {
    this.plugins.deal(e)
  }
}
