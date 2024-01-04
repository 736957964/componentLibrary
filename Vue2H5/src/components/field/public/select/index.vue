<!--
可以使用 v-model绑定  也可以单独使用 defaultVal 赋值回显
单独使用 defaultVal  itemField的接收参数不能是计算属性
:prop-name.sync="ruleForm.goodsTypeName" 回显初始数据（显示数据）（非必填）
requiredFlag 是否显示必填红*   actionAttribute 为 ['3'] 禁用属性
fieldOptions:[{name:'选项1',value:1}]
weakType 1  弱类型  value值 数字转字符串  2 字符串转数字 3 type 为 checkbox 多选的时候用  数组转字符串 [1,2,3]=>'1,2,3'
type 为 checkbox 多选
配置项 keyValue 默认取 value  keyName 默认取 name
@fieldOptionsFind 筛选后符合条件的对象
-->
<template>
  <div>
    <van-field
      readonly
      :disabled="_itemField.disabled || disabled"
      clickable
      name="picker"
      :rules="_itemField.rules"
      :value="defaultValText"
      :label="_itemField.fieldDesc"
      :placeholder="_itemField.placeholder"
      @click="selectClick({ itemField }, 1)"
    >
      <template #label>
        <span v-if="!!itemField.requiredFlag && !attrIncludes(itemField, '3')" class="van-cell--require">*</span>
        <span>{{ _itemField.fieldDesc }}</span>
      </template>
    </van-field>
    <van-popup v-model="showPicker" position="bottom" get-container="body">
      <div class="van-picker__toolbar">
        <button type="button" class="van-picker__cancel" @click="showPicker = false">取消</button>
        <div class="van-picker__title">{{ _itemField.fieldDesc }}</div>
        <button type="button" class="van-picker__confirm" @click="onConfirm()">确定</button>
      </div>
      <div class="checkbox-con">
        <van-radio-group v-if="_itemField.type!=='checkbox'" v-model="radioVal">
          <van-cell-group>
            <RecycleScroller
              v-slot="{ item,index }"
              class="scroller"
              :items="selectColumns"
              :item-size="itemSize"
              :key-field="keyValue"
            >
              <van-cell :key="item[keyValue]" :title="item[keyName]">
                <template #icon>
                  <van-radio :ref="`radioboxes${index}`" :name="item[keyValue]">
                    <template #icon="props">
                      <img
                        class="img-icon"
                        :src="props.checked ? activeIcon : inactiveIcon"
                      >
                    </template>
                  </van-radio>
                </template>
              </van-cell>
            </RecycleScroller>
          </van-cell-group>
        </van-radio-group>

        <van-checkbox-group v-else v-model="radioValList" :max="itemField.checkboxNum || 0">
          <van-cell-group>
            <RecycleScroller
              v-slot="{ item,index }"
              class="scroller"
              :items="selectColumns"
              :item-size="itemSize"
              key-field="value"
            >
              <van-cell :title="item.name" @click="toggle(item.value, 2, index)">
                <template #icon>
                  <van-checkbox :ref="`checkboxes${index}`" :name="item.value" shape="square" />
                </template>
              </van-cell>
            </RecycleScroller>
          </van-cell-group>
        </van-checkbox-group>
      </div>
    </van-popup>

  </div>
</template>

<script>
import formField from '../../mixins/formField'
import { RecycleScroller } from 'vue-virtual-scroller'

export default {
  name: 'Index',
  components: { RecycleScroller },
  mixins: [formField],
  data() {
    return {
      itemSize: 44,
      showPicker: false, // 是否显示picker选择器
      // 下拉选择器配置文件
      selectColumns: [],
      // 单选图片
      activeIcon: require('assets/img/icon-dx-active.png'),
      inactiveIcon: require('assets/img/icon-dx.png'),
      radioVal: '', // 单选值
      defaultValText: '', // 显示的name值
      radioValList: [] // 多选值
    }
  },
  computed: {
    _itemField() {
      return {
        keyValue: 'value',
        keyName: 'name',
        fieldDesc: this.label, // 名称
        rules: [{ required: this.itemField.requiredFlag || false, message: `请选择${this.itemField.fieldDesc || this.label}` }], // 设置的校验
        placeholder: `选择${this.itemField.fieldDesc || this.label}`,
        ...this.itemField
      }
    },
    keyValue() {
      return this._itemField.keyValue
    },
    keyName() {
      return this._itemField.keyName
    }
  },
  watch: {
    '_itemField.fieldOptions': {
      handler(val, val2) {
        if (val !== val2) { // 特殊情况下 有可能无限触发死循环
          val?.length && this.changeValue(this.value ?? this.itemField.defaultVal)
        }
      },
      immediate: true
    },
    defaultValText(val) {
      this.$emit('update:propName', val)
    }
  },
  mounted() {
    this.setItemSize()
    window.onresize = () => {
      this.setItemSize()
    }
  },
  destroyed() {
    window.onresize = null
  },
  methods: {
    changeValue(val) {
      this.defaultValText = this.getDefaultValText(val)
    },
    getDefaultValText(val) {
      if ([null, undefined].includes(val)) { return }
      switch (this.itemField.weakType) {
        case 1:Number.isInteger(val) ? val = JSON.stringify(val) : ''; break
        case 2:val = val / 1; break
        case 3: !Array.isArray(val) ? val = val.split(',') : ''; break
        default:break
      }
      const { fieldOptions } = this.itemField
      if (this._itemField.type === 'checkbox') {
        this.radioValList = val
      } else {
        this.radioVal = val
      }
      if (Array.isArray(val)) { // 多选情况的处理
        return this.getArrEqual(fieldOptions, val)
      } else {
        // 过滤出符合value的对象
        const parmes = fieldOptions && fieldOptions.find((item) => item[this.keyValue] === val)
        this.$emit('fieldOptionsFind', parmes)
        return parmes ? parmes[this.keyName] : val
      }
    },
    /**
     * 确定
     */
    onConfirm() {
      // 判断单选/多选
      if (this._itemField.type !== 'checkbox') {
        if (this.radioVal !== this.itemField.defaultVal) {
          Object.assign(this.itemField, {
            defaultVal: this.radioVal
          })
        }
        this.changeValue(this.itemField.defaultVal)
        this.changeDefaultVal(this.radioVal)
      } else {
        if (this.radioValList !== this.itemField.defaultVal) {
          var data = this.radioValList
          if (this._itemField.weakType === 3) {
            data = data.join(',') // 为3的时候转化为 字符串
          }
          Object.assign(this.itemField, {
            defaultVal: data
          })
          this.value === null ? this.changeValue(this.itemField.defaultVal) : '' // 没用v-model绑定时候需要手动赋值
          this.changeDefaultVal(data)
        }
      }

      this.showPicker = false
    },
    /**
     * cell点击事件，同步
     * **/
    toggle(value, type, index) {
      if (type === 1) {
        this.$refs[`radioboxes${index}`].toggle()
      } else {
        this.$refs[`checkboxes${index}`].toggle()
      }
    },
    /**
     * 对多选进行数据整理
     * **/
    getArrEqual(fieldOptions, defaultVal) {
      // const newArr = []
      var newArr = ''
      for (let i = 0; i < defaultVal.length; i++) {
        for (let j = 0; j < fieldOptions.length; j++) {
          if (fieldOptions[j][this.keyValue] === defaultVal[i]) {
            newArr += fieldOptions[j][this.keyName]
            if (i !== defaultVal.length - 1) { newArr += ',' } // 返回的显示数据 'XX,XXX,XX'
          }
        }
      }
      return newArr
    },
    // 计算选择器需要的高度
    setItemSize() {
      const docEl = document.documentElement
      const fontSize = docEl.style.fontSize.slice(0, -2)
      this.itemSize = 0.5 * fontSize // 1.18
    },
    /**
     * 选择事件 （点击选择器的时候会触发）
     */
    selectClick({ itemField }, type) {
      // 禁用
      if (this.attrIncludes(this.itemField, '3')) return
      const { fieldOptions, defaultVal } = itemField
      this.selectColumns = fieldOptions || [] // 设置选择器
      if (defaultVal) {
        // 判断单选-1 /多选  进行赋值
        this._itemField.type !== 'checkbox' ? this.radioVal = defaultVal : this.radioValList = defaultVal
      }
      if (defaultVal && fieldOptions) {
        this.defaultIndex = fieldOptions.findIndex(
          (item) => item[this.keyValue] === defaultVal
        )
      }
      this.showPicker = true
    }
  }
}
</script>

<style scoped lang="scss">

.scroller{
  height: 308px;
  overflow-y: auto
}
</style>
