// 2023-10-16
// 有些情况下 重置数据是null 这时候watch不会处理 需要设置 itemField.bypassedNull为true
export default {
  props: {
    value: {
      type: null,
      default: null
    },
    // 控件配置
    itemField: {
      type: Object,
      default: () => ({})
    },
    label: { type: String, default: '名称' },
    isDisabled: { type: Boolean, default: false }
  },
  watch: {
    value: {
      // 需要重置数据的情况下需要开启 bypassedNull
      handler(val) {
        (val !== null || this.itemField.bypassedNull) && Object.assign(this.itemField, {
          defaultVal: val
        });
        (val !== null || this.itemField.bypassedNull) && this.changeValue ? this.changeValue(val) : ''
      },
      immediate: true,
      deep: true
    }
  },
  computed: {
    disabled() { // 3为禁用
      return this.attrIncludes(this.itemField, '3')
    }
  },
  methods: {
    // 覆盖设置v-model和defaultVal的数据
    setData(val) {
      Object.assign(this.itemField, { defaultVal: val })
      this.changeDefaultVal(val) // 使用success更新数据
    },
    changeDefaultVal(val) {
      this.$emit('input', val)
      this.$emit('success', val)
    },
    /**
     * 操作属性的配置
     */
    attrIncludes(obj, key) {
      if (obj.actionAttribute) {
        return obj.actionAttribute.includes(key)
      } else {
        return false
      }
    }
  }
}
