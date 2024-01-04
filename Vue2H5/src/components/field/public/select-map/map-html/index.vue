<template>
  <div class="mapHtml">
    <mapsExample v-model="defaultObj" class="mapHeight" />
    <div style="margin-top: 20px">
      <div>当前位置: {{ defaultObj && defaultObj.formattedAddress }}</div>
      <div>经度：{{ defaultObj && defaultObj.lat }}</div>
      <div>纬度：{{ defaultObj && defaultObj.lng }}</div>
    </div>
  </div>
</template>

<script>
import mapsExample from '../map'
export default {
  name: 'Index',
  components: { mapsExample },
  data() {
    return {
      defaultObj: {}
    }
  },
  watch: {
    'defaultObj': {
      handler(val) {
        this.$emit('mapSubmit', val)
      },
      deep: true
    }

  },
  methods: {}
}
</script>

<style scoped lang="scss">
  .mapHtml{
    font-size: 14px;
    div{
      line-height: 30px;
    }
  }
  .mapHeight{
    height: 380px;
  }
</style>
