// import wx from 'weixin-js-sdk';// npm install weixin-js-sdk
// import $ from 'jquery'
// import Cookies from 'js-cookie'

//Promise异步操作执行箭头函数  weixin-js-sdk
export const PromBridgeReady = (appid, timeStamp, nonceStr, packageStr, signType, paySign,infotypes,urls ) => {
  return new Promise( (resolve, reject)=> {
    wx.config({
      debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
      appId: appid, // 必填，公众号的唯一标识
      timestamp: timeStamp, // 必填，生成签名的时间戳
      nonceStr: nonceStr, // 必填，生成签名的随机串
      signature: paySign, // 必填，签名，见附录1
      jsApiList: ['chooseWXPay'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
    });
    wx.ready(()=> {
      wx.chooseWXPay({
        timestamp: timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
        nonceStr: nonceStr, // 支付签名随机串，不长于 32 位
        package: packageStr, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
        signType: signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
        paySign: paySign, // 支付签名
        success: (res)=> {
          resolve(res);
          // 支付成功后的回调函数
          // window.location.href = noseDomainAll + url;
        },
        fail:(res)=> {
          //失败回调函数
          reject(res);
        }
      });
    });
    wx.error((res)=> {
      // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
      //alert("config信息验证失败");
      reject(res);
    });
  });
};
//分享功能  jquery
export const shareWx = (title, desc, lurl, img) => {
  $.ajax({
    type: "post",
    url: baseUrl + "/weixin/hs/inject_js",
    async: true,
    success: function (res) {
      wx.config({
        debug: false,
        appId: res.appId,
        timestamp: res.timestamp.toString(),
        nonceStr: res.nonceStr,
        signature: res.signature,
        jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'updateAppMessageShareData', 'onMenuShareWeibo', 'onMenuShareQZone'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
      });
      wx.ready(function () {
        // 分享到朋友圈
        wx.onMenuShareTimeline({
          title: title, // 分享标题
          desc: desc,// 分享描述
          link: lurl, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
          imgUrl: img, // 分享图标
          success: function () {
            // 用户确认分享后执行的回调函数
          },
          cancel: function () {
            // 用户取消分享后执行的回调函数
          }
        });
        // 分享给朋友
        wx.onMenuShareAppMessage({
          title: title, // 分享标题
          desc: desc,// 分享描述
          link: lurl, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
          imgUrl: img, // 分享图标
          type: '', // 分享类型,music、video或link，不填默认为link
          dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
          success: function () {
            // 用户确认分享后执行的回调函数
          },
          cancel: function () {
            // 用户取消分享后执行的回调函数
          }
        });

        // 分享到QQ
        wx.onMenuShareQQ({
          title: title, // 分享标题
          desc: desc,// 分享描述
          link: lurl, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
          imgUrl: img, // 分享图标
          success: function () {
            // 用户确认分享后执行的回调函数
          },
          cancel: function () {
            // 用户取消分享后执行的回调函数
          }
        });
        wx.updateAppMessageShareData({
          title: title,
          link: url,
          imgUrl: img,
          success: function () { },
          cancel: function () { }
        });

        // 分享到腾讯微博
        wx.onMenuShareWeibo({
          title: title, // 分享标题
          desc: desc,// 分享描述
          link: lurl, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
          imgUrl: img, // 分享图标
          success: function () {
            // 用户确认分享后执行的回调函数
          },
          cancel: function () {
            // 用户取消分享后执行的回调函数
          }
        });

        // 分享到QQ空间
        wx.onMenuShareQZone({
          title: title, // 分享标题
          desc: desc,// 分享描述
          link: lurl, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
          imgUrl: img, // 分享图标
          success: function () {
            // 用户确认分享后执行的回调函数
          },
          cancel: function () {
            // 用户取消分享后执行的回调函数
          }
        });
      });
      wx.error(function (res) { });

    },
    error: function (res) { }
  });


};
//判断是否为微信小程序
export const isWeChatMiniApp = () => {
  const ua = window.navigator.userAgent.toLowerCase();
  return new Promise((resolve) => {
    if (ua.indexOf('micromessenger') == -1) {
      console.log("不在微信或者小程序中")
      resolve(false);
    } else {
      wx.miniProgram.getEnv((res) => {
        if (res.miniprogram) {
          console.log("在小程序中")
          resolve(true);
        } else {//在微信中
          console.log("在微信中")
          resolve(false);
        }
      });
    }
  });
}

//设置缓存   name 缓存名称, data 缓存的数据  expire 过期时间 不填就直接缓存
export const setLocalStorage=(name,data,expire)=>{
  let curTime = new Date().getTime();//当前时间
  if(expire){localStorage.setItem(name,JSON.stringify({data:data,time: curTime,expire:expire}))}
  else{localStorage.setItem(name,JSON.stringify(data))}
};
//删除localStorage  js-cookie
export const removeLocalStorage = name => {
  if (!name) return;
  window.localStorage.removeItem(name);
  Cookies.remove(name);
}

/** 非空判断
 * @param {String} value 目标值
 * @return {Boolean} 是否为空
 */
 export function isEmpty(value) {
  return typeof value === 'undefined' || value === '' || value === null
}
/** 数据深拷
 * @param {Array|Object} 要拷贝的对象
 * @return {Array|Object} 返回拷贝的新对象
 */
 export function deepClone(source) {
  if (!source && typeof source !== 'object') {
    throw new Error('error arguments', 'shallowClone')
  }
  const targetObj = source.constructor === Array ? [] : {}
  for (const keys in source) {
    if (Object.prototype.hasOwnProperty.call(source, keys)) {
      if (
        source[keys] &&
        typeof source[keys] === 'object' &&
        !moment.isMoment(source[keys])
      ) {
        targetObj[keys] = source[keys].constructor === Array ? [] : {}
        targetObj[keys] = deepClone(source[keys])
      } else {
        targetObj[keys] = source[keys]
      }
    }
  }
  return targetObj
}