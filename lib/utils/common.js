import fs from "node:fs"

/** 通用工具类 */
class Common {
  /**
   * 休眠函数
   * @param ms 毫秒
   */
  sleep(...args) {
    return Bot.sleep(...args)
  }

  /**
   * 下载保存文件
   * @param url 下载地址
   * @param file 保存路径
   * @param opts 下载参数
   */
  async downFile(url, file, opts) {
    try {
      return await Bot.download(url, file, opts)
    } catch (err) {
      logger.error("下载文件错误", err)
      return false
    }
  }

  mkdirs(dirname) {
    if (fs.existsSync(dirname)) return true
    fs.mkdirSync(dirname, { recursive: true })
    return true
  }
}

/** 通用工具实例 */
export default new Common()
