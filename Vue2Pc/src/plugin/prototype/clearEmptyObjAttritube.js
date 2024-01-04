export default {
  install(Vue, options) {
    Vue.prototype.$clearEmptyObjAttritube = obj => {
      const tempObj = {}
      for (const variable in obj) {
        if (obj.hasOwnProperty(variable)) {
          const temp = obj[variable]
          if (temp !== '' && temp !== null && temp !== undefined) {
            tempObj[variable] = temp // 过滤空属性拿到有值的数组
          }
        }
      }
      return tempObj
    }
  }
}
