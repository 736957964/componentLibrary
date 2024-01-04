<template lang="html">
  <div flex="dir:right">
    <el-pagination
      background
      :small="small"
      :current-page="currentPage"
      :page-sizes="[10, 20, 30, 40]"
      :page-size="pageSize"
      :layout="layout"
      :total="total"
      :hide-on-single-page="hideOnSinglePage"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script>
export default {
  name: '',
  components: {},
  mixins: [],
  props: {
    // 当前页码
    currentPage: {
      type: Number,
      default: 1
    },
    // 数据总量
    total: {
      type: Number,
      default: 0
    },
    // 一页多少条数据
    pageSize: {
      type: Number,
      default: 10
    },
    // 分页的器的项目
    layout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper'
    },
    // 小号的分页
    small: {
      type: Boolean,
      default: false
    },
    hideOnSinglePage: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {}
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  destroyed() {},
  methods: {
    /**
     * 分液器的点击事件
     * @param  {Number} val 一页多少条数据
     */
    handleSizeChange(val) {
      this.$emit('handleSizeChange', val)
    },
    /**
     * 切换页码的点击事件
     * @param  {Number} val 当前点击的页码
     */
    handleCurrentChange(val) {
      this.$emit('handleCurrentChange', val)
    }
  }
}
</script>

<style lang="scss" scoped></style>
