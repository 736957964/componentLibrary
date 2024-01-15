/*
computed: {
  lazyList() {
    return {
      initData: this.currentRowObj.left, // 初始化数据（必传）
      setFn: this._set, // 懒载的数据返回 自行赋值  _set(val) {this.dataList = val }, dataList 为渲染的懒数据
      pageSize: 3, // 初始页数
      currentPage: 20, // 一页翻多少条
      rootMargin:'100px' 距离多少间距触发(用来提前触发加载数据) 默认100px
    }
  }
},
*/

let make = null
class LazyList {
  constructor(el, binding,
    { total = 0, size = 0, iTime = null, oldInitData = null, type = null }
  ) {
    // setEl 自己传的父级dom
    this.el = el; this.binding = binding; this.bindingValue = binding.value
    oldInitData = this.bindingValue.initData
    this._data = {
      total, size, iTime, oldInitData, type
    }
    // 分发_data中的数据到this
    Object.keys(this._data).forEach((prop) => { this[prop] = this._data[prop] })
    this.iTime = setTimeout(() => { this.init(el, binding, { type: type }) }, 50)
  }
  async init(el, binding, vn) {
    const type = vn.type
    const { setFn, pageSize = 3, currentPage = 20 } = binding.value
    const initData = binding.value.initData
    if (this.oldInitData !== initData) {
      console.log('重置所有数据项,销毁之前的监听')
      clearTimeout(this.iTime)
      this.intersectionObserver?.unobserve(this.children)
      make = new LazyList(el, binding, { type })
      return
    } // 旧的数据不匹配了 翻倒全部东西重新构造
    const _size = pageSize + this.size
    if (this.total === _size * currentPage) { return }// 页数和总数一样的情况不能更新 因为这里重新调用init的时候会触发update 必须拦截掉
    this.total = _size * currentPage
    this.oldInitData = initData // 存储一下初始化时候的数据 用来判定数据是否被更新了
    const value = initData.slice(0, this.total)
    await setFn(value)
    const options = {
      root: this.el, // 相对于某个元素进行遮挡计算
      rootMargin: binding.value.rootMargin || '100px', // 进行计算的边界范围，通过rootMargin可以实现提前计算或延迟计算（相对于root原本尺寸）的效果
      threshold: 0.1 // 触发callback时的遮挡比例，0.5代表元素被遮挡50%时触发callback。由于浏览器事件循环机制的影响，callback触发时遮挡比例通常不会是精确的50%。
    }
    const _target = this.el.querySelectorAll('.el-table__row') || this.el.childNodes // el-table__row是用来适配el-table的
    this.children = _target[_target.length - 1]
    if (!this.children) { return }
    console.log(this.children, 'this.children', binding.value)
    const remainingQuantity = binding.value.initData.length - (pageSize + this.size) * currentPage
    this.intersectionObserver = new IntersectionObserver((entries, observer) => {
      // 和MutationObserver相同，也是产生一个array
      entries.forEach(entry => {
        // isIntersecting属性也可判断目标元素当前是否可见
        if (entry.intersectionRatio > 0) { // 通过entry.intersectionRatio属性
          console.log('剩余待加载数量：', remainingQuantity + pageSize)
          if (remainingQuantity <= 0) {
            console.log('剩余数量小于0 unobserve', type)
            observer.unobserve(this.children)
          } else {
            observer.unobserve(this.children)
            this.size++
            this.init(el, binding, { type })
          }
        }
      })
    }, options)
    if (remainingQuantity > 0) {
      console.log('进行observe', type, '剩余待加载数量：', remainingQuantity)
      this.intersectionObserver.observe(this.children)
      this.iTime = null
    }
  }
}
export default {
  install(Vue, options) {
    Vue.directive('lazyList', {
      // 初始化触发 只执行一次
      bind: function(el, binding, vnode, oldVnode) {
        make = new LazyList(el, binding, { type: 'bind' }) // 构造的时候会默认初始化init
      }, // 更新了数据就会触发
      update: function(el, binding) {
        clearTimeout(make.iTime)
        make.init(el, binding, { type: 'update' })
      },
      unbind: function() { }
    })
  }
}
