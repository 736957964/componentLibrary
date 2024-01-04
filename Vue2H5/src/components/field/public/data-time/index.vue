<!--
可以使用 v-model绑定  也可以单独使用 defaultVal 赋值回显 @success="($event)=>{$set(ruleForm,'XXXXXXXXX',$event)}"
单独使用 defaultVal  itemField的接收参数不能是计算属性
requiredFlag 是否显示必填红*   actionAttribute 为 3禁用属性
type 为 date 日期选择 dateRange 为日期范围选择 datetime 为年月日时分秒组件
-->
<template>
  <div>
    <van-field
      readonly
      :disabled="_itemField.disabled || disabled"
      clickable
      name="picker"
      :value="timeFrameText"
      :label="_itemField.fieldDesc"
      :placeholder="_itemField.placeholder"
      :rules="_itemField.rules"
      @click="selectClick({ itemField }, 1)"
    >
      <template #label>
        <span v-if="!!itemField.requiredFlag && !attrIncludes(itemField, '3')" class="van-cell--require">*</span>
        <span>{{ _itemField.fieldDesc }}</span>
      </template>
    </van-field>

    <van-popup v-model="selectTimeIsShow" position="bottom" get-container="body">
      <van-datetime-picker
        v-if="_itemField.type ==='datetime'"
        v-model="currentDate"
        type="datetime"
        title="选择完整时间"
        :min-date="itemField.minDate"
        :max-date="_itemField.maxDate"
        @confirm="selectTimeConfirm2"
      />
      <!--具体配置详情看组件-->
      <select-time-range
        v-else
        :title="_itemField.fieldDesc"
        :min-date="_itemField.minDate"
        :max-date="_itemField.maxDate"
        :show-toolbar="_itemField.showToolbar"
        :confirm-button-text="_itemField.confirmButtonText"
        :cancel-button-text="_itemField.cancelButtonText"
        :item-height="_itemField.itemHeight"
        :visible-item-count="_itemField.visibleItemCount"
        :loading="_itemField.loading"
        :readonly="disabled"
        :type="_itemField.type"
        :value="currentDate"
        @cancel="selectTimeIsShow = false"
        @confirm="selectTimeConfirm"
      />

    </van-popup>
  </div>
</template>

<script>
import selectTimeRange from './select-time-range'
import formField from '../../mixins/formField'
export default {
  name: 'Index',
  components: { selectTimeRange },
  mixins: [formField],
  data() {
    return {
      selectTimeIsShow: false,
      currentDate: new Date(),
      timeFrame: '', // 时间数据
      timeFrameText: ''// 时间显示
    }
  },
  computed: {
    _itemField() {
      return {
        minDate: new Date(1980, 0, 1),
        maxDate: new Date(2050, 10, 1),
        fieldDesc: this.label, // 名称
        placeholder: `请选择${this.itemField.fieldDesc || this.label}`,
        rules: [{ required: this.itemField.requiredFlag || false, message: `请选择${this.itemField.fieldDesc || this.label}` }], // 设置的校验
        ...this.itemField
      }
    }
  },
  watch: {
    'itemField': {
      handler() {
        !this.value ?? this.changeValue()
      },
      immediate: true,
      deep: true
    }
  },
  mounted() { },
  destroyed() { },
  methods: {
    changeValue(val) {
      this.timeFrame = val
      this.timeFrameText = val // 没处理显示格式化 后续如果有需要再补
    },
    // ['2022', '03', '01', '-', '2022', '03', '01']
    selectTimeConfirm(value, index) {
      this.selectTimeIsShow = false
      this.timeFrame = value.toString()
        .replace(/-/g, '#')
        .replace(/,/g, '-')
        .replace(/-#-/g, ',')
      this.changeValue(this.timeFrame)
      this.changeDefaultVal(this.timeFrame)
    },
    selectTimeConfirm2(value) {
      this.selectTimeIsShow = false
      let month = value.getMonth() + 1
      var day = value.getDate()
      var hours = value.getHours()
      var minut = value.getMinutes()
      if (month < 10) { month = '0' + month }
      if (day < 10) { day = '0' + day }
      if (hours < 10) { hours = '0' + hours }
      if (minut < 10) { minut = '0' + minut }
      this.timeFrame = `${value.getFullYear()}-${month}-${day} ${hours}:${minut}:00`
      this.changeValue(this.timeFrame)
      this.changeDefaultVal(this.timeFrame)
    },
    selectClick() {
      // 禁用
      if (this.attrIncludes(this.itemField, '3')) return
      this.selectTimeIsShow = true
    }
  }
}
</script>

<style scoped lang="scss">
::v-deep{
  .van-field__label{
    white-space:nowrap!important;
  }
}
.select-time{
  font-size: 14px;
  .select-title{
    margin-top: 2px;
    margin-bottom: 2px;
    background-color: #ffffff;
    color: black;
    border: rgb(128 140 187 / 30%) 1px solid;
    font-size: 16px;
    font-weight: bold;
  }
}
</style>
