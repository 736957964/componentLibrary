<template>
  <div class="select-time-range">
    <!--2023-09-18-->
    <!-- title 标题 showToolbar 是否显示顶部栏 columns 渲染数据
confirm	点击完成按钮时触发 所有列选中值  cancel 点击取消按钮时触发
change 选项改变时触发   loading 是否显示加载状态 show-toolbar 是否显示顶部栏
confirm-button-text	确认按钮文字 cancel-button-text	取消按钮文字
readonly 是否为只读状态，只读状态下无法切换选项  visible-item-count 可见的选项个数 默认6
item-height	选项高度，支持 px vw vh rem 单位，默认 44px
swipe-duration	快速滑动时惯性滚动的时长，单位 ms 默认 1000ms
-->
    <van-picker
      ref="picker"
      :title="title"
      :show-toolbar="showToolbar"
      :columns="columns"
      :confirm-button-text="confirmButtonText"
      :cancel-button-text="cancelButtonText"
      :loading="loading"
      :readonly="readonly"
      :item-height="itemHeight"
      :visible-item-count="visibleItemCount"
      :swipe-duration="swipeDuration"
      @confirm="onConfirm"
      @cancel="onCancel"
      @change="onChange"
    >
      <template slot="default">
        <slot name="default" />
      </template>
      <template slot="title">
        <slot name="title" />
      </template>
      <template slot="confirm">
        <slot name="confirm" />
      </template>
      <template slot="cancel">
        <slot name="cancel" />
      </template>
      <template slot="option">
        <slot name="option" />
      </template>
      <template slot="columns-top">
        <slot name="columns-top" />
      </template>
      <template slot="columns-bottom">
        <slot name="columns-bottom" />
      </template>
    </van-picker>
  </div>
</template>

<script>
export default {
  name: 'VanDatePicker',
  props: {
    value: { type: [Date, String], default: () => new Date() },
    minDate: { type: Date, default: () => new Date(new Date().getFullYear() - 10, 0, 1) },
    maxDate: { type: Date, default: () => new Date(new Date().getFullYear() + 10, 0, 1) },
    showToolbar: { type: Boolean, default: () => true }, // 是否显示顶部栏
    title: { type: String, default: () => '时间选择器' }, // 标题
    confirmButtonText: { type: String, default: () => '确认' }, // 确认按钮文字
    cancelButtonText: { type: String, default: () => '取消' }, // 取消按钮文字
    loading: { type: Boolean, default: () => false }, // 是否显示加载状态
    readonly: { type: Boolean, default: () => false }, // 是否为只读状态，只读状态下无法切换选项
    itemHeight: { type: Number || String, default: () => 44 }, // 选项高度  支持 px vw vh rem 单位 默认px
    visibleItemCount: { type: Number || String, default: () => 6 }, // 可见的选项个数 默认6
    swipeDuration: { type: Number || String, default: () => 1000 }, // 快速滑动时惯性滚动的时长，单位 ms 默认 1000ms
    type: { type: String, default: 'dateRange' }, // date日期  dateRange 日期范围
    format: { type: String, default: 'yyyy-MM-dd' } // 配置日期显示 yyyy 或者 yyyy-MM 或者 yyyy-MM-dd
    // yyyy-MM-dd-HH-mm-ss
  },
  data() {
    return {
      monthArr: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
      dayArr: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31']
      // minuteArr: [],
      // secondArr: []
    }
  },
  computed: {
    columns: function() {
      const date = !this.value.getFullYear && this.value.split('-')
      const minYear = this.minDate.getFullYear()
      const maxYear = this.maxDate.getFullYear()
      const year = this.value.getFullYear ? this.value.getFullYear() : date[0]
      const month = this.value.getMonth ? this.value.getMonth() : date[1]
      const day = this.value.getDate ? this.value.getDate() : date[2]
      // const hours = this.value.getHours ? this.value.getHours() : date[3]
      // const minute = this.value.getMinutes ? this.value.getMinutes() : date[4]
      // const seconds = this.value.getSeconds ? this.value.getSeconds() : date[5]
      const yearArr = []
      let i = 0
      while (i < maxYear - minYear + 1) {
        yearArr.unshift((maxYear - i) + '')
        i++
      }
      const monthIndex = this.value.getMonth ? month : month - 1 // 拿日期的话正常index 赋值的话 位置需要-1
      const format = this.format
      let columns = []// 这里的 values 都是一个数组 每列显示的数据 defaultIndex 为初始的索引 默认为0
      format.includes('yyyy') ? columns.push({ values: yearArr, defaultIndex: Math.floor(year) - minYear }) : ''
      format.includes('MM') ? columns.push({ values: this.monthArr, defaultIndex: Math.floor(monthIndex) }) : ''
      format.includes('dd') ? columns.push({ values: this.dayArr, defaultIndex: Math.floor(day - 1) }) : ''
      if (this.type === 'dateRange') {
        columns = columns.concat([
          { values: ['-'] }
        ])
        format.includes('yyyy') ? columns.push({ values: yearArr, defaultIndex: Math.floor(year) - minYear }) : ''
        format.includes('MM') ? columns.push({ values: this.monthArr, defaultIndex: Math.floor(monthIndex) }) : ''
        format.includes('dd') ? columns.push({ values: this.dayArr, defaultIndex: Math.floor(day - 1) }) : ''
      }
      return columns
    }
  },
  watch: {},
  mounted() {
    this.init()
  },
  methods: {
    async init() {
      const minute = []
      const second = []
      for (let i = 0; i < 60; i++) {
        minute.push(i + '时')
        second.push(i + '分')
      }
      this.minuteArr = minute
      this.secondArr = second
    },
    // 重置数值(用来外部触发) 传值必传
    doReset(val) {
      this.setValues(val)
    },
    // 获取当前选择的值
    async getValues() {
      return this.$refs.picker.getValues()
    },
    // 设置当前的数据
    async setValues(arr) {
      this.$refs.picker.setValues(arr)
    },
    onConfirm(value, index) {
      // console.log(`当前值：${value}, 当前索引：${index}`)
      this.$emit('confirm', value, index)
    },
    onChange(picker, value, index) {
      // console.log(`当前值：${value}, 当前索引：${index}`)
      const _this = this
      const minMonth = this.minDate.getMonth()
      const minDay = this.minDate.getDate()
      const maxMonth = this.maxDate.getMonth()
      const maxDay = this.maxDate.getDate()
      const d = new Date(value[0], value[1], 0)
      const format = this.format
      setDate(0)
      setDate(4)
      function setDate(i) {
        // 最小年份
        if (value[i] - 0 === _this.minDate.getFullYear()) {
          format.includes('MM') ? picker.setColumnValues(i + 1, _this.monthArr.slice(minMonth)) : ''
          let strMinM = ''
          if (minMonth < 9) {
            strMinM = '0' + (minMonth + 1)
          } else {
            strMinM = strMinM + 1 + ''
          }
          format.includes('MM') ? picker.setColumnValue(i + 1, value[i + 1] - 1 < minMonth ? strMinM : value[i + 1]) : ''
          if (format.includes('dd')) {
            if (index === i && value[i + 1] - 1 < minMonth) {
              picker.setColumnValues(i + 2, _this.dayArr.slice(minDay - 1, d.getDate()))
              picker.setColumnValue(i + 2, value[i + 2] < minDay ? minDay.toString() : value[i + 2])
            } else {
              if (value[i + 1] - 1 === _this.minDate.getMonth()) {
                picker.setColumnValues(i + 2, _this.dayArr.slice(minDay - 1, d.getDate()))
                picker.setColumnValue(i + 2, value[i + 2] < minDay ? minDay.toString() : value[i + 2])
              } else {
                picker.setColumnValues(i + 2, _this.dayArr.slice(0, d.getDate()))
                picker.setColumnValue(i + 2, value[i + 2] > d.getDate() ? d.getDate().toString() : value[i + 2])
              }
            }
          }
        }
        // 最大年份
        else if (value[i] - 0 === _this.maxDate.getFullYear()) {
          format.includes('MM') ? picker.setColumnValues(i + 1, _this.monthArr.slice(0, maxMonth + 1)) : ''
          let strManM = ''
          if (maxMonth < 9) {
            strManM = '0' + (maxMonth + 1)
          } else {
            strManM = maxMonth + 1 + ''
          }
          format.includes('MM') ? picker.setColumnValue(i + 1, value[i + 1] - 1 > maxMonth ? strManM : value[i + 1]) : ''
          if (format.includes('dd')) {
            if (index === i && value[i + 1] - 1 > maxMonth) {
              picker.setColumnValues(i + 2, _this.dayArr.slice(0, maxDay))
              picker.setColumnValue(i + 2, value[i + 2] > maxDay ? maxDay.toString() : value[i + 2])
            } else {
              if (value[i + 1] - 1 === _this.maxDate.getMonth()) {
                picker.setColumnValues(i + 2, _this.dayArr.slice(0, maxDay))
                picker.setColumnValue(i + 2, value[i + 2] > maxDay ? maxDay.toString() : value[i + 2])
              } else {
                picker.setColumnValues(i + 2, _this.dayArr.slice(0, d.getDate()))
                picker.setColumnValue(i + 2, value[i + 2] > d.getDate() ? d.getDate().toString() : value[i + 2])
              }
            }
          }
        } else { // 其他年份
          if (format.includes('MM')) {
            picker.setColumnValues(i + 1, _this.monthArr)
            picker.setColumnValue(i + 1, value[i + 1])
          }
          if (format.includes('dd')) {
            picker.setColumnValues(i + 2, _this.dayArr.slice(0, d.getDate()))
            picker.setColumnValue(i + 2, value[i + 2] > d.getDate() ? d.getDate().toString() : value[i + 2])
          }
        }
      }

      const finallyVal = picker.getValues()
      const len = Math.floor(finallyVal.length / 2)
      // 开始时间不大于结束时间
      if (finallyVal.slice(0, len).join('') > finallyVal.slice(len + 1).join('')) {
        picker.setValues([...finallyVal.slice(0, len), '-', ...finallyVal.slice(0, len)])
        if (new Date(finallyVal.slice(0, len).join('-') + ' 00:00:00').getTime() === this.maxDate.getTime()) {
          format.includes('MM') ? picker.setColumnValues(5, _this.monthArr.slice(0, maxMonth + 1)) : ''
          format.includes('dd') ? picker.setColumnValues(6, _this.dayArr.slice(0, maxDay)) : ''
        }
      }
      this.$emit('change', picker, finallyVal, index)
    },
    onCancel() {
      // console.log('取消');
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped lang="scss">
  .select-time-range{
    margin-top: 20px;
  }
</style>
