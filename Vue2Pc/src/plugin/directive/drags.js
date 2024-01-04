// v-drags拖拽可传参 参数可为函数或对象 对象属性有 left, right, top, bottom, leftMultiple, rightMultiple, topMultiple, bottomMultiple 一旦有参数代表拖拽结束会进行停靠
// 函数 优先于 left, right, top, bottom 优先于 Multiple  Multiple 会按拖拽对象的大小来计算停靠宽度（方便适配各种机型）
// ps:尚未适配ie游览器
export default {
  install(Vue, options) {
    Vue.directive('drags', {
      bind: function(el, bingind, vnode, oldVnode) {
        // console.log(el, bingind, vnode)
        const dragDiv = el
        el.ontouchstart = (e) => { // 鼠标按下的时候
          if (typeof (bingind.value) === 'function') { bingind.value('ontouchstart', dragDiv) } // 如果传入函数按下的时候会触发一次函数
          // currentStyle 为ie属性 DOM标准里全局方法 getComputedStyle
          const sty = dragDiv.currentStyle || window.getComputedStyle(dragDiv, null)
          const changedTouches = e.changedTouches[0]
          // 鼠标按下，计算当前元素距离可视区的距离
          const disX = changedTouches.pageX - dragDiv.offsetLeft
          const disY = changedTouches.pageY - dragDiv.offsetTop
          // console.log('开始位置', changedTouches.pageX, changedTouches.pageY)
          document.ontouchmove = function (e) { // 鼠标移动的时候
            const changedTouches = e.changedTouches[0]
            // 移动当前元素
            dragDiv.style.left = `${changedTouches.clientX - disX}px`
            dragDiv.style.top = `${changedTouches.clientY - disY}px`
            // console.log('移动位置', `${changedTouches.clientX - disX}`, `${changedTouches.clientY - disY}`)
            // 设置拖动的样式
            // dragDiv.style.borderStyle = 'solid'; dragDiv.style.borderColor = 'red'; dragDiv.style.borderWidth = '3px'
          }
          document.ontouchend = function (e) { // 鼠标弹起的时候
            const changedTouches = e.changedTouches[0]
            const width = JSON.parse(sty.width.replace(/px/g, ''))
            const height = JSON.parse(sty.height.replace(/px/g, ''))
            // 清空拖动的样式
            // dragDiv.style.borderStyle = ''; dragDiv.style.borderColor = ''; dragDiv.style.borderWidth = ''
            let setBerth = null
            typeof (bingind.value) === 'function' ? setBerth = bingind.value : setBerth = keepBerth // 有传入函数就调用函数
            document.ontouchstart = null
            document.ontouchend = null
            document.ontouchmove = null
            if (bingind.value.left && bingind.value.right) {
              // > 靠左上  < 右下
              document.body.clientWidth / 2 > `${changedTouches.clientX - disX}` ? setBerth('left', dragDiv) : setBerth('right', dragDiv)
            } else if (bingind.value.left) {
              setBerth('left', dragDiv)
            } else if (bingind.value.right) {
              setBerth('right', dragDiv)
            }
            document.body.clientHeight / 2 > `${changedTouches.clientY - disY}` ? setBerth('top', dragDiv) : setBerth('bottom', dragDiv)
            function keepBerth(val) { // 没有传入函数的情况下会调用这个
              const { left, right, top, bottom, leftMultiple, rightMultiple, topMultiple, bottomMultiple } = bingind.value
              switch (val) {
                case 'left': if ((left || leftMultiple) !== undefined) { dragDiv.style.left = `${left || width * leftMultiple}px` } break
                case 'right': if ((right || rightMultiple) !== undefined) { dragDiv.style.left = `${document.body.clientWidth + (right || width * rightMultiple)}px` } break
                case 'top': if ((top || topMultiple) !== undefined) { dragDiv.style.top = `${top || height * topMultiple}px` } break
                case 'bottom': if ((bottom || bottomMultiple) !== undefined) { dragDiv.style.top = `${document.body.clientHeight + bottom || height * bottomMultiple}px` } break
                default:
              }
            }
            // console.log('结束位置', `${changedTouches.clientX - disX}`, `${changedTouches.clientY - disY}`)
          }
        }
      }
      // inserted: function() {
      //   console.log('2-insert')
      // },
      // update: function() {
      //   console.log('3-update')
      // },
      // componentUpdated: function() {
      //   console.log('4 - componentUpdated')
      // },
      // unbind: function() {
      //   console.log('5 - unbind')
      // }
    })
  }
}
