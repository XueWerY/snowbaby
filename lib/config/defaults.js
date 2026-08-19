/**
 * 默认配置类
 *
 * 所有模块默认值集中于此。
 * 用户可通过数据目录下的 data/<用户ID>/snowbaby/config.json 覆盖任意配置项（按用户隔离）。
 * 各项含义说明见下方行内注释。
 */
export class DefaultConfig {
  constructor() {
    /** 机器人基础配置 */
    this.bot = {
      /** 日志等级：trace / debug / info / warn / error / fatal */
      logLevel: "info",
      /** 打印错误对象时是否输出完整堆栈 */
      logObject: true,
      /** 日志行前导字符，用于对齐日志 */
      logAlign: "  snowbaby  ",
      /** 插件加载超时时间（秒），超时跳过 */
      pluginLoadTimeout: 60,
      /** 是否启用文件变更监听（自动重载） */
      fileWatch: true,
      /** 定时检测更新间隔（分钟），0 为关闭 */
      updateTime: 1440,
      /** 定时重启间隔（分钟），0 为关闭 */
      restartTime: 0,
      /** 定时更新 cron 表达式，优先级高于 updateTime */
      updateCron: null,
      /** 定时重启 cron 表达式，优先级高于 restartTime */
      restartCron: null,
      /** 定时停止 cron 表达式 */
      stopCron: null,
      /** 定时启动 cron 表达式 */
      startCron: null,
      /** 是否缓存群成员信息 */
      cacheGroupMember: true,
      /** 上线消息缓存有效期（分钟） */
      onlineMsgExp: 1440,
      /** 文件转 URL 的缓存时间（小时） */
      fileToUrlTime: 1,
      /** 文件转 URL 的调用次数上限，null 为不限 */
      fileToUrlTimes: null,
      /** 是否统计各类型消息数量 */
      msgTypeCount: true,
      /** 命令行指令前缀字符集合 */
      "/→#": true,
      /** 自定义 Chromium 可执行文件路径（不设置则用内置） */
      chromiumPath: null,
      /** puppeteer 远程 WebSocket 地址 */
      puppeteerWs: null,
      /** puppeteer 启动超时时间（毫秒） */
      puppeteerTimeout: null,
      /** HTTP 代理地址，例如 http://127.0.0.1:7890 */
      proxyAddress: null,
    }

    /** 群聊配置，键格式：bot账号:群号，default 为全局默认 */
    this.group = {
      /** 全局默认群配置 */
      default: {
        /** 群内指令冷却时间（毫秒） */
        groupCD: 500,
        /** 同一用户指令冷却时间（毫秒） */
        singleCD: 2000,
        /** 是否仅 @ 机器人时响应：0 否 / 1 是 */
        onlyReplyAt: 0,
        /** 机器人在群内的别名 */
        botAlias: ["雪宝", "雪崽"],
        /** 群内添加好友数量限制，0 不限 */
        addLimit: 0,
        /** 是否允许群里触发添加好友：0 否 / 1 是 */
        addPrivate: 1,
        /** 添加好友时是否自动回复：0 否 / 1 是 */
        addReply: 1,
        /** 添加好友时是否需要 @ 机器人：0 否 / 1 是 */
        addAt: 0,
        /** 添加好友消息的召回时间（秒），0 关闭 */
        addRecall: 60,
        /** 群内启用的指令白名单，null 表示不限制 */
        enable: null,
        /** 群内禁用的指令列表 */
        disable: ["禁用示例", "支持多个"],
      },
      /** 指定机器人（114514）的全局默认群配置 */
      "114514:default": {
        /** 仅 @ 机器人时响应 */
        onlyReplyAt: 1,
        /** 该机器人在群内的别名 */
        botAlias: ["臭宝", "臭崽"],
      },
      /** 指定群（123456）的配置 */
      "123456": {
        /** 该群内指令冷却时间（毫秒） */
        groupCD: 500,
        /** 该群内同一用户指令冷却时间（毫秒） */
        singleCD: 2000,
      },
      /** 指定机器人在指定群（114514:123456）的配置 */
      "114514:123456": {
        /** 该群内启用的指令白名单 */
        enable: null,
        /** 该群内禁用的指令列表 */
        disable: null,
      },
    }

    /** 其他杂项配置 */
    this.other = {
      /** 是否自动通过好友申请：1 是 / 0 否 */
      autoFriend: 1,
      /** 是否自动同意入群邀请：1 是 / 0 否 */
      autoGroup: 0,
      /** 自动退出不活跃群的数量上限 */
      autoQuit: 50,
      /** 主人 QQ 账号列表（stdin 表示交互式输入） */
      masterQQ: ["stdin"],
      /** 机器人账号与主人账号映射，格式 机器人:主人 */
      master: ["stdin:stdin"],
      /** 是否禁用私聊功能 */
      disablePrivate: false,
      /** 禁用私聊时回复的提示消息 */
      disableMsg: "私聊功能已禁用，仅支持发送 cookie，抽卡记录链接，记录日志文件",
      /** 私聊中被禁用的内容类型 */
      disableAdopt: ["stoken"],
      /** 白名单群号列表，null 表示不限制 */
      whiteGroup: null,
      /** 白名单用户号列表，null 表示不限制 */
      whiteUser: null,
      /** 黑名单群号列表 */
      blackGroup: [],
      /** 黑名单用户号列表 */
      blackUser: [528952540],
    }

    /** 渲染器配置 */
    this.renderer = {
      /** 使用的渲染器名称，null 表示默认（puppeteer） */
      name: null,
    }

    /** puppeteer 渲染配置 */
    this.puppeteer = {
      /** chromium 可执行文件路径（可填系统 edge/chromium），null 用内置 */
      chromiumPath: null,
      /** puppeteer websocket 地址（连接单独存在的 chromium） */
      puppeteerWS: null,
      /** headless 模式 */
      headless: "new",
      /** puppeteer 启动 args（注意 -- 前缀） */
      args: ["--disable-gpu", "--disable-setuid-sandbox", "--no-sandbox", "--no-zygote"],
      /** puppeteer 截图超时时间（毫秒） */
      puppeteerTimeout: null,
      /** 页面 goto 时的参数 */
      pageGotoParams: {
        /** goto 超时（毫秒） */
        timeout: 120000,
      },
      /** 用户数据目录 */
      userDataDir: null,
    }

    /** HTTP 服务器配置 */
    this.server = {
      /** 对外访问地址 */
      url: "http://localhost:2536",
      /** 监听端口 */
      port: 2536,
      /** 根路径访问时的重定向地址 */
      redirect: "https://github.com/XueWerY/snowbaby",
      /** 鉴权配置（用户名:密码），null 表示不启用 */
      auth: null,
      /** HTTPS 证书配置，null 表示使用 HTTP */
      https: null,
    }
  }
}

/** 默认配置实例 */
export const defaultConfig = new DefaultConfig()
