import axios from 'Vue2Pc/src/plugin/axios/axios'
import Qs from 'qs';//qs 是一个增加了一些安全性的查询字符串解析和序列化字符串的库。
//Message  是提示框   分为三个状态,具体查询element-ui
//Loading.service({fullscreen: true, background: 'rgba(0, 0, 0, 0.7)'}) 是遮罩层 用 .close() 关闭
//MessageBox.confirm() //提示弹框
import {Loading, Message, MessageBox} from 'element-ui';
import router from '@/router';//指向的是路由

let loadingInstance;//遮罩

const CODE_SUCCESS = 1;//状态成功码
const CODE_FAIL = 0;//状态失败码
const CODE_INVALID = -1;//失效 重新登录

// method 请求方法 url地址 data传入的数据
export const request = function (method, url, data, loading,isMessage, isFile) {
  const service = axios.create({
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},//设置请求头传递数据的格式
    baseURL:'https://www.xidukexue.com/api/' , //api前缀地址  这里一般是配置生产环境 开发环境这些  现在写死了     https://www.guanqikj.com/xidu/public/api
    timeout: 10000, // 请求超时时间 10S
    // withCredentials:true,//设置cors跨域允许携带资源 凭证 _____不知道咋配先忽略
    paramsSerializer(params) {
      return Qs.stringify(params, {arrayFormat: 'repeat'}); // 针对get 和 delete 方法参数序列化
    },
    transformRequest: [function (params) {//改变请求,他是一个函数  看服务器要求需要什么格式
      // 对 data 进行任意转换处理
      return Qs.stringify(params, {arrayFormat: 'repeat'}); // 针对post和put方法参数序列化
    }],
    // validateStatus:function (status) {//一般情况不会用到validateStatus  可以注释
    //   //自定义响应成功的http状态码  除了2都算响应失败
    //   // return /^（ 2|3）\d{2}$/.test(status);
    // }
  });
  // 设置请求拦截器  axios.interceptors.request.use(); // 客户端发送请求 > [请求拦截器] > 服务器 // token校验（JWT）：接收服务器返回的token,存储到vuex/本地存储中,// 每一次向服务器发送请求,都应该把token带上
  let usrToken = JSON.parse(localStorage.getItem('loginToken'));
  service.interceptors.request.use((config) => {
      // config.baseURL="/api"; //配置代理跨域  https://blog.csdn.net/m0_37270964/article/details/111208065
      loadingInstance = Loading.service({fullscreen: true, background: 'rgba(0, 0, 0, 0.7)'}); //定义遮罩背景
      // 发送请求前添加token信息
      // let token = null;  //token存哪就取哪
      // let loginToken = localStorage.getItem('loginToken');
      // if (loginToken != null) { token = JSON.parse(loginToken).data.token; }
      // if (token) {  config.headers.Authorization = token; } // 每次发送请求之前判断是否存在token，如果存在，则统一在http请求的header都加上token，不用每次请求都手动添加了
      ///不在请求头加  在数据里面加 也可以去上面的transformRequest里面加
      if(usrToken && config.data){ config.data.token=usrToken.data.token; config.data.user_id=usrToken.data.id; }
      return config;
    },
    error => {//请求token失败的情况
      return Promise.reject(error)
    });

// 响应拦截器 //服务器返回信息 > [拦截的统一处理] > 客户端js获取到信息
  let loginCountdown=false;
  service.interceptors.response.use(
    (response) => {//拦截器成功
      if (loadingInstance) { loadingInstance.close(); }//loadingInstance为true 关闭遮罩
      if(response.data.code==CODE_FAIL &&  !isMessage){Message.error(response.data.msg);}//查询失败提示 //isMessage参数为true则不会提示
      if(response.data.code==CODE_INVALID){
        if (router.currentRoute.path !== '/Login' && loginCountdown ) {
          loginCountdown =true;
          setTimeout(function () { loginCountdown = false; },60*1000);//60秒后才会重新触发重新登录
          MessageBox.confirm( '登录状态已过期或用户在其它地方登录，您可以继续留在该页面，或者重新登录','系统提示',
            { confirmButtonText: '重新登录', cancelButtonText: '取消', type: 'warning',}, ).then(() => {  });
        }
      }
      return response.data
    }, error => {
      if (loadingInstance) { loadingInstance.close(); }//loadingInstance为true 关闭遮罩
      let errMsg = '';
      let {response} = error;
      if (response) { //服务器返回结果了
        switch (response.status) {//状态码结果
          case 401: errMsg = '登录状态失效，请重新登录';break;//当前请求需要用户验证（未登陆） 权限不足 401
          case 403: errMsg = '拒绝访问'; break; //服务器已经接收请求 但拒绝执行（token过期）
          case 404:break;// 找不到页面 当前接口不存在
          case 408:errMsg = '请求超时'; break;
          case 500:errMsg = '服务器内部错误';break;
          case 501: errMsg = '服务未实现';break;
          case 502: errMsg = '网关错误'; break;
          case 503: errMsg = '服务不可用';break;
          case 504:errMsg = '网关超时'; break;
          case 505:errMsg = 'HTTP版本不受支持'; break;
          default: errMsg = error.response.data.msg; break;//不知道什么东西
        }
        Message.error(errMsg)
      } else {//服务器连结果都没返回  1.服务器崩了 2.断网了
        if (error.code === 'ECONNABORTED') {errMsg = '请求超时'; }
        else { errMsg = error.message; }
        if ((error && error.response && error.response.config && (!error.response.config.params || error.response.config.params.isShowErrorMsg !== false)) || error.code === 'ECONNABORTED') {
          Message.error(errMsg);
        }
        ///////////////////////////
        if (!window.navigator.onLine) {  return; }//无网  断网处理：可以跳转到断网页面
        return Promise.reject(error);
      }
    });

  return service[method](url,data);
};

//  https://www.bilibili.com/video/BV1LJ41177B9?from=search&seid=12035233222714277524
