import express from 'express'
import yargs from 'yargs';
import createApp from 'create-app/client'
import webpack from 'webpack'
import serveStatic from 'serve-static'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import compression from 'compression'
import * as Relite from 'relite'

import _build from './build'
import _start from './start'
import _Controller from './controller'
import * as _Component from './component'
import * as _Config from './config'
import _Context from './context'
import _connect from './hoc/connect'
import {
  useCtrl as _useCtrl,
  useModel as _useModel,
  useModelActions as _useModelAction,
  useModelState as _useModelState
} from './hook'

export const start = _start
export const build = _build
export const Controller = _Controller
export const Component = _Component
export const Config = _Config
export const Context = _Context
export const connect = _connect

const IMVC = {
  Controller: _Controller,
  build: _build,
  start: _start,
  Component: _Component,
  Config: _Config,
  Context: _Context,
  connect: _connect
}
declare global {
  namespace NodeJS {
    interface Global {
      __INITIAL_STATE__?: IMVC.State
      __webpack_public_path__?: string
      fetch?: Function
      [x: string]: any
    }
  }

  interface Window {
    __INITIAL_STATE__?: IMVC.State
    __REDUX_DEVTOOLS_EXTENSION__?: any
    __PUBLIC_PATH__?: string
    __APP_SETTINGS__?: IMVC.AppSettings
    [x: string]: any
  }

  var __INITIAL_STATE__: IMVC.State | undefined
  interface Document {
    attachEvent: typeof document.addEventListener
    detachEvent: typeof document.removeEventListener
  }
  const __REDUX_DEVTOOLS_EXTENSION__: any
  const controller: _Controller
}

export default IMVC

namespace IMVC {

  export type Controller = _Controller
  export type Action = Relite.Action<State>
  export type Actions = Relite.Actions<State>
  export type CurryingActions = Relite.CurringActions<State, Actions>
  
  export interface Req extends express.Request {
    basename?: string
    serverPublicPath?: string
    publicPath?: string
  }
  
  export interface Res extends express.Response {
    sendResponse: express.Send
    renderPage: any
  }
  
  export interface RequestHandler {
    (req: Req, res: Res, next: express.NextFunction): any
  }
  
  export interface NativeModule extends NodeModule {
    hot?: {
      accept: Function
    }
  }


  export interface BaseViewFC extends React.FC<ViewProps> {
    viewId?: any
  }

  export interface BaseViewClass extends React.ComponentClass<ViewProps> {
    viewId?: any
  }

  export interface GulpConfigItem {
    src: string[],
    dest: string
  }

  export interface GulpTaskConfig {
    // 需要压缩到 static 目录的 css
    css: GulpConfigItem
    // 需要压缩到 static 目录的 html
    html: GulpConfigItem

    img: GulpConfigItem
    // 需要压缩到 static 目录的 js
    js: GulpConfigItem

    es5: GulpConfigItem
    // 需要复制到 static 目录的非 html, css, js 文件
    copy: GulpConfigItem
    // 需要复制到 publish 目录的额外文件
    publishCopy: GulpConfigItem
    // 需要编译到 publish 目录的额外文件
    publishBabel: GulpConfigItem

    [propName: string]: GulpConfigItem
  }
  
  export interface Render<E = string> extends createApp.RenderTo<E> {
    (
      view: React.ReactElement,
      container?: Element | null,
      controller?: Controller
    ): void
  }

  export interface RenderToNodeStream<E = string> extends createApp.RenderTo<E> {
    (
      view: E,
      controller?: Controller
    ): Promise<{}>
  }

  export interface RenderToString<E = string> extends createApp.RenderTo<E> {
    (
      view: E,
      controller?: Controller
    ): void
  }

  export interface ViewEngine extends createApp.ViewEngine {
    render: Render
  }
  
  export interface AppSettings extends createApp.Settings {
    hashType?: string, // hash history 显示的起点缀，默认是 !
    container?: string // react 组件渲染的容器
    cacheAmount?: number
    basename?: string
  }
  
  interface GulpConfig {
    // 需要压缩到 static 目录的 css
    css?: string[]
    // 需要压缩到 static 目录的 html
    html?: string[]
  
    img?: string[]
    // 需要压缩到 static 目录的 js
    js?: string[]
  
    es5?: string[]
    // 需要复制到 static 目录的非 html, css, js 文件
    copy?: string[]
    // 需要复制到 publish 目录的额外文件
    publishCopy?: string[]
    // 需要编译到 publish 目录的额外文件
    publishBabel?: string[]
  
    [propName: string]: string[] | undefined
  }
  
  export interface Views {
    beautify: boolean // 是否美化 html 响应内容
    transformViews: boolean // 默认不转换 view，已经有 babel 做处理
  }
  
  export interface BodyParseOptions {
    [functionName: string]: {
      [propName: string]: any
    }
  }

  export interface Alias {
    [propName: string]: string
  }

  interface OptionsMore {
    config?: string | Partial<Config>
  }

  export type Options = OptionsMore & Partial<typeof yargs.argv>

  export interface BabelConfig  {
    filename?: string,
    filenameRelative?: string,
    presets?: any[],
    plugins?: any[],
    highlightCode?: boolean,
    only?: string | string[],
    ignore?: string | string[],
    auxiliaryCommentBefore?: any,
    auxiliaryCommentAfter?: any,
    sourceMaps?: any,
    inputSourceMap?: any,
    sourceMapTarget?: any,
    sourceFileName?: any,
    sourceRoot?: any,
    moduleRoot?: any,
    moduleIds?: any,
    moduleId?: any,
    getModuleId?: any,
    resolveModuleSource?: any,
    keepModuleIdExtesions?: boolean,
    code?: boolean,
    ast?: boolean,
    compact?: any,
    comments?: boolean,
    shouldPrintComment?: any,
    env?: any,
    retainLines?: boolean
    babelrc?: any
  }
  
  export interface GetBabelFunc {
    (isServer: boolean): BabelConfig 
  }

  export interface RenderProps {
    description?: string
    keywords?: string
    title?: string
    content: string
    initialState?: object
    appSettings: AppSettings
    publicPath: string
    assets: {
      vendor: string
      index: string
    }
  }


  export interface ViewProps {
    key?: string
    state?: State
    handlers?: Handlers
    actions?: CurryingActions
  }
  
  export interface Config {
    /**
     * node.js 应用部署的 basename，默认是空字符串
     * 支持传入字符串 如，'/my/basename'
     * 支持传入数组，当传入为数组时，在运行时动态确定所匹配的 basename
     */
    basename: string
    /**
     * html 文档的 title
     */
    title: string
    /**
     * html 文档的 description
     */
    description: string
    /**
     * html 文档的 keywords
     */
    keywords: string
    /**
     * 服务端渲染的 content，默认为空
     */
    content: string
    /**
     * 全局生效的初始化 state，如果配置了，每个页面都会带上它
     */
    initialState?: object
    /**
     * client app settings
     */
    appSettings?: AppSettings
    /**
     * react-imvc app 所在的根目录
     * 默认是 cwd
     */
    root: string
    /**
     * page 源代码的目录
     * 默认是 src
     */
    src: string
    /**
     * server 源代码的目录
     * 默认为空
     * 注意：express view path 也将被设置成 config.routes
     */
    routes: string
    /**
     * 源码构建后的目录名（生产环境跑的代码目录）
     * 默认是 publish
     */
    publish: string
    /**
     * 源码里的静态资源构建后的目录名，该目录会出现在 publish 字段配置的目录下
     * 默认是 static，即静态资源会出现在 /publish/static 目录下
     */
    static: string
    /**
     * node.js 静态资源服务的路径
     * 默认是 /static
     */
    staticPath: string
    /**
     * hash history 的 spa 入口文件名，它将出现在 /static 目录下
     * 如果设置了 staticEntry，react-imvc 在 build 阶段，使用关闭 SSR 的模式启动一次 react-imvc app
     * 并访问 /__CREATE_STATIC_ENTRY__ 路径，将它的 html 响应内容作为静态入口 html 文件内容生成。
     */
    staticEntry: string
  
    /**
     * express.static(root, options) 的 options 参数
     * http://expressjs.com/en/4x/api.html#express.static
     */
    staticOptions: serveStatic.ServeStaticOptions
    /**
     * 静态资源的发布路径，默认为空，为空时运行时修改为 basename + staticPath
     * 可以将 /publish/static 目录发布到 CDN，并将 CDN 地址配置成 publicPath
     */
    publicPath: string
    /**
     * restapi basename
     * 默认为空
     * 如果配置了这个属性，controller.fetch 方法将为非绝对路径 url 参数，补上 restapi 作为前缀。
     */
    restapi: string
    serverRestapi?: string
    /**
     * webpack 资源表所在的路径，相对于 webpack 的 output.path
     * react-imvc 默认使用 hash 作为静态资源 js 的文件名
     * 所以它需要生成一份 assets.json 表，匹配 vendor, index 等文件的 mapping 关系
     */
    assetsPath: string
    /**
     * webpack output 自定义配置
     * 默认为空
     */
    output: webpack.Output
    /**
     * webpack 生产环境构建时的自定义 output 配置
     * 默认为空
     */
    productionOutput: webpack.Output
    /**
     * webpack alias 自定义配置
     */
    alias: Alias
    /**
     * webpack devtool 配置
     */
    devtool: webpack.Options.Devtool | ''
  
    /**
     * 是否开启 webpack 的构建产物进行可视化分析
     * 默认不开启
     */
    bundleAnalyzer: boolean
    /**
     * 是否使用 webpack-dev-middleware 代理静态资源
     * 默认在开发模式时开启
     */
    webpackDevMiddleware: boolean
  
    /**
     * webpack plugins 自定义配置
     * 默认为空
     */
    webpackPlugins: webpack.Plugin[]
    /**
     * webpack loaders 自定义配置
     * 默认为空
     */
    webpackLoaders: webpack.RuleSetRule[]
  
    /**
     * 是否输出 webpack log 日志
     */
    webpackLogger: webpack.Stats.ToStringOptions
  
    // babel config
    babel: GetBabelFunc
  
    gulp: GulpConfig
  
    /**
     * express 中间件 cookie-parser 的自定义配置
     * 默认为空
     */
    cookieParser: cookieParser.CookieParseOptions
  
    /**
     * express 中间件 helmet 的自定义配置
     * 默认为空 frameguard = true
     */
    helmet: helmet.IHelmetConfiguration
  
    /**
     * express 中间件 compression 的自定义配置
     * 默认为空
     */
    compression: compression.CompressionOptions
  
    /**
     * express view engine 的自定义配置
     */
    ReactViews: Views
    /**
     * express 中间件 bodyParse 配置
     */
    bodyParser: BodyParseOptions
    /**
     * express logger 配置
     * 默认在开发阶段使用 dev，生产阶段不使用
     */
    logger: 'dev' | null
    /**
     * express favicon 中间件的配置
     * 默认没有 favicon
     */
    favicon: string
    /**
     * 是否开启 IMVC SSR 功能
     * 默认开启
     */
    SSR: boolean
    /**
     * node.js server 监听的端口号
     * 默认跟着 ENV 环境变量走，或者 3000
     */
    port: number | string
    /**
     * node.js 的环境变量备份
     */
    NODE_ENV: string
  
    /**
     * IMVC 的 layout 组件所在的路径
     * 默认为空
     * 当设置为相对路径时，基于 routes 配置的 path
     */
    layout: string
    /**
     * React SSR 时采用的渲染模式：renderToString || renderToNodeStream
     *
     */
    renderMode: 'renderToNodeStream' | 'renderToString'
    /**
     * IMVC APP 里的 context 参数
     * server 端和 client 端都会接收到 config.context 里的配置
     * 默认为空
     */
    context: Context
  
    /**
     *  是否开启开发阶段的系统提示功能
     */
    notifier: boolean
    /**
     * 热更新开关 默认关闭
     */
    hot: boolean
    /**
     * 是否使用 server.bundle.js 代替 src/index 作为服务端访问的代码入口
     * 默认 false 兼容以前的默认行为
     */
    useServerBundle: boolean
  
    /**
     * 使用 fork-ts-checker-webpack-plugin 进行类型检查
     */
    useTypeCheck: boolean
  
    /**
     * 打包出来的服务端 bundle 的文件名
     */
    serverBundleName: string
    /**
     * 性能优化配置
     */
    performance?: webpack.Options.Performance
    /**
     * webpack配置处理
     */
    webpack?: (
      result: webpack.Configuration,
      isServer: boolean
    ) => webpack.Configuration
    /**
     * 编译入口
     */
    entry?: string | string[] | webpack.Entry | webpack.EntryFunc
  }

  type ObjectAlias = object;

  export interface State extends ObjectAlias {
    location?: createApp.Location
    basename?: string
    publicPath?: string
    restapi?: string
    hasError?: boolean
    html?: object
  }

  export interface Model {
    initialState?: State
    [propName:string]: any
  }

  export interface Preload  {
    [propName:string]: string
  }

  export type API = Record<string, string>

  export interface Payload {
    [propName:string]: any 
  }

  export interface Location {
      // path?: any
      key?: string
      action: string
      basename: string
      hash: string
      params: object
      pathname: string
      pattern: string
      query: object
      raw: string
      search: string
      state: any
      [propName: string]: any
  }

  export interface Context extends createApp.Context {
      basename?: string
      env?: string
      preload?: Payload
      publicPath?: string
      location?: Location
      restapi?: string
      userInfo?: object
      [propName: string]: any
  }

  export interface Handlers {
      [handleName: string]: Handler
  }

  interface Handler {
      (...args: any[]):any
  }

  export interface Meta {
      key?: string | null
      hadMounted: boolean
      id: number
      isDestroyed: boolean
      unsubscribeList: any
  }

  export interface Loader {
      (...args: any[]):any
  }

  export interface Routes {
      [index: number]: Route
  }

  export interface Route {
      path: string,
      controller: Controller
  }

  export interface Store extends Relite.Store<object, Record<string, Relite.Action<object>>> {
  }
}