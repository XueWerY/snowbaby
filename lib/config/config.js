import fs from "node:fs"
import path from "node:path"
import { defaultConfig } from "./defaults.js"

/**
 * 配置类
 *
 * 默认配置来自 defaults.js，用户配置存于 data/<用户ID>/snowbaby/config.json
 * （按用户隔离，由宿主应用经 ESD_DATA_DIR 注入），通过深合并覆盖默认配置。
 */
class Cfg {
  /** 数据目录（data/<用户ID>/snowbaby，由宿主应用经 ESD_DATA_DIR 注入） */
  static DATA_DIR = process.env.ESD_DATA_DIR

  /** 用户配置本地文件（JSON，按用户隔离），覆盖默认配置 */
  static USER_CONFIG_FILE = path.join(Cfg.DATA_DIR, "config.json")

  constructor() {
    this.defaults = defaultConfig
    this.user = this.loadUserConfig()

    // 通过 Proxy 支持 cfg.xxx 直接读取配置模块（如 cfg.bot、cfg.server）
    return new Proxy(this, {
      get: (target, prop) => target[prop] ?? target.getAllCfg(String(prop)),
    })
  }

  /** 深合并：b 覆盖 a（递归合并对象） */
  static deepMerge(a, b) {
    if (Array.isArray(a) && Array.isArray(b)) return b
    if (a && b && typeof a === "object" && typeof b === "object") {
      const out = { ...a }
      for (const k of Object.keys(b)) {
        if (b[k] === undefined) continue
        out[k] = Cfg.deepMerge(a[k], b[k])
      }
      return out
    }
    return b
  }

  /** 读取用户配置 json，不存在返回 {} */
  loadUserConfig() {
    try {
      return JSON.parse(fs.readFileSync(Cfg.USER_CONFIG_FILE, "utf8")) || {}
    } catch {
      return {}
    }
  }

  /** 合并后的配置（用户配置覆盖默认） */
  getAllCfg(name) {
    return Cfg.deepMerge(this.defaults[name] || {}, this.user[name] || {})
  }

  /** 默认配置 */
  getdefSet(name) {
    return this.defaults[name] || {}
  }

  /** 用户配置 */
  getConfig(name) {
    return this.user[name] || {}
  }

  /** 主人账号 */
  get masterQQ() {
    if (this._masterQQ) return this._masterQQ
    const other = this.getAllCfg("other")
    if (other.masterQQs) return (this._masterQQ = other.masterQQs)
    let masterQQ = other.masterQQ || []

    if (!Array.isArray(masterQQ)) masterQQ = [masterQQ]

    return (this._masterQQ = masterQQ.map(i => Number(i) || i))
  }

  /** Bot账号:[主人帐号] */
  get master() {
    if (this._master) return this._master
    const other = this.getAllCfg("other")
    if (other.masters) return (this._master = other.masters)
    let master = other.master || []

    if (!Array.isArray(master)) master = [master]

    const masters = {}
    for (let i of master) {
      i = i.split(":")
      const bot_id = i.shift()
      const user_id = i.join(":")
      if (Array.isArray(masters[bot_id])) masters[bot_id].push(user_id)
      else masters[bot_id] = [user_id]
    }
    return (this._master = masters)
  }

  /** 机器人账号 */
  get uin() {
    return Object.keys(this.master)
  }
  get qq() {
    return this.uin
  }

  /** package.json */
  get package() {
    if (this._package) return this._package
    return (this._package = JSON.parse(fs.readFileSync("package.json", "utf8")))
  }

  /** 群配置 */
  getGroup(bot_id = "", group_id = "") {
    const config = this.getAllCfg("group")
    return {
      ...config.default,
      ...config[`${bot_id}:default`],
      ...config[group_id],
      ...config[`${bot_id}:${group_id}`],
    }
  }

  /** other配置 */
  getOther() {
    return this.getAllCfg("other")
  }

  /** 修改日志等级（保留回调，本地文件不做实时监听） */
  async change_bot() {
    ;(await import("./log.js")).default()
  }
}

/** 配置实例 */
export default new Cfg()
