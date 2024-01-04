<!--
可以使用 v-model绑定  也可以单独使用 defaultVal 赋值回显 @success="($event)=>{$set(ruleForm,'XXXXXXXXX',$event)}"
单独使用 defaultVal  itemField的接收参数不能是计算属性
requiredFlag 是否显示必填红*   actionAttribute 为 3禁用属性
禁用的 disabled 和requiredFlag同时存在时  优先 disabled
-->
<template>
  <div>
    <van-field
      v-model="formattedAddress"
      clickable
      readonly
      :rules="_itemField.rules "
      :label="_itemField.fieldDesc"
      :placeholder="_itemField.placeholder"
      :disabled="_itemField.disabled || disabled"
      :type="_itemField.type"
      :row="_itemField.row"
      :maxlength="_itemField.maxlength"
      @click="selectClick({ itemField })"
    >
      <template #label>
        <span v-if="!!itemField.requiredFlag && !attrIncludes(itemField, '3')" class="van-cell--require">*</span>
        <span>{{ _itemField.fieldDesc }}</span>
      </template>
    </van-field>
    <van-popup v-model="mapIsShow" position="bottom" get-container="body" :style="{ height: '90%' }">
      <mapHtml @mapSubmit="mapSubmit" />
      <div class="btn">
        <van-button
          type="default"
          size="large"
          round
          @click="mapIsShow=!mapIsShow"
        >取消</van-button>
        <van-button round type="info" size="large" @click="sure()">确定</van-button>
      </div>
    </van-popup>
  </div>
</template>

<script>
import formField from '../../mixins/formField'
import mapHtml from './map-html'
export default {
  name: 'Index',
  components: { mapHtml },
  mixins: [formField],
  props: {
    label: { type: String, default: '地点选择' }
  },
  data() {
    return {
      mapIsShow: false,
      defaultObj: { },
      formattedAddress: ''
    }
  },
  computed: {
    _itemField() {
      return {
        fieldDesc: this.label, // 名称
        rules: [{ required: !!this.itemField.requiredFlag || false, message: `请选择${this.itemField.fieldDesc || this.label}` }], // 设置的校验
        placeholder: `请选择${this.itemField.fieldDesc || this.label}`,
        ...this.itemField
      }
    }
  },
  watch: {
    'defaultObj'(val) {
      Object.assign(this.itemField, {
        defaultVal: this.defaultObj
      })
      this.changeDefaultVal(val) // 使用success更新数据
    }
  },
  methods: {
    // 使用v-model 绑定值来回显
    changeValue(val) {
      if (typeof val === 'string' && val !== '' && val.includes('{') && val.includes('}')) { val = JSON.parse(val) }
      this.formattedAddress = val.formattedAddress || val
    },
    selectClick() {
      // 禁用
      if (this.attrIncludes(this.itemField, '3')) return
      this.mapIsShow = true
    },
    mapSubmit(val) {
      this.defaultObj = val
    },
    sure() {
      this.mapIsShow = false
      this.formattedAddress = this.defaultObj.formattedAddress
      this.$emit('input', this.defaultObj.formattedAddress) // value值只绑定中文
      this.$emit('success', this.defaultObj)
    }
  }
}
</script>

<style scoped lang="scss">
  .btn{
    display: flex;
    margin-top: 20px;
  }
</style>
