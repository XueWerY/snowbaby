/** 事件处理器类 */
class Handler {
  /** 事件注册表：{ key: [{ priority, fn, ns, self, key }] } */
  events = {}

  /**
   * 注册处理器
   * @param cfg { ns, fn, self, priority, key|event }
   */
  add = (cfg) => {
    let { ns, fn, self, priority = 500 } = cfg
    let key = cfg.key || cfg.event
    if (!key || !fn) {
      return
    }
    this.del(ns, key)
    logger.mark(`[Handler][Reg]: [${ns}][${key}]`)
    this.events[key] = this.events[key] || []
    this.events[key].push({
      priority,
      fn,
      ns,
      self,
      key,
    })
    this.events[key] = this.events[key].sort((a, b) => a.priority - b.priority)
  }

  /**
   * 删除处理器
   * @param ns 命名空间
   * @param key 事件key
   */
  del = (ns, key = "") => {
    if (!key) {
      for (let key in this.events) {
        this.del(ns, key)
      }
      return
    }
    if (!this.events[key]) {
      return
    }
    for (let idx = 0; idx < this.events[key].length; idx++) {
      let handler = this.events[key][idx]
      if (handler.ns === ns) {
        this.events[key].splice(idx, 1)
        this.events[key] = this.events[key].sort((a, b) => a.priority - b.priority)
      }
    }
  }

  /** 调用全部处理器（暂时屏蔽） */
  callAll = async (key, e, args) => {
    // 暂时屏蔽调用
    // return this.call(key, e, args, true)
  }

  /**
   * 调用处理器
   * @param key 事件key
   * @param e 消息事件
   * @param args 额外参数
   * @param allHandler 是否调用全部
   */
  call = async (key, e, args, allHandler = false) => {
    let ret
    for (let obj of this.events[key]) {
      let fn = obj.fn
      let done = true
      let reject = (msg = "") => {
        if (msg) {
          logger.mark(`[Handler][Reject]: [${obj.ns}][${key}] ${msg}`)
        }
        done = false
      }
      ret = await fn.call(obj.self, e, args, reject)
      if (done && !allHandler) {
        logger.mark(`[Handler][Done]: [${obj.ns}][${key}]`)
        return ret
      }
    }
    return ret
  }

  /** 是否存在处理器 */
  has = (key) => {
    return !!this.events[key]
  }
}

/** 事件处理器实例 */
export default new Handler()
