
<!--
  option中的单个数据 可以使用 option[X].disabled 禁用
  itemField中配置 radioEventsClick 选项点击后触发 传参当前的node
  treeApiDataFn配置点击树形后的FN  返回值为 下个树形的数据
-->
<template>
  <div class="tree-item-box">
    <div class="tree-item">
      <div class="tree-item-name" @click="downNode(node)">
        <span v-if="loaderShow===1" class="icon" />
        <span v-if="loaderShow===2" class="icon overturn" />
        <div v-if="loaderShow===3" class="loader" />
        <span>{{ node[treeParams.name] }}</span>
      </div>
      <div class="tree-radio">
        <van-radio :name="nodeId" :disabled="node.disabled" @click="radioEventsClick(node)">
          <template #icon="prop">
            <img
              v-if="!node.disabled"
              class="img-icon"
              :src="cascadeValues.includes(nodeId)? activeIcon : inactiveIcon"
            >
          </template>
        </van-radio>
      </div>
    </div>
    <treeHtml v-show="options&&options.length && loaderShow===2" class="treeHtml" :item-field="itemField" :options="options" :cascade-value="cascadeValue" @selectNode="selectNode" />
  </div>
</template>

<script>
import treeHtml from '../tree'
export default {
  name: 'Index',
  components: { treeHtml },
  props: {
    node: { // 单个选项的数据节点
      type: Object,
      default: () => {}
    },
    itemField: { type: Object, default: () => ({}) }, // 控件配置
    cascadeValue: { type: null, default: '' } // 选择器的值
  },
  data() {
    return {
      isLoaded: false, // 是否已经加载
      loaderShow: 1, // 初始右箭头图标
      // 单选图片
      activeIcon: require('assets/img/icon-dx-active.png'),
      inactiveIcon: require('assets/img/icon-dx.png'),
      options: [] // 选项数据
    }
  },
  computed: {
    treeParams() {
      return this.itemField?.treeParams
    },
    nodeId() {
      return this.node[this.treeParams.id]
    },
    cascadeValues() {
      const data = []
      if (!Array.isArray(this.cascadeValue)) {
        data.push(this.cascadeValue)
      }
      return data
    }
  },
  beforeCreate() {
    // A 依赖 B，但是 B 又依赖 A 等到生命周期钩子 beforeCreate 时去注册
    this.$options.components.treeHtml = require('../../components/tree').default
  },
  methods: {
    // 选项点击后触发 需配置radioEventsClick
    radioEventsClick(node) {
      if (this.itemField.radioEventsClick) {
        this.itemField.radioEventsClick(node)
      }
      this.selectNode(node)
    },
    selectNode(node) {
      this.$emit('selectNode', node)
    },
    async downNode(node) {
      // 为2的情况是已经加载过数据了 点击收起自己的数据
      if (this.loaderShow === 2) {
        this.loaderShow = 1; return
      }
      // 点击的时候判定 是第一次的的加载还是展开
      if (this.isLoaded) {
        this.loaderShow = 2
      } else {
        // 判定是否自己处理fn 返回数据
        if (this.itemField.treeApiDataFn) {
          this.loaderShow = 3
          this.itemField.treeApiDataFn(node, (callback) => {
            this.isLoaded = true
            if (callback?.length === 0) { // 没有数据代表已经加载直接不现实按钮了
              this.loaderShow = 0
            } else { // 有数据展开 下的图标
              this.options = callback
              setTimeout(() => { this.loaderShow = 2 }, 300)
            }
          })
        } else {
          // const field = this._itemField
          // this.options = await field.treeApi({ ...field.treeApiData })
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
::v-deep{
  .van-radio__icon {
    height: 16px;
    line-height: 16px;
    .img-icon {
      width: 16px;
      height: 16px;
    }
    .van-icon {
      width: 16px;
      height: 16px;
      line-height: 16px;
      font-size: 14px;
    }
  }
}
/* 最外边的圆 */
.loader{
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 4px solid transparent;
  border-top-color: #4bc0c8;
  animation: run 2s linear infinite;
  top:5px;
  left: -2px;
  position:absolute;
  content: '';
  transform: rotate(90deg) translate(-50%,0);
}
@keyframes run{
  0%{
    transform: rotate(0deg);
  }
  100%{
    transform: rotate(360deg);
  }
}
.tree-item-box{
  position: relative;
  .tree-item{
    font-size: 14px;
    margin: 5px 5px;
    display: flex;
    height: 30px;
    line-height: 30px;
    //padding-left: 20px;
    justify-content: space-between;
    position: relative;
    .tree-item-name{
      padding-left: 20px;
      .icon:before{
        left: 6px;
        top: 50%;
        position:absolute;
        content: '';
        width: 0;
        border: 8px solid;
        border-color: transparent transparent #cbc8c8;
        transform: rotate(90deg) translate(-50%,0);
      }
      .overturn:before{
        border: 8px solid;
        border-color: transparent transparent #cbc8c8;
        left: -5px;
        top: 30%;
        transform: rotate(180deg) translate(-50%,0);
      }
    }
    .tree-radio{
      flex: 1;
      height: 100%;
      display: flex;
      justify-content: flex-end;
      align-self: center;
    }
  }
  .treeHtml{
   margin-left: 10px;
  }
}

</style>
