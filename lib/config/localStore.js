/**
 * 本地文件 KV 存储
 *
 * 本地 JSON 文件持久化，数据落盘到 process.env.ESD_DATA_DIR
 * （由宿主应用传入，形如 <userData>/data/<用户ID>/snowbaby）。
 *
 */
import fs from "node:fs"
import path from "node:path"

/** 本地文件 KV 存储类 */
export class LocalStore {
  /** 数据目录（data/<用户ID>/snowbaby，由宿主应用经 ESD_DATA_DIR 注入） */
  static DATA_DIR = process.env.ESD_DATA_DIR

  /** 单文件数据：{ [key]: { value, expireAt? } } */
  static DATA_FILE = path.join(LocalStore.DATA_DIR, "data.json")

  constructor() {
    /** 数据存储：{ [key]: { value, expireAt? } } */
    this.store = LocalStore.load()
  }

  /** 读取数据文件，不存在返回 {} */
  static load() {
    try {
      const raw = fs.readFileSync(LocalStore.DATA_FILE, "utf-8")
      return JSON.parse(raw) || {}
    } catch {
      return {}
    }
  }

  /** 内部写盘（set/del/incr 后即时持久化） */
  persist() {
    try {
      fs.mkdirSync(LocalStore.DATA_DIR, { recursive: true })
      fs.writeFileSync(LocalStore.DATA_FILE, JSON.stringify(this.store))
    } catch (err) {
      Bot.makeLog?.("error", err, "LocalStore")
    }
  }

  /** 惰性清理已过期键，返回该键是否有效 */
  isValid(entry) {
    if (!entry) return false
    if (entry.expireAt && Date.now() > entry.expireAt) {
      return false
    }
    return true
  }

  /** 扫描前缀匹配（MATCH 支持 * 通配） */
  scanKeys(pattern) {
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$")
    return Object.keys(this.store).filter(k => this.isValid(this.store[k]) && regex.test(k))
  }

  async connect() {
    return this
  }

  async get(key) {
    const entry = this.store[key]
    if (!this.isValid(entry)) {
      delete this.store[key]
      return null
    }
    return entry.value
  }

  async set(key, value, opts = {}) {
    this.store[key] = { value, ...(opts.EX ? { expireAt: Date.now() + opts.EX * 1000 } : {}) }
    this.persist()
    return "OK"
  }

  async setEx(key, seconds, value) {
    return this.set(key, value, { EX: seconds })
  }

  async del(...keys) {
    let count = 0
    for (const k of keys.flat()) {
      if (k in this.store) {
        delete this.store[k]
        count++
      }
    }
    if (count) this.persist()
    return count
  }

  async incr(key) {
    const cur = Number((await this.get(key)) || 0) + 1
    this.store[key] = { value: cur }
    this.persist()
    return cur
  }

  async scan(cursor = 0, opts = {}) {
    const pattern = opts.MATCH || "*"
    const all = this.scanKeys(pattern)
    const count = opts.COUNT || 10
    const keys = all.slice(cursor, cursor + count)
    return { cursor: cursor + count >= all.length ? 0 : cursor + count, keys }
  }

  async keys(pattern = "*") {
    return this.scanKeys(pattern)
  }

  /** 数据已即时落盘，此处为空实现以兼容调用方 */
  async save() {}

  async disconnect() {}

  once() {
    return this
  }
}

/**
 * 初始化全局本地存储并返回实例
 */
export default async function localStoreInit() {
  return (global.localStore = await new LocalStore().connect())
}
