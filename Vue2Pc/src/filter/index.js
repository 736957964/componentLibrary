import  Vue  from 'vue'

export default {
  install(){
    //处理数据 '1,2,3,4'   [1,2,3,4]
    Vue.filter('blockToArray', function (val) {
      return val.split(',')
    });
  }
}
