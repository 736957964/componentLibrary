import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

// this.$store.state 取得这里面的参数
export default new Vuex.Store({
  // 全局共享数据
  state: { // this.$store.state.website
    website: "https://file.xidukexue.com/Uploads/",
    website2:'https://file.xidukexue.com/web'
  },
  // 全局函数// 调用函数名,传参
  //this.$store.commit('shouchang',this.goods_id);
  mutations: {
    scrollTop() {
      console.log("复位滚动条");
      let osTop = document.documentElement.scrollTop || document.body.scrollTop;
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }
})
