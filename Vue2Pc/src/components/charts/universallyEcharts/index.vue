<!-- 所有的图表参数通过 option来传递-->
<template>
  <div :id="id" :ref="id" style="height:100%;width:100%" />
</template>

<script>
import * as echarts from 'echarts'
export default {
  name: 'Index',
  props: {
    id: {
      type: String,
      default: 'chart'
    },
    option: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      chart: '',
      drawTiming: ''
    }
  },
  watch: {
    option(newVal) {
      this.initChart()
    }
  },
  mounted() {
    window.addEventListener('resize', this.resize) // 监听浏览器窗⼝变化，实时获取该窗⼝的宽度和⾼度
    this.chart = echarts && echarts.init(document.getElementById(this.id))
    this.chart.on('click', (e) => {
      this.$emit('click', e)
    })
    this.initChart()
  },
  // 关闭后 销毁图表
  beforeDestroy() {
    window.addEventListener('resize', this.resize)
    if (!this.chart) { return }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    // 初始化图表
    initChart() {
      this.chart.setOption(this.option)
    },
    // 游览器分辨率变化的时候适配图表
    resize() {
      clearTimeout(this.drawTiming) // 取消 setTimeout() 方法设置的定时操作。 这里是为了防拖动的时候重复执行
      this.drawTiming = setTimeout(() => {
        this.chart && this.chart.resize()
      }, 100)
    }
  }
}
</script>

<style scoped>

</style>
