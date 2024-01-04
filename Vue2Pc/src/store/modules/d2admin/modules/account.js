import { Message, MessageBox } from "element-ui";

import util from "@/libs/util.js";

import { UserLogout, UserLogin } from "api/system";

import {
  ZzdLogin,
  zlbPersonLogin,
  zlbwxLogin,
  CwxLogin,
  ZhiDaSSOLogin,
  ZljPersonLogin,
} from "@/api/sso";

// import { cloneDeep } from 'lodash'

export default {
  namespaced: true,
  actions: {
    /**
     * @description 登录
     * @param {String} channel 0 智搭SSO单点登录 1微信扫码登录 4企业微信单点登录 5微信小程序登录 6微信公众号登录
     * 7浙政钉单点 8浙里办个人单点 9浙里办微信小程序单点
     */
    login({ dispatch, commit }, { params, vm } = {}) {
      return new Promise(async (resolve, reject) => {
        // 开始请求登录接口
        const { channel } = params;
        let loginFn = "";
        if (channel == 11) {
          loginFn = ZljPersonLogin;
        } else if (process.env.VUE_APP_ISUSERSSO === "1") {
          // 项目上配置是否使用智搭登录系统
          loginFn = ZhiDaSSOLogin;
        } else {
          loginFn = {
            0: UserLogin, // 账号密码登录
            7: ZzdLogin, // 浙政钉登录
            // 2: DdLogin, // 钉钉登录
            4: CwxLogin, // 企业微信登录
            8: zlbPersonLogin, // 浙里办个人
            9: zlbwxLogin, // 浙里办微信小城序
            11: ZljPersonLogin, //浙里建单点登录
          }[channel];
        }

        loginFn(params)
          .then(async (res) => {
            // 是否单点登录 1 是 0 否
            util.cookies.set("isSingleSignOn", channel !== "0");
            // 设置用户信息
            if(localStorage.getItem('zljCode')){
              await dispatch("d2admin/user/set", res.user, { root: true });
            }else{
              await dispatch("d2admin/user/set", res, { root: true });
            }
            // 用户登录后从持久化数据加载一系列的设置
            await dispatch("load");
            // 结束
            resolve(res);
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    /**
     * @description 退出用户并返回登录页面
     * @param {Object} context
     * @param {Object} payload confirm {Boolean} 是否需要确认
     */
    logout({ commit, dispatch }, { confirm = false } = {}) {
      /**
       * @description 退出
       */
      async function logout() {
        try {
          await UserLogout();
          // 删除cookie
          util.cookies.remove("token");
          util.cookies.remove("uuid");
          // 清空 vuex 用户信息
          await dispatch("d2admin/user/set", {}, { root: true });
        } catch (e) {
          console.log(e);
        } finally {
          // 退出
          util.goSsoLogoutPage();
        }
      }
      // 判断是否需要确认
      if (confirm) {
        commit("d2admin/gray/set", true, { root: true });
        MessageBox.confirm("确定要退出当前用户吗", "退出用户", {
          type: "warning",
        })
          .then(() => {
            logout();
          })
          .catch(() => {
            Message({
              message: "取消退出操作",
            });
          });
      } else {
        logout();
      }
    },
    /**
     * @description 用户登录后从持久化数据加载一系列的设置
     * @param {Object} context
     */
    load({ dispatch }) {
      return new Promise(async (resolve) => {
        // DB -> store 加载用户名
        dispatch("d2admin/user/load", null, { root: true });
        // DB -> store 加载主题
        dispatch("d2admin/theme/load", null, { root: true });
        // DB -> store 持久化数据加载系统配置信息
        dispatch("d2admin/sysConfig/load", null, { root: true });
        // dispatch("custom/appList/load", null, { root: true });
        dispatch("d2admin/processCenter/load", null, { root: true });
        // end
        resolve();
      });
    },
  },
};
