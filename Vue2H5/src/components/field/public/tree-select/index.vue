<!--
可以使用 v-model绑定  也可以单独使用 defaultVal 赋值回显
:prop-name.sync="ruleForm.goodsTypeName" 回显初始数据（显示数据）（必写）
单独使用 defaultVal  itemField的接收参数不能是计算属性
requiredFlag 是否显示必填红*   actionAttribute 为 ['3'] 禁用属性
fieldOptions:[{id:1,name:'选项1',value:1}]
(没写) weakType 1  弱类型  value值 数字转字符串  2 字符串转数字 3 type 为 checkbox多选的时候用  数组转字符串 [1,2,3]=>'1,2,3'
type 为 checkbox 多选(多选没写) radio 单选
lazy 懒加载(非懒加载没写)
treeApiDataFn 点击选项加载数据的时候 触发
-->
<template>
  <div class="tree-select">
    <template>
      <van-field
        :value="propName"
        readonly
        :disabled="_itemField.disabled || disabled"
        clickable
        name="picker"
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
      <van-popup v-model="showPicker" position="bottom" get-container="body" @close="close">
        <!--标题部分-->
        <div class="van-picker__toolbar">
          <button type="button" class="van-picker__cancel" @click="close">取消</button>
          <div class="van-picker__title">{{ _itemField.fieldDesc }}</div>
          <button type="button" class="van-picker__confirm" @click="onConfirm()">确定</button>
        </div>
        <!--内容部分-->
        <div class="checkbox-con">
          <van-radio-group v-model="cascadeValue">
            <treeHtml :item-field="_itemField" :options="options" :cascade-value="cascadeValue" @selectNode="selectNode" />
          </van-radio-group>
        </div>
      </van-popup>
    </template>
  </div>
</template>

<script>
import formField from '../../mixins/formField'
import treeHtml from './components/tree'
export default {
  name: 'Index',
  components: { treeHtml },
  mixins: [formField],
  props: {
    propName: {
      type: null,
      default: null
    }
  },
  data() {
    return {
      showPicker: false, // 弹出框
      options: [], // 级联选择器配置文件
      // defaultValText: '', // 显示的数据(选项的name)
      radioVal: '', // 单选值（最终单选值）
      cascadeValText: '', // 实时的name值
      cascadeValue: '' // 级联选择器的值(选项的值 实时选项！)
    }
  },
  computed: {
    _itemField() {
      return {
        fieldDesc: this.label, // 名称
        type: 'radio', // 单选
        lazy: false, // 是否懒加载树形
        automatic: true, // 是否初始化就调用api(如果不初始化需要手动调用)
        treeApi: null, // api接口
        treeApiData: null, // api接口传参
        treeApiDataFn: null, // 点击选项加载数据的时候 触发 （数据中加入disabled可以实现禁用功能）
        treeApiDataFilter: null, // 对接口数据项进行额外的处理
        placeholder: `选择${this.itemField.fieldDesc || this.label}`,
        rules: [{ required: this.itemField.requiredFlag || false, message: `请选择${this.itemField.fieldDesc || this.label}` }], // 设置的校验
        treeParams: { // 配置项
          id: 'sysOrgId', // key的唯一 和绑定值
          name: 'name' // 显示的name选项配置
        },
        ...this.itemField
      }
    }
  },
  watch: {
    propName: {
      handler(val) {
        this.cascadeValue = val
      }
    },
    '_itemField.treeApi': {
      async handler() {
        if (!this._itemField.automatic) { return }
        await this.getTreeApi()
      },
      immediate: true
    },
    value: {
      handler(val) {
        Object.assign(this.itemField, {
          defaultVal: val
        })
        this.changeValue ? this.changeValue(val) : []
        if (!val) { this.radioVal = ''; this.cascadeValText = '' }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    close() {
      this.showPicker = false
      if (this._itemField.type === 'checkbox') { // 多选的情况

      } else if (this._itemField.type === 'radio') { // 单选的情况
        this.cascadeValue = this.radioVal // 取消的时候 改回原来的数据
      }
    },
    // 初始化加载的数据
    async getTreeApi() {
      this.$toast.loading({
        message: '加载中...',
        forbidClick: true,
        loadingType: 'spinner'
      })
      const field = this._itemField
      this.options = await field.treeApi({ ...field.treeApiData })
      if (field.treeApiDataFilter) { // 对接口数据项进行额外的处理
        await field.treeApiDataFilter(this.options, (callback) => {
          this.options = callback
        })
      }
      Object.assign(this.itemField, {
        fieldOptions: this.options
      })
      this.$toast.clear()
    },
    // 设置点击后的临时数据
    selectNode(node) {
      if (this._itemField.type === 'checkbox') { // 多选的情况

      } else if (this._itemField.type === 'radio') { // 单选的情况
        this.cascadeValText = node[this._itemField.treeParams.name]
        // this.cascadeValue = node.id
      }
    },
    /**
     * 确定按钮
     * **/
    onConfirm() {
      // this.defaultValText = this.cascadeValText
      this.$emit('update:propName', this.cascadeValText)
      this.radioVal = this.cascadeValue
      Object.assign(this.itemField, {
        defaultVal: this.radioVal,
        propName: this.cascadeValText
      })
      this.changeDefaultVal(this.radioVal) // 回显绑定数据
      this.showPicker = false // 关闭弹框
    },
    /**
     * 选择事件 （点击选择器的时候会触发）
     */
    async selectClick({ itemField }, type) {
      try {
        // 禁用
        if (this.attrIncludes(this.itemField, '3')) return
        this.showPicker = true
        Object.assign(this.itemField, {
          fieldOptions: this.options
        })
      } finally {
        this.$toast.clear()
      }
    },
    changeValue(val) {
      if (this._itemField.type === 'checkbox') { // 多选的情况

      } else if (this._itemField.type === 'radio') { // 单选的情况
        this.radioVal = val
      }
    }
  }
}
</script>

<style scoped lang="scss">
  .checkbox-con{
    overflow-y: auto;
    height: 500px;
  }
</style>
