<template>
  <div class="home-container">
    <div class="header-title">锋馥外勤调度指挥中心</div>
    <div class="header-subtitle">Field Dispatching System</div>
    <div class="center-map-wrapper">
      <div id="map-container" class="map-container"></div>
      <div class="bottom-controls">
        <div class="total-count-panel">
          <div class="label">当前外勤总人数</div>
          <div class="count-wrapper">
            <span class="number">{{ countVal }}</span>
            <span class="unit">人</span>
          </div>
        </div>
        <div class="reset-btn" @click="resetMap" title="恢复视图">
          <ReloadOutlined />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { GetAddressStaticDataApi, GetPersonByAddressName } from '/@/api/system/home-view';
import { ReloadOutlined } from '@ant-design/icons-vue';
import { initSecurityConfig, initMap, resetMap as resetMapService, destroyMap, setMapData, setAllPersonList } from './map-service';

// 初始化安全配置
initSecurityConfig();

// 总人数
const countVal = ref(0);

onMounted(() => {
  // 并行加载
  getAddressStaticData();
  initMap('map-container', GetPersonByAddressNameData);
});

onUnmounted(() => {
  destroyMap();
});

// 获取考勤地域人数统计
function getAddressStaticData() {
  GetAddressStaticDataApi.getAddressStaticData().then(res => {
    if (res.data.Count) {
      countVal.value = res.data.Count;
    }

    let provinceData = {};
    let cityData = {};

    if (res.data.ProvinceData && Array.isArray(res.data.ProvinceData)) {
      provinceData = res.data.ProvinceData.reduce((acc, curr) => {
        if (curr.AddressName) {
          acc[curr.AddressName] = curr.Count;
        }
        return acc;
      }, {});
    }

    if (res.data.CityData && Array.isArray(res.data.CityData)) {
      cityData = res.data.CityData.reduce((acc, curr) => {
        if (curr.AddressName) {
          acc[curr.AddressName] = curr.Count;
        }
        return acc;
      }, {});
    }

    // 更新地图服务中的数据
    setMapData(provinceData, cityData, []);
  })
}

// 根据地址名称获取外勤人员列表
function GetPersonByAddressNameData(addressName) {
  return GetPersonByAddressName.getPersonByAddressName(addressName).then(res => {
    let list = [];
    if (res.data && Array.isArray(res.data)) {
      list = res.data;
    }
    // 更新地图服务中的人员列表
    setAllPersonList(list);
  }).catch(e => {
    console.error(e);
    setAllPersonList([]);
  });
}

function resetMap() {
  resetMapService();
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
