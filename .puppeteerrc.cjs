const { arch } = require("os")
const { existsSync } = require("fs")
const { execSync } = require("child_process")

const log = typeof logger != "undefined" ? logger : console

/** Puppeteer 浏览器配置类 */
class PuppeteerConfig {
  constructor() {
    this.executablePath = this.resolve()
    this.skipDownload =
      !!this.executablePath || arch == "arm64" || arch == "aarch64"
    if (this.skipDownload) log.info(`[Chromium] ${this.executablePath}`)
  }

  /** 返回第一个存在的路径，否则空字符串 */
  findExisting(paths) {
    for (const p of paths) if (existsSync(p)) return p
    return ""
  }

  /** 在 PATH 中查找命令对应的可执行文件路径 */
  findCommand(cmds) {
    for (const cmd of cmds)
      try {
        const p = execSync(`command -v ${cmd}`).toString().trim()
        if (p && existsSync(p)) return p
      } catch {}
    return ""
  }

  /** 解析系统浏览器可执行文件路径 */
  resolve() {
    // Linux/Android：优先从 PATH 查找系统 chromium
    if (["linux", "android"].includes(process.platform))
      return this.findCommand(["chromium", "chromium-browser", "google-chrome", "google-chrome-stable"])

    // 常见浏览器安装路径
    return this.findExisting([
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    ])
  }
}

module.exports = new PuppeteerConfig()
