import Plugin from "../../lib/plugins/plugin.js"
import fs from "node:fs/promises"
import path from "node:path"
import { ulid } from "ulid"
const code = {}
/** 用户配置本地文件（按用户隔离，存于 ESD_DATA_DIR 数据目录下） */
const file = path.join(process.env.ESD_DATA_DIR, "config.json")
export class Master extends Plugin {
  constructor() {
    super({
      name: "设置主人",
      dsc: "设置主人",
      event: "message",
      priority: -Infinity,
      rule: [
        {
          reg: "^#设置主人验证码$",
          fnc: "code",
          permission: "master",
        },
        {
          reg: "^#设置主人$",
          fnc: "master",
        },
      ],
    })
  }

  code() {
    const msg = Object.entries(code)
      .map(([i, v]) => `[${i}] ${v}`)
      .join("\n")
    return this.reply(msg.trim() || "暂无验证码", true)
  }

  async edit(file, key, value) {
    let doc = {}
    try {
      doc = JSON.parse(await fs.readFile(file, "utf8"))
    } catch {}
    const other = doc.other || (doc.other = {})
    const values = other[key] || (other[key] = [])
    if (values.some(item => String(item) == String(value))) return
    values.push(value)
    await fs.mkdir(path.dirname(file), { recursive: true })
    return fs.writeFile(file, JSON.stringify(doc, null, 2), "utf8")
  }

  master() {
    if (this.e.isMaster) return this.reply(`[${this.e.user_id}] 已经为主人`, true)

    code[`${this.e.self_id}:${this.e.user_id}`] = ulid()
    logger.mark(
      `${logger.cyan(`[${this.e.user_id}]`)} 设置主人验证码 ${logger.green(code[`${this.e.self_id}:${this.e.user_id}`])}`,
    )
    this.setContext("verify")
    return this.reply(`[${this.e.user_id}] 请输入验证码`, true)
  }

  async verify() {
    this.finish("verify")
    if (this.e.msg?.trim().toUpperCase() !== code[`${this.e.self_id}:${this.e.user_id}`]) {
      return this.reply("验证码错误", true)
    }
    await this.edit(file, "masterQQ", this.e.user_id)
    await this.edit(file, "master", `${this.e.self_id}:${this.e.user_id}`)
    return this.reply(`[${this.e.user_id}] 设置主人完成`, true)
  }
}
