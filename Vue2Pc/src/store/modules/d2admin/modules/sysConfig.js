import { get } from 'lodash'
import setting from '@/setting.js'
export default {
  namespaced: true,
  state: {
    // 系统配置信息
    info: {},
    showFieldManagementFlag: get(setting, 'showFieldManagementFlag', false)
  },
  actions: {
    /**
     * 设置系统配置文件
     */
    set({ state, dispatch, commit }, info) {
      return new Promise(async resolve => {
        // store 赋值
        const { menuType, ...obj } = info
        state.info = info
        if (state.info.theme) {
          dispatch('setTheme', state.info.theme)
        }
        // 持久化
        await dispatch(
          'd2admin/db/set',
          {
            dbName: 'sys',
            path: 'sysConfig.info',
            value: {
              ...obj,
              menuType: menuType === 'string' ? '0' : menuType
            },
            user: true
          },
          { root: true }
        )
        // end
        resolve()
      })
    },
    /**
     * 从数据库取系统配置信息
     */
    load({ state, dispatch, commit }) {
      return new Promise(async resolve => {
        // store 赋值
        state.info = await dispatch(
          'd2admin/db/get',
          {
            dbName: 'sys',
            path: 'sysConfig.info',
            defaultValue: {},
            user: true
          },
          { root: true }
        )
        if (state.info.theme) {
          dispatch('setTheme', state.info.theme)
        }
        // end
        resolve()
      })
    },
    setTheme({ state, dispatch, commit }, theme) {
      dispatch('d2admin/theme/set', theme, { root: true })
    }
  }
}
