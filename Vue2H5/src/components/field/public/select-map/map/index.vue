<template>
  <div>
    <van-search
      v-model="searchVal"
      placeholder="请输入搜索关键字"
      shape="round"
      class="search"
    />

    <template>
      <div v-if="searchData.length > 0" class="search2">
        <p
          v-for="(item, index) in searchData"
          :key="index"
          @click="searchClick(item)"
        >
          {{ item.name }}
          <span>{{ item.district }}</span>
        </p>
      </div>
    </template>
    <div id="mapDiv" class="mapDiv" />
  </div>
</template>

<script>
export default {
  name: 'Index',
  props: {},
  data() {
    return {
      searchVal: '',
      timeout: null, // 定时器
      customizeMap: '',
      zoom: 16,
      searchData: [], // 地点搜索的数据
      marker: '', // Marker实例
      presentPosition: {}, // 地图坐标
      defaultObj: {} // 需要传出去的data合集
    }
  },
  watch: {
    searchVal (newVal) {
      // 实现input连续输入，只发一次请求
      clearTimeout(this.timeout)
      if (newVal !== '') {
        this.timeout = setTimeout(() => {
          this.search()
        }, 600)
      } else {
        this.searchData = []
      }
    },
    defaultObj(val) {
      this.$emit('input', val)
    },
    deep: true
  },
  mounted() {
    this.init()
  },
  methods: {
    async init() {
      await this.$nextTick()
      this.mapInit()
    },
    async search() {
      // 输入提示
      var autoComplete = new AMap.Autocomplete({
        city: '全国'
      })
      const _this = this
      await autoComplete.search(this.searchVal, function (status, result) {
        if (result.tips === undefined) {
          _this.searchData = []
        } else {
          _this.searchData = result.tips
        }
      })
    },
    // 销毁地图
    destroyMap () {
      this.customizeMap && this.customizeMap.destroy()
      this.customizeMap = ''
    },
    // 初始化
    mapInit () {
      const _this = this
      this.customizeMap = new AMap.Map('mapDiv', {
        resizeEnable: true,
        zoom: this.zoom, // 初始化地图层级
        viewMode: '3D' // 使用3D视图
      })
      AMap.plugin('AMap.Geolocation', function () {
        var geolocation = new AMap.Geolocation({
          enableHighAccuracy: true, // 是否使用高精度定位，默认:true
          timeout: 10000, // 超过10秒后停止定位，默认：5s
          buttonPosition: 'RB', // 定位按钮的停靠位置
          buttonOffset: new AMap.Pixel(10, 20), // 定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
          zoomToAccuracy: true, // 定位成功后是否自动调整地图视野到定位点
          showMarker: false,
          buttonDom: "<div class='amap-geo' id='location'></div>"
        })
        _this.customizeMap.addControl(geolocation)
        geolocation.getCurrentPosition(function (status, result) {
          if (status === 'complete') {
            _this.onComplete(result)
          } else {
            _this.onError(result)
          }
        })

        var location = document.getElementById('location')
        // 第一种 通过点击事件
        location.onclick = function () {
          geolocation.getCurrentPosition(function (status, result) {
            if (status === 'complete') {
              _this.onComplete(result)
            } else {
              _this.onError(result)
            }
          })
        }
      })

      // 绑定点击事件
      _this.customizeMap.on('click', function (e) {
        _this.currentPosition(e)
      })
    },
    // 解析定位错误信息
    onError (data) { },
    // 点击事件
    currentPosition (e) {
      this.presentPosition = e.lnglat
      // 再添加标记
      this.createMarker(e.lnglat.lng, e.lnglat.lat)
    },
    // 解析定位结果
    onComplete (data) {
      this.presentPosition = data.position
      this.createMarker(data.position.lng, data.position.lat)
    },
    // 创建Marker
    createMarker (lng, lat, type = true) {
      // 先删除
      this.customizeMap.remove(this.marker)
      // 创建一个 Marker 实例：
      this.marker = new AMap.Marker({
        position: new AMap.LngLat(lng, lat) // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
      })
      // 将创建的点标记添加到已有的地图实例：
      this.customizeMap.add(this.marker)
      if (type) { this.getLocation() }
    },
    // 逆向地理编码方法
    getLocation () {
      const _this = this
      var geocoder = new AMap.Geocoder({})
      var lnglat = [_this.presentPosition.lng, _this.presentPosition.lat]
      geocoder.getAddress(lnglat, function (status, result) {
        if (status === 'complete' && result.info === 'OK') {
          // result为对应的地理位置详细信息
          _this.formattedAddress = result.regeocode.formattedAddress
          _this.defaultObj = {
            formattedAddress: _this.formattedAddress,
            lng: _this.presentPosition.lng,
            lat: _this.presentPosition.lat
          }
        }
      })
    },

    searchClick (item) {
      if (item.location !== '') {
        this.customizeMap.setZoomAndCenter(this.zoom, [
          item.location.lng,
          item.location.lat
        ])
        this.presentPosition = item.location
        this.createMarker(item.location.lng, item.location.lat, false)
        this.defaultObj = {
          formattedAddress: item.district + item.name,
          lng: item.location.lng,
          lat: item.location.lat
        }
      } else {
        // 先删除
        this.customizeMap.remove(this.marker)
        this.defaultObj = {
          formattedAddress: '',
          lng: '',
          lat: ''
        }

        this.customizeMap.setCity(item.name)
      }

      this.searchVal = item.name
      this.searchData = []

      setTimeout(() => {
        clearTimeout(this.timeout)
      }, 400)
    }
  }
}
</script>

<style scoped lang="scss">
  .mapDiv{
    height: 100%;
  }
  .search{
    width: 100%;
    position: absolute;
    right: 0;
    top:0;
    z-index: 3;
  }
  .search2 {
    width: 100%;
    position: absolute;
    right: 0;
    top:50px;
    z-index: 5;
    background: #fff;
    max-height: 200px;
    overflow: auto;
  }
  .search2 p {
    font-size: 10px;
    padding: 2px 6px;
    margin: 0;
  }
  .search2 p:hover {
    background: #b6d3ff;
    color: #000;
    cursor: pointer;
  }
  .search2 p span {
    color: #c1c1c1;
    padding-left: 4px;
  }
</style>
