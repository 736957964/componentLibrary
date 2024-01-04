import axios from 'axios'
import { Message } from 'element-ui'
import util from '@/libs/util'
import router from '@/router'

import fileDownload from 'js-file-download'

// 创建一个错误
function errorCreate(msg) {
  const error = new Error(msg)
  errorLog(error)
  throw error
}
let resUuid = ''

// 显示错误
function errorLog(error) {
  // 打印到控制台
  if (process.env.NODE_ENV === 'development') {
    util.log.danger('>>>>>> Error >>>>>>')
    console.log(error)
  }
  // 显示提示
  Message({
    message: error.message,
    type: 'error',
    duration: 3 * 1000
  })
}
// 创建一个 axios 实例
const service = axios.create({
  baseURL:
    process.env.NODE_ENV === 'development' ? '/api' : process.env.VUE_APP_API,
  timeout: 30000 // 请求超时时间
})
// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const { url } = config
    // 在请求发送之前做一些处理
    const token = util.cookies.get('token') || sessionStorage.getItem('token')
    if (token) {
      config.headers['X-TOKEN'] = token
    }
    if (url === 'sso/app/logout' && token) {
      config.headers['logoutRequest'] = token
    }
    if (resUuid) {
      // 登录接口添加上uuid
      config.headers.uuid = resUuid
    }
    // 应用标识 0是首页系统设置 其他值是应用系统设置
    // const indexAppId = localStorage.getItem("indexAppId");
    config.headers.appId =
      // indexAppId ||
      router.currentRoute.params.appId ||
      router.currentRoute.query.appId ||
      '1'
    config.headers.affiliationAppType =
      process.env.VUE_APP_AFFILIATION_APP_TYPE
    // 客户端控制脱敏添加头信息 true | false
    config.headers['X-Desensitization'] =
      process.env.VUE_APP_XDESENSITIZATION === '1'
    return config
  },
  (error) => {
    // 发送失败
    console.log(error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const {
      headers: {
        'x-token': xToken,
        'content-disposition': contentDisposition,
        uuid
      },
      data: dataAxios
    } = response
    if (dataAxios?.data?.accessToken || xToken) {
      sessionStorage.setItem('token', dataAxios.data.accessToken || xToken)
      util.cookies.set('token', dataAxios.data.accessToken || xToken)
    }
    // 通过此字段有值，判断为文件下载
    if (contentDisposition) {
      fileDownload(
        response.data,
        // 这一波解析，能解决中文名乱码的问题
        decodeURI(escape(contentDisposition.split('=')[1]))
      )
      // 正常返回数据
      return dataAxios
    }

    // 验证码的逻辑处理，登录接口需要用到
    if (uuid) {
      resUuid = uuid
    }

    const { statusCode, data } = dataAxios
    switch (statusCode) {
      case 200 || undefined:
        return data
      case 401:
        util.goLoginPage(router.currentRoute)
        break
      // 验证码返回数据
      case undefined:
        return dataAxios
      case 10007:
        if (process.env.VUE_APP_ENV === 'production') {
          return dataAxios
        }
        errorCreate(`${dataAxios.msg}`)
        break
      default:
        errorCreate(`${dataAxios.msg}`)
        break
    }
  },
  (error) => {
    if (error && error.response) {
      switch (error.response.status) {
        case 400:
          error.message = '请求错误'
          break
        case 401:
          util.goLoginPage(router.currentRoute)
          error.message = '未授权，请登录'
          break
        case 403:
          error.message = '拒绝访问'
          break
        case 404:
          error.message = '请求地址出错'
          break
        case 408:
          error.message = '请求超时'
          break
        case 500:
          error.message = '服务器内部错误'
          break
        case 501:
          error.message = '服务未实现'
          break
        case 502:
          error.message = '网关错误'
          break
        case 503:
          error.message = '服务不可用'
          break
        case 504:
          error.message = '网关超时'
          break
        case 505:
          error.message = 'HTTP版本不受支持'
          break
        default:
          break
      }
    }
    if (process.env.VUE_APP_ENV === 'production') {
      return Promise.reject(error)
    }
    errorLog(error)
    return Promise.reject(error)
  }
)

export default service
