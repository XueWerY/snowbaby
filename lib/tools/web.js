import express from "express"
import template from "express-art-template"
import fs from "node:fs/promises"
import lodash from "lodash"

/*
 * npm run app web-debug开启Bot后
 * 可另外通过 npm run web 开启浏览器调试
 * 访问 http://localhost:8000/ 即可看到对应页面
 * 页面内的资源需使用 {{_res_path}}来作为resources目录的根目录
 * 可编辑模板与页面查看效果
 * todo: 预览页面的热更
 *
 * */

/** Web 调试服务器类 */
class WebServer {
  constructor() {
    this.app = express()
    this._path = process.cwd()
    this.setup()
  }

  /** 配置路由 */
  setup() {
    const { app, _path } = this

    app.engine("html", template)
    app.set("views", _path + "/resources/")
    app.set("view engine", "art")
    app.use(express.static(_path + "/resources"))
    app.use("/plugins", express.static("plugins"))

    app.get("/", async (req, res) => {
      const pluginList = (await fs.readdir(_path + "/temp/ViewData/")) || []
      const html = [
        "在npm run web-dev模式下触发截图消息后，可在下方选择页面进行调试",
        "如果页面内资源路径不正确请使用{{_res_path}}作为根路径，对应之前的../../../../",
        "可直接修改模板html或css刷新查看效果",
      ]
      const li = {}
      for (const pIdx in pluginList) {
        const plugin = pluginList[pIdx]
        const fileList = (await fs.readdir(_path + `/temp/ViewData/${plugin}/`)) || []
        for (const idx in fileList) {
          const ret = /(.+)\.json$/.exec(fileList[idx])
          if (ret && ret[1]) {
            const text = [plugin, ...ret[1].split("_")]
            li[text.join("")] =
              `<li style="font-size:18px; line-height:30px;"><a href="/${plugin}_${ret[1]}">${text.join(" / ")}</a></li>`
          }
        }
      }
      res.send(html.join("</br>") + "<ul>" + lodash.values(li).join("") + "</ul>")
    })

    app.get("/:page", async (req, res) => {
      const [plugin, module, ...page] = req.params.page.split("_")
      const pageName = page.join("_")
      if (plugin == "favicon.ico") {
        return res.send("")
      }
      const data = JSON.parse(
        await fs.readFile(_path + `/temp/ViewData/${plugin}/${module}_${pageName}.json`, "utf8"),
      ) || {}
      data._res_path = ""
      data._sys_res_path = data._res_path

      if (data._plugin) {
        data._res_path = `/plugins/${data._plugin}/resources/`
        data.pluResPath = data._res_path
      }
      let htmlPath = ""
      let tplPath = `${module}/${htmlPath}${pageName}/${pageName}.html`
      if (data._plugin) {
        tplPath = `../plugins/${data._plugin}/resources/${htmlPath}/${module}/${pageName.split("_").join("/")}.html`
      } else if (data._no_type_path) {
        tplPath = `${module}/${pageName}.html`
      }
      res.render(tplPath, data)
    })
  }

  /** 启动服务 */
  start() {
    this.app.listen(8000)
    console.log("页面服务已启动，触发消息图片后访问 http://localhost:8000/ 调试页面")
  }
}

/** 启动 Web 调试服务 */
new WebServer().start()
