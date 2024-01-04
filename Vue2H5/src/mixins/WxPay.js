//使用方法
// import mixin from '@/api/mixin.js'
//   export default {
//     mixins:[mixin],
//     name: "XXXXXXXXXX",
//     components:{
//       material,
//     },
// <img src="@/assets/img/daliPriceInfo_logo_nothing.png" alt="" v-else>
import {Dialog} from 'vant'
import { PromBridgeReady } from '@/utils/mUtils'
export default {
  data() {
    return {

    }
  },
  created() {
    this.initialization()
  },
  mounted() {

  },
  methods: {
    initialization(){//初始化执行
      let wxCode = this.GetQueryString('code');//获取url里的code
      console.log("我是wxCode="+wxCode);
      if(wxCode){
        //绑定微信接口
        this.$api.UserBindWeChat({code:wxCode}).then((res)=>{
          console.log(res);
          if(res.data.code ===1){
            let loginToken = JSON.parse(localStorage.getItem('loginToken'));
            loginToken.openid = wxCode;
            localStorage.setItem('loginToken',JSON.stringify(loginToken));
            console.log(loginToken)
          }
        })
      }
    },
    //获取get参数
    GetQueryString (name) {
      let url = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
      let newUrl = window.location.search.substr(1).match(url)
      if (newUrl != null) {
        return unescape(newUrl[2]);
      } else {
        return false;
      }
    },
    payInstall(){//支付
      if(this.$store.state.loginToken&&this.$store.state.loginToken.openid){ return true}
      Dialog.confirm({
        message: '您的账号还未绑定微信 是否前去绑定？',
        confirmButtonText: '绑定',
        confirmButtonColor: '#3FC1FE'
      }).then(() => {
        // https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html#0
        //snsapi_base （不弹出授权页面，直接跳转，只能获取用户openid）
        //snsapi_userinfo （弹出授权页面，可通过openid拿到昵称、性别、所在地。并且， 即使在未关注的情况下，只要用户授权，也能获取其信息 ）
        let scope = 'snsapi_userinfo';
        let currentUrl = window.location.href;
        let appid='wxc073589a7e72e608';//微信appid
        currentUrl = encodeURIComponent(currentUrl);//重定向地址 完成授权后跳转到该页面
        location.href =
            "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" +
            appid +
            "&redirect_uri=" +
            currentUrl +
            // "&response_type=code&scope=" +
            '&response_type=code&scope='+
            scope +
            "&state=STATE#wechat_redirect";
            // '&state=STATE&connect_redirect=1#wechat_redirect'
      }).catch(() => {
        // on cancel
        console.log('错误');
      });
    },

    Wxpayment(order_number,type){//微信付款  订单号和  type 1.微信小程序2.微信公众号
      this.$api.OrderwxPay({order_number:order_number,type:type}).then((res)=>{
        console.log(res.data.data);
        if(res.data.code ===1){
          let res = res.data.data;
          //通过封装好的函数 进行微信支付
          PromBridgeReady('wxc073589a7e72e608', res.timeStamp, res.nonceStr, res.package, res.signType, res.paySign).then((res)=>{
            console.log("成功"+res);
            this.$router.push({name:'/Home'})
          }).cache((err)=>{
            console.log("错误"+err);
          })
        }
      })
    },

  }
}
