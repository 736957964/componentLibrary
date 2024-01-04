import { OrganizeSimpleTree } from 'api/system/organize'

import TreeSelect from 'components/tree-select'

import { cloneDeep } from 'lodash'

export default {
  components: { TreeSelect },
  data() {
    return {
      // 部门数据
      treeData: [],
      // 加载树形数据的方法
      loadTreeDataMethod: OrganizeSimpleTree,
      permCtrl: null,
      treeOtherParams: null
    }
  },
  created() {},
  methods: {
    /**
     * 获取树形数据（其他的数据加载，在组件中重新定义）
     */
    async getTreeData({ parentId = 0, parentName = '' } = {}) {
      try {
        const data = await this.loadTreeDataMethod(parentId, this.treeOtherParams)
        let tempData = []
        if (data && data.length) {
          data.map(item => {
            const { name } = item
            // item.leaf = !childNumber
            item.fullName = parentName + name
          })
          tempData = data
        }
        return tempData
      } catch (e) {
        console.log(e)
        return []
      }
    },
    /**
     * 设置树形数据
     */
    async setTreeData(data) {
      this.treeData = await this.getTreeData()
    },
    /**
     * 加载子节点
     */
    async loadNode({ node, resolve, cb, type, defautVal = 0 }) {
      // 主动加载第一层数据
      if (type === 1) {
        this.node.childNodes = []
        this.resolve(this.firstTreeData)
      } else {
        const { data, level } = node

        if (level !== 0) {
          defautVal = data.id
        } else {
          if (!type) {
            // 存储第一层的node、resolve，用于type===1时，手动刷新数据
            this.node = node
            this.resolve = resolve
          }
        }

        const tempData = await this.getTreeData({
          parentId: defautVal,
          parentName: data.fullName || data.name
        })

        resolve(tempData)

        // 存储第一级数据，不用每次刷新都重新加载
        if (level === 0) {
          this.firstTreeData = cloneDeep(tempData)
        }
      }

      // 父组件执行子组件方法
      cb && cb()
    },
    /**
     * 获取选中数据
     */
    getSelectedTreeData({
      val,
      formName = 'form',
      setSelectedTreeNameFlag = false,
      selectedTreeIdKey = 'orgId',
      selectedTreeNameKey = 'orgName'
    }) {
      if (val) {
        const { id, name } = val
        this[formName][selectedTreeIdKey] = id.toString()
        setSelectedTreeNameFlag && (this[formName][selectedTreeNameKey] = name)
      } else {
        this[formName][selectedTreeIdKey] = ''
        setSelectedTreeNameFlag && (this[formName][selectedTreeNameKey] = '')
      }

      // 选择完数据，根据选择的数据做其他操作
      this.otherOperate && this.otherOperate({ val })
    }
  }
}
