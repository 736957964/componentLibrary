<template>
  <div>
    <tree-item
      v-for="node in options"
      :key="node[_itemField.treeParams.id]"
      :node="node"
      index="-1"
      :item-field="_itemField"
      :tree-params="_itemField.treeParams"
      :cascade-value="cascadeValue"
      @selectNode="selectNode"
    />
  </div>
</template>

<script>
import treeItem from '../tree-item'
export default {
  name: 'Index',
  components: { treeItem },
  props: {
    cascadeValue: { type: null, default: '' }, // 选择器的值
    options: { type: Array, default: () => [] }, // 选择器
    itemField: { type: Object, default: () => {} } // 控件配置
  },
  data() {
    return { }
  },
  computed: {
    _itemField() {
      return {
        ...this.itemField
      }
    }
  },
  methods: {
    selectNode(node) {
      this.$emit('selectNode', node)
    }
  }
}
</script>

<style scoped>

</style>
