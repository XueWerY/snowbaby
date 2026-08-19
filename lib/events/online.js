import EventListener from "../listener/listener.js"

/**
 * 监听上线事件
 */
export default class OnlineEvent extends EventListener {
  constructor() {
    super({
      event: "online",
      once: true,
    })
  }

  async execute() {}
}
