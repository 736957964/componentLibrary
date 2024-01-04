<template>
  <div ref="telescopicAssembly" class="telescopicAssembly">
    <el-tooltip :offset="offset" :hide-after="hideAfter" :append-to-body="appendToBody" :disabled="!isShow" :content="getContent" :placement="placement" :open-delay="openDelay">
      <div ref="assemblyText" :class="textCenter?'textCenter assemblyText':'assemblyText'" :style="textColor?{color:textColor}:{}" @mouseover="mouseover" @mouseout="mouseout">{{ textData }}</div>
    </el-tooltip>
    <!--这个插槽是用来放不需要进行省略处理文字的 比如  输入框 : 这里的：就不需要进行省略显示-->
    <slot />
  </div>
</template>

<script>
// 文本提示框,目前默认只有显示省略号的才显示
export default {
  name: '',
  filters: {
    ellipsis(value) {
      return false
    }
  },
  props: {
    hideAfter: { type: Number, default: 0 }, // 出现后自动隐藏延时 单位毫秒，为 0 则不会自动隐藏
    offset: { type: Number, default: 0 },
    appendToBody: { type: Boolean, default: true },
    // 显示的数据
    textData: { type: null, default: '' },
    // 设置最小宽度
    minWidth: { type: Number, default: 30 },
    // 设置最大宽度,超出部分显示省略号 0不生效
    maxWidth: { type: Number, default: 0 },
    // 设置lin的高度 0不生效
    lineHeight: { type: Number, default: 0 },
    // 判定没有溢出的文字是否显示,默认不显示
    noOverflowShow: { type: Boolean, default: false },
    // 默认为 top 顶部显示 具体方位看 el-tooltip 组件
    placement: { type: String, default: 'top' },
    // 打开延迟的毫秒数
    openDelay: { type: Number, default: 0 },
    // 大小宽度特殊处理 手动配置 maxWidth（为true时 maxWidth属性无效,部分特殊情况宽度没办法自动显示省略号 手动配置宽度）
    specialSize: { type: Boolean, default: false },
    // 固定的提示语
    promptText: { type: String, default: '' },
    // 文字显示的颜色
    textColor: { type: String, default: '' },
    // 文字剧中对齐
    textCenter: { type: Boolean, default: false }
  },
  data() {
    return {
      isShow: false // 用来判定是否显示提示框
    }
  },
  computed: {
    getContent() {
      const textData = this.textData
      if (this.promptText) {
        return this.promptText
      } else {
        return typeof (textData) === 'string' ? textData : JSON.stringify(textData)
      }
    }
  },
  watch: {
  },
  created() {
    this.initialization()
  },
  methods: {
    async initialization() {
      await this.$nextTick
      if (this.specialSize) { // 手动获取宽度
        // 可以通过 offsetWidth 来获取dom元素的实际宽度
        // 大小宽度特殊处理 手动配置 maxWidth（为true时 maxWidth属性无效,部分特殊情况宽度没办法自动显示省略号 手动配置宽度）
        await this.$emit('specialSize', (getSize) => { this.$refs.assemblyText.style.maxWidth = `${getSize.maxWidth}px` })
      } else { // 自定义统一的宽度
        if (this.$props.maxWidth) { this.$refs.assemblyText.style.maxWidth = `${this.$props.maxWidth}px` }
      }
      if (this.$props.minWidth) { this.$refs.assemblyText.style.minWidth = `${this.$props.minWidth}px` }
      if (this.$props.lineHeight) { this.$refs.assemblyText.style.lineHeight = `${this.$props.lineHeight}px` }
    },
    // 鼠标移入的时候
    mouseover(evt) {
      if (this.$props.noOverflowShow || this.$refs.assemblyText.scrollWidth > this.$refs.assemblyText.clientWidth) {
        this.isShow = true
      }
    },
    // 鼠标移出的时候
    mouseout() {
      // this.isShow = false
    }
  }
}
</script>

<style scoped lang="scss">
.telescopicAssembly{
  display: flex;
  position: relative;
  .suspension{
    white-space: nowrap;
    background-color: #303133;
    position: absolute;
    color: white;
    top:-25px;
    left: -2px;
    z-index: 10;
    padding: 4px;
    border-radius: 5px;
    font-size: 12px;
  }
  .textCenter{
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .assemblyText{
    text-overflow: ellipsis;
    overflow: hidden;
    white-space:nowrap
  }
}
</style>
