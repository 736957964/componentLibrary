import confirm from './directive/drags'
// Vue.use(d2Admin) // 最后需要去main文件导入
export default {
  // 注册
  install(Vue, options) {
    Vue.use(confirm)
  }
}
