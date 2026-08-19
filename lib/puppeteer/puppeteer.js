import Renderer from "../renderer/loader.js"

/**
 * 渲染器兼容类
 *
 * 暂时保留对手工引用 puppeteer.js 的兼容，后期会逐步废弃。
 * 只提供截图及分片截图功能。
 */
class Puppeteer {
  constructor() {
    this.renderer = Renderer.getRenderer()
  }

  async screenshot(name, data) {
    const img = await this.renderer.render(name, data)
    return img ? segment.image(img) : img
  }

  async screenshots(name, data) {
    data.multiPage = true
    const imgs = (await this.renderer.render(name, data)) || []
    const ret = []
    for (const img of imgs) ret.push(img ? segment.image(img) : img)
    return ret.length > 0 ? ret : false
  }
}

/** 渲染器兼容实例 */
export default new Puppeteer()
