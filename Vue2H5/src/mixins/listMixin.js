export default {
  data() {
    return {
      // 数据
      list: [],
      loading: false,
      finished: false,
      current: 0,
      size: 10,
      refreshing: false,
      error: false,
      // 直接拉取列表数据
      loadDataDirectory: true,
      // 是否为分页的列表
      isPageData: true
    }
  },
  methods: {
    /**
     * 离开焦点，搜索
     */
    doLoadingSearch() {
      this.$toast.loading({
        message: '加载中...',
        forbidClick: true,
        loadingType: 'spinner'
      })
      this.onRefresh()
    },
    /**
     * 下拉刷新
     */
    onRefresh() {
      if (this.loading) {
        return
      }
      this.current = 0
      this.refreshing = true
      this.onLoad()
    },
    /**
     * 搜搜
     */
    onSearch() {
      if (this.loading) {
        return
      }
      this.current = 0
      this.onLoad()
    },
    /**
     * 获取列表数据
     */
    async getTableData() {
      // 如果没有传入接口 不执行
      if (!this.getTableListSyncMethod) return false
      try {
        this.loading = true
        const data = await this.getTableListSyncMethod({
          current: this.current,
          size: this.size,
          // 删除对象空属性
          ...(this.searchObjFormat && this.$clearEmptyObjAttritube(this.searchObjFormat()))
        })
        if (!data) return []
        let { records } = data
        const { total } = data
        if (records.length <= 0) this.finishedText = ''
        // 数据格式化
        if (this.dataFormat) {
          records = this.dataFormat({ data: records })
        }
        if (this.refreshing || this.current === 1) {
          // 下拉刷新
          this.finished = false
          this.refreshing = false
          this.list = records
        } else {
          // 上拉加载
          this.list.push(...records)
        }
        if (this.list.length >= total || records.length === 0) {
          this.finished = true
        }
      } catch (e) {
        console.log(e)
        this.error = true
        this.refreshing = false
        this.loading = false
        this.finished = true
      } finally {
        this.refreshing = false
        this.loading = false
      }
    },
    /**
     * 加载数据
     */
    onLoad() {
      this.current++
      this.getTableData()
    }
  }
}
