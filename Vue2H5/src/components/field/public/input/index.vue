<!--
可以使用 v-model绑定  也可以单独使用 defaultVal 赋值回显 @success="($event)=>{$set(ruleForm,'XXXXXXXXX',$event)}"
单独使用 defaultVal  itemField的接收参数不能是计算属性
requiredFlag 是否显示必填红*   actionAttribute 为 3禁用属性
禁用的 disabled 和requiredFlag同时存在时  优先 disabled
type 为 textarea 才可使用多行属性 row   number-数字  digit 正整数
rulesType 快速校验 1 身份证号 2 联系电话  优先级大于 rules
-->
<template>
  <van-field
    v-model="inputVal"
    :rules="_itemField.rules "
    :label="_itemField.fieldDesc"
    :placeholder="_itemField.placeholder"
    :disabled="_itemField.disabled || disabled"
    :type="_itemField.type"
    :row="_itemField.row"
    :maxlength="_itemField.maxlength"
  >
    <template #label>
      <span v-if="!!itemField.requiredFlag && !attrIncludes(itemField, '3')" class="van-cell--require">*</span>
      <span>{{ _itemField.fieldDesc }}</span>
    </template>
  </van-field>
</template>

<script>
import formField from '../../mixins/formField'
import { validateIdNoFn, validatePhoneFn } from '../../mixins/validator'
export default {
  name: 'Index',
  mixins: [formField],
  data() {
    return {
      inputVal: '',
      setRules: ''
    }
  },
  computed: {
    _itemField() {
      return {
        fieldDesc: this.label, // 名称
        rules: [{ required: this.itemField.requiredFlag || false, message: `请输入${this.itemField.fieldDesc || this.label}` }], // 设置的校验
        placeholder: `请输入${this.itemField.fieldDesc || this.label}`,
        ...this.itemField,
        ...this.setRules ? { rules: this.setRules } : {} // 强行覆盖rules校验 用于rulesType的配置
      }
    }
  },
  watch: {
    inputVal(val) {
      this.setData(val)
    },
    '_itemField.rulesType': {
      handler(val) {
        switch (val) {
          case 1: // 身份证号
            this.setRules = validateIdNoFn()
            break
          case 2: // 联系电话
            this.setRules = validatePhoneFn()
            break
          default:break
        }
      },
      immediate: true
    }
  },
  methods: {
    changeValue(val) {
      if (['number', 'digit'].includes(this._itemField.type) && typeof val === 'string' && val !== '') {
        // 最后一位是 .  或者  是小数  且最后一个是0的时候不进行数值转化 避免无法输入
        if (val.substr(val.length - 1, 1) !== '.' && !(val.includes('.') && ['0'].includes(val.substr(val.length - 1, 1)))) {
          this.inputVal = val / 1
        }
      } else {
        this.inputVal = val
      }
    }
  }
}
</script>

<style scoped lang="scss">

</style>
