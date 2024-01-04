<template>
  <universallyEcharts
    id="mapEcharts"
    ref="mapEcharts"
    :option="option"
    @click="echartsMapClick"
  />
</template>

<script>
import universallyEcharts from '../../universallyEcharts/index'
import echarts from 'echarts'
// 浙江省地图
import zhejiang from 'views/policyassist/center/centerMap/components/config/zhejiang.json'
// 浙江省内市级地图
import hangzhou from 'views/policyassist/center/centerMap/components/config/hangzhou.json'
import ningbo from 'config/map/json/city/ningbo.json'
import huzhou from 'config/map/json/city/huzhou.json'
import jiaxing from 'config/map/json/city/jiaxing.json'
import shaoxing from 'config/map/json/city/shaoxing.json'
import taizhou from 'config/map/json/city/taizhou.json'
import jinhua from 'config/map/json/city/jinhua.json'
import quzhou from 'config/map/json/city/quzhou.json'
import lishui from 'config/map/json/city/lishui.json'
import wenzhou from 'config/map/json/city/wenzhou.json'
import zhoushan from 'config/map/json/city/zhoushan.json'
export default {
  name: 'Index',
  components: { universallyEcharts },
  props: {
    mapKey: {
      type: String,
      default: 'areaCode'
    },
    value: {
      type: null,
      default: '浙江省'
    }
  },
  data() {
    return {
      option: {},
      markData: [
        // { name: '钱塘新区', value: [120.485, 30.284, 29999] }
      ],
      mapData: [ // 用来适配 mapJson 的
        { name: '浙江省', areaCode: 330000000000, json: zhejiang, type: 'province' }, { name: '杭州市', areaCode: 330100000000, json: hangzhou, type: 'city' },
        { name: '宁波市', areaCode: 330200000000, json: ningbo, type: 'city' }, { name: '湖州市', areaCode: 330500000000, json: huzhou, type: 'city' },
        { name: '嘉兴市', areaCode: 330400000000, json: jiaxing, type: 'city' }, { name: '绍兴市', areaCode: 330600000000, json: shaoxing, type: 'city' },
        { name: '台州市', areaCode: 331000000000, json: taizhou, type: 'city' }, { name: '金华市', areaCode: 330700000000, json: jinhua, type: 'city' },
        { name: '衢州市', areaCode: 330800000000, json: quzhou, type: 'city' }, { name: '丽水市', areaCode: 331100000000, json: lishui, type: 'city' },
        { name: '温州市', areaCode: 330300000000, json: wenzhou, type: 'city' }, { name: '舟山市', areaCode: 330900000000, json: zhoushan, type: 'city' }
      ],
      setAreaId: null // 用来设置地图的数据（参考mapJson）
    }
  },
  computed: {
    areaId() {
      return this.setAreaId || this.value
    }
  },
  watch: {
    'value': {
      handler() {
        this.setAreaId = null
        this.setMapJson()
      }
    }
  },
  created() {
    this.init()
  },
  methods: {
    // 初始化
    async init() {
      this.setMapJson()
      const seriesData = []
      this.mapData.forEach((res) => {
        res.json.features.forEach((res2) => {
          seriesData.push({ name: res2.properties.name, adcode: (res2.properties.adcode || res2.properties.code) + '000000' })
        })
      })
      this.option = {
        geo: {
          show: true,
          map: 'city',
          zoom: 1.1,
          z: 0,
          aspectScale: 0.9,
          itemStyle: {
            normal: {
              borderColor: '#1183D5', // 边界线颜色
              borderWidth: 3,
              areaColor: '#1B3077', // 背景色
              shadowColor: '#2157A9',
              shadowOffsetX: 0,
              shadowOffsetY: 12
            },
            emphasis: {
              areaColor: '#3154C9', // 鼠标悬浮高亮
              borderWidth: 2
            }
          }
        },
        tooltip: {
          show: false, trigger: 'item', extraCssText: 'z-index:2',
          triggerOn: 'mousemove', enterable: true,
          textStyle: { fontSize: this.$toRem(14) },
          formatter: (param) => {
            return param
          }
        },
        series: [
          {
            type: 'map',
            roam: false,
            aspectScale: 0.9,
            label: {
              normal: {
                show: true, // 控制地图中的省份文字显示隐藏
                textStyle: { color: '#fff', fontSize: 14 }
              },
              emphasis: {
                show: true, // 控制鼠标悬浮时地图中的省份文字显示隐藏
                areaColor: '#1989FA', borderWidth: 0,
                textStyle: { color: '#fff' }
              }
            },
            data: seriesData,
            itemStyle: {
              normal: {
                borderColor: '#1183D5', // 边界线颜色
                borderWidth: 3,
                areaColor: '#102054' // 背景色
              },
              emphasis: {
                areaColor: '#3154C9', // 鼠标悬浮高亮
                borderWidth: 2
              }
            },
            zoom: 1.1,
            map: 'city' // 使用
          },
          {
            type: 'scatter', coordinateSystem: 'geo', // 这里是一个模板 可以地图上放对应的图片（没用到目前）
            showEffectOn: 'render',
            symbol: 'image://' + require('@/assets/img/center-map/green.png'),
            symbolSize: [50, 50], hoverAnimation: false,
            label: {
              normal: {
                show: true,
                formatter(v) { return v.data.area_name + '\n' + v.data.chart_value },
                textStyle: { color: '#fff', fontSize: this.$toRem(14) }
              }
            },
            itemStyle: {
              // 打点的颜色
              normal: { shadowBlur: 10, shadowColor: '#0d5ebd' }
            },
            data: this.markData
          }
        ]
      }
    },
    // 设置地图的json数据
    setMapJson() {
      const mapFind = this.mapData.find((res) => {
        return res[this.mapKey] === this.areaId
      })
      if (mapFind) {
        // 配置地图的json数据
        echarts.registerMap('city', mapFind?.json)
        this.$refs?.mapEcharts?.initChart()
      }
    },
    /**
     * 地图点击
     */
    echartsMapClick(params) {
      let obj = {}
      obj = this.mapData.find((item) => item.name === params.name)
      if (obj?.[this.mapKey]) {
        this.setAreaId = obj?.[this.mapKey]
        this.setMapJson()
      } else {
        obj = params
      }
      this.$emit('update:value', obj.name)
      this.$emit('echartsMapClick', obj)
    }
  }
}
</script>

<style scoped>

</style>
