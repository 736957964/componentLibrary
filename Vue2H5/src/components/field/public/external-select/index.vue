<!--
该选择器为外部选择按钮
可以使用 v-model绑定  也可以单独使用 defaultVal 赋值回显
单独使用 defaultVal  itemField的接收参数不能是计算属性
requiredFlag 是否显示必填红*   actionAttribute 为 ['3'] 禁用属性
fieldOptions:[{name:'选项1',value:1}]
weakType 1  弱类型  value值 数字转字符串  2 字符串转数字 3 type 为 checkbox多选的时候用  数组转字符串 [1,2,3]=>'1,2,3'
type 为 checkbox 多选
-->
<template>
  <div>
    <van-field
      v-model="_itemField.defaultVal"
      readonly
      :rules="_itemField.rules"
      :disabled="_itemField.disabled || disabled"
      name="radio"
    >
      <template #label>
        <span v-if="!!itemField.requiredFlag && !attrIncludes(itemField, '3')" class="van-cell--require">*</span>
        <span>{{ _itemField.fieldDesc }}</span>
      </template>
      <template #input>
        <van-radio-group v-model="radioVal" direction="horizontal" :disabled="_itemField.disabled || attrIncludes(itemField, '3')">
          <van-radio v-for="(item,val) in selectColumns" :key="val" :name="item.value">
            {{ item.name }}
          </van-radio>
        </van-radio-group>
      </template>
    </van-field>
  </div>
</template>

<script>
import formField from '../../mixins/formField'

export default {
  name: 'Index',
  mixins: [formField],
  data() {
    return {
      // 下拉选择器配置文件
      selectColumns: [],
      radioVal: '', // 单选值
      radioValList: [] // 多选值
    }
  },
  computed: {
    _itemField() {
      return {
        fieldDesc: this.label,
        rules: [{ required: this.itemField.requiredFlag || false, message: `请输入${this.itemField.fieldDesc || this.label}` }], // 设置的校验
        placeholder: `请选择${this.itemField.fieldDesc || this.label}`,
        ...this.itemField
      }
    }
  },
  watch: {
    radioVal(val) {
      this.setData(val)
    },
    radioValList: {
      handler(val) {
        this.setData(val)
      },
      deep: true
    },
    '_itemField.fieldOptions': {
      handler(val) {
        this.selectColumns = val
        val && this.changeValue(this.value ?? this.itemField.defaultVal)
      },
      immediate: true
    }
  },
  methods: {
    changeValue(val) {
      if ([null, undefined].includes(val) && !this.itemField.bypassedNull) { return }
      switch (this.itemField.weakType) {
        case 1:Number.isInteger(val) ? this.itemField.defaultVal = JSON.stringify(val) : ''; break
        case 2:this.itemField.defaultVal = val / 1; break
        case 3: !Array.isArray(val) ? this.itemField.defaultVal = val.split(',') : ''; break
        default: break
      }
      Object.assign(this.itemField, {
        defaultVal: this.radioVal
      })
      if (this.itemField.type === 'checkbox') {
        this.radioValList = val
      } else {
        this.radioVal = val
      }
      const { fieldOptions, defaultVal } = this.itemField
      if (Array.isArray(defaultVal)) { // 多选情况的处理
        return this.getArrEqual(fieldOptions, defaultVal)
      } else {
        // 过滤出符合value的对象
        const parmes = fieldOptions && fieldOptions.find((item) => item.value === defaultVal)
        return parmes ? parmes.name : defaultVal
      }
    }
  }
}
</script>

<style scoped lang="scss">

</style>
