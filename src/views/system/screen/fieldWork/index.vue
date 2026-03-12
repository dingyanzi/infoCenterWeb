<template>
  <div class="home-container">
    <div class="header-title">锋馥外勤调度指挥中心</div>
    <div class="header-subtitle">Field Dispatching System</div>
    <div class="center-map-wrapper">
      <div id="map-container" class="map-container"></div>
      <div class="bottom-controls">
        <div class="count-panels">
          <div class="total-count-panel">
            <div class="label">当前外勤总人数</div>
            <div class="count-wrapper">
              <span class="number">{{ countVal }}</span>
              <span class="unit">人</span>
            </div>
          </div>
          <div class="foreign-btn" @click="showForeignData" title="查看非大陆外勤">
            <div class="btn-text">非大陆外勤人数</div>
            <div class="count-wrapper">
              <span class="number">{{ foreignCountVal }}</span>
              <span class="unit">人</span>
            </div>
            <!-- 非大陆外勤数据弹窗 -->
            <div v-show="showForeignModal" class="foreign-data-modal">
              <div class="custom-info-window">
                <div class="info-header">
                  <span class="info-title">非大陆</span>
                  <span class="info-close" @click.stop="closeForeignModal">×</span>
                </div>
                <div class="info-body">
                  <div class="list-header">
                    <span style="width: 20%">姓名</span>
                    <span style="width: 20%">部门</span>
                    <span style="width: 20%">职位</span>
                    <span style="width: 30%">描述</span>
                    <span style="width: 30%">电话</span>
                  </div>
                  <div class="list-content" style="max-height: 250px; overflow-y: auto;">
                    <div v-for="(item, index) in foreignDataList" :key="index" class="list-item">
                      <span style="width: 20%">{{ item.Name || '-' }}</span>
                      <span class="ellipsis-tooltip" style="width: 20%" :title="(item.Department || '-').split('\\').pop() || ''">{{ (item.Department || '-').split('\\').pop() }}</span>
                      <span class="ellipsis-tooltip" :title="item.JobTitle || ''" style="width: 20%">{{ item.JobTitle || '-' }}</span>
                      <span class="ellipsis-tooltip" :title="item.AttendenceRemark || ''" style="width: 30%">{{ item.AttendenceRemark || '-' }}</span>
                      <span style="width: 30%">{{ item.Phone || '-' }}</span>
                    </div>
                    <div v-if="foreignDataList.length === 0" class="no-data">暂无数据</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="right-buttons">
          <div class="reset-btn" @click="resetMap" title="恢复视图">
            <ReloadOutlined />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { GetAddressStaticDataApi, GetPersonByAddressName } from '/@/api/system/home-view';
import { ReloadOutlined, GlobalOutlined } from '@ant-design/icons-vue';
import { initSecurityConfig, initMap, resetMap as resetMapService, destroyMap, setMapData, setAllPersonList } from './map-service';

// 初始化安全配置
initSecurityConfig();

// 总人数
const countVal = ref(0);

// 国外考情数据
const foreignData = ref([]);

// 非大陆外勤数据
const foreignDataList = ref([]);

// 非大陆外勤人数
const foreignCountVal = ref(0);

// 显示非大陆外勤弹窗
const showForeignModal = ref(false);

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

    //筛选省数据中AddressName为空的说明是国外考情，需要展示该数据
    foreignData.value = res.data.ProvinceData.filter(item => !item.AddressName);
    
    // 更新非大陆外勤人数
    foreignCountVal.value = foreignData.value.length;
    
    // 更新地图服务中的数据
    setMapData(provinceData, cityData, foreignData.value);
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

// 显示非大陆外勤数据
function showForeignData() {
  // 调用接口获取非大陆外勤数据，入参 addressName='NoPos'
  GetPersonByAddressName.getPersonByAddressName('NoPos').then(res => {
    let list = [];
    if (res.data && Array.isArray(res.data)) {
      list = res.data;
    }
    // 更新数据并显示弹窗
    foreignDataList.value = list;
    foreignCountVal.value = list.length;
    showForeignModal.value = true;
    // 添加点击外部关闭弹窗的事件监听
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);
  }).catch(e => {
    console.error(e);
    foreignDataList.value = [];
    foreignCountVal.value = 0;
    showForeignModal.value = true;
    // 添加点击外部关闭弹窗的事件监听
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);
  });
}

// 点击外部关闭弹窗
function handleClickOutside(e) {
  const foreignBtn = document.querySelector('.foreign-btn');
  const modal = document.querySelector('.foreign-data-modal');
  if (foreignBtn && modal && !foreignBtn.contains(e.target) && !modal.contains(e.target)) {
    closeForeignModal();
  }
}

// 关闭非大陆外勤弹窗
function closeForeignModal() {
  showForeignModal.value = false;
  document.removeEventListener('click', handleClickOutside);
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
