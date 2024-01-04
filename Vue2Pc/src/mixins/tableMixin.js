import FooterPage from '@/components/footer-page' // 分页器

export default {
  components: {
    FooterPage
  },
  data() {
    return {
      // 总数
      total: 0,
      // 当前页码数
      currentPage: 1,
      // 一页多少条
      pageSize: 10,
      // 数据
      tableData: [],
      // 存储搜索栏中的数据
      searchObj: {},
      // 内容区域loading  配合 v-loading
      loading: false,
      // 整体的loading
      // containerLoading: false,
      // 直接拉取列表数据
      loadDataDirectory: true,
      // 第一次加载列表数据
      firstLoad: true,
      // 是否为分页的列表
      isPageData: true,
      // 动态控制loading：设置为true的时候，需要配合closeLoading方法同时使用
      dynamicLoadingFlag: false,
      multipleSelection: [] // 选中的列表
    }
  },
  computed: {},
  created() {
    this.loadDataDirectory && this.getTableData()
  },
  mounted() {
  },
  methods: {
    /**
     * 拉取上一页的数据，单个删除使用
     */
    backPrePageWhenDelOne() {
      if (this.tableData.length === 1 && this.currentPage !== 1) {
        this.currentPage -= 1
      }
    },
    /**
     * 拉取上一页的数据，批量删除使用
     */
    backPrePageWhenDelMany() {
      if (
        this.tableData.length === this.multipleSelection.length &&
        this.currentPage !== 1
      ) {
        this.currentPage -= 1
      }
    },
    /**
     * 分页器的点击事件
     * @return {Number} 一页多少条数据
     */
    handleSizeChange(val) {
      // 返回第一页
      this.currentPage = 1
      this.pageSize = val
      this.getTableData()
    },
    /**
     * 切换页码的点击事件
     * @param  {Number} val 当前点击的页码
     */
    handleCurrentChange(val) {
      this.currentPage = val
      this.getTableData()
    },
    /**
     * 格式化提交的参数
     */
    postDataFormat() {
      const tempObj = this.searchObjFormat
        ? this.searchObjFormat()
        : this.searchObj
      // 清空没有值的字段
      return this.$clearEmptyObjAttritube(tempObj)
    },
    async getTableData() {
      // 如果没有传入接口 不执行
      if (!this.getTableListSyncMethod) return false
      try {
        // containerLoading，设置面板整体的loading状态
        if (this.containerLoading === false && this.firstLoad) {
          this.containerLoading = true
        } else { // 上面 containerLoading 注释了只会执行这个
          this.loading = true // 内容区域loading
        }
        // 判断是否进行额外接口处理
        const hasOtherSyncMethod = this.firstLoad && this.otherSyncMethod
        // 这里必须是await 等到接口返回值之后再往后执行
        const [tableList, ...otherData] = await Promise.all([
          this.getTableList(),
          ...[hasOtherSyncMethod && this.otherSyncMethod()]
        ])
        // 进行额外接口数据处理
        if (hasOtherSyncMethod) { // 第一次加载且有 otherSyncMethod 才会执行
          this.otherSyncDataFormat(otherData)
        }
        if (tableList) { // 接口里拿到了列表数据
          if (this.isPageData) { // 是分页列表
            // 分页数据   拿到里面的 records 和 total 参数
            const { records, total } = tableList
            // 格式化后台返回的数据，有些不需要格式化，直接赋值
            this.tableData = this.tableDataFormat
              ? this.tableDataFormat(records)
              : records
            this.total = total
          } else {
            // 不分页数据
            this.tableData = this.tableDataFormat
              ? this.tableDataFormat(tableList)
              : tableList
            await this.$nextTick()
          }
          // 根据列表数据，做其他操作  有 otherDataOperation 才会执行
          this.otherDataOperation &&
            this.otherDataOperation({ arr: this.tableData })

          this.tempRefreshKey && (this.tempRefreshKey = Date.now())
        }
      } catch (e) {
        console.log(e)
      } finally {
        // 不论 try 是否正确都会执行下面的语句
        if (!this.dynamicLoadingFlag) { // 动态控制loading 为false的时候执行
          if (this.containerLoading === true && this.firstLoad) {
            this.containerLoading = false
          } else {
            this.loading = false // 内容区域
          }
          this.firstLoad = false // 调用过一次了 第一此加载数据列表改为 false
        }
      }
    },
    /**
     * 获取列表数据
     */
    async getTableList() {
      const data = await this.getTableListSyncMethod({
        ...(this.isPageData && {
          current: this.currentPage,
          size: this.pageSize
        }),
        ...this.postDataFormat()
      })
      return data
    },
    /**
     * table的选择事件
     */
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    /**
     * 搜索
     */
    doSearch(obj) {
      // 返回第一页
      this.currentPage = 1
      // 这里的obj是一整个 form 表单
      obj && (this.searchObj = obj)
      this.getTableData()
    },
    /**
     * 顶栏重置、新增(很奇怪的交互)
     */
    doReset() {
      // this.currentPage = 1
      // this.searchObj = {}
      // this.getTableData()
    },
    /**
     * 新增、编辑成功的回调
     */
    addOrEditSuccess() {
      if (this.currentId) {
        // 编辑回调
        this.doSearch()
      } else {
        // 新增回调
        this.$refs.pageHeader.doReset()
      }
    },
    /**
     * 列表点击排序   点击排序的时候调用 ascending 🔼  descending🔽
     */
    changeTableSort(column) {
      // 如果没有传入接口 不执行排序
      if (!this.getTableListSyncMethod) return false
      const { order } = column
      if (order) {
        if (order === 'ascending') {
          console.log(column)
        } else if (order === 'descending') {
          console.log(column)
        }
      }
    },
    // 地址转换
    addressFormat(data) {
      const arr = data.split(',')
      return arr.filter(item => {
        if (item.length > 0) {
          return item
        }
      })
    },
  },
  filters: {
    /**
     * 获取字典值
     * @param {Array} data 字典数据
     * @param {*} val 比较的值
     * @param {String} source 字典中比较的字段
     * @param {String} target 返回目标的字段
     * @returns {*} 返回的目标值
     */
    findDictValue: function(value, data = [], source = 'value', target = 'name') {
      if (value === undefined) return ''
      const obj = data.find(item => item[source] === value)
      return obj && obj[target] ? obj[target] : ''
    }
  }
}
