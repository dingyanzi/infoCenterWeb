<template>
  <div class="home-container">
    <div class="header-title">云服务平台</div>
    <div id="map-container" class="map-container"></div>
    <div class="reset-btn" @click="resetMap">恢复视图</div>
    <div class="reset-btn reset-btn2" @click="testApi">同步人</div>
    <div class="reset-btn reset-btn3" @click="testApi2">同步考勤</div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import AMapLoader from '@amap/amap-jsapi-loader';
import { GetAllPersonApi, GetTheDayAttendanceListApi, GetAddressStaticDataApi, GetPersonByAddressName } from '/@/api/system/home-view';

// 设置高德地图安全密钥
window._AMapSecurityConfig = {
  securityJsCode: 'a638630aee3cf3231434f0587aa4cb8e',
};

// SVG 图标生成器
const getSvgContent = (color, count, type) => `
  <div class="map-icon-container">
    <svg viewBox="0 0 1024 1024" width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <path d="M512 85.333333c-164.949333 0-298.666667 133.738667-298.666667 298.666667 0 164.949333 298.666667 597.333333 298.666667 597.333333s298.666667-432.384 298.666667-597.333333c0-164.928-133.717333-298.666667-298.666667-298.666667z m0 448a149.333333 149.333333 0 1 1 0-298.666667 149.333333 149.333333 0 0 1 0 298.666667z" fill="${color}"></path>
    </svg>
    <div class="map-icon-count ${type}-count">${count}</div>
    <div class="pulse-ring"></div>
  </div>
`;

// 创建标记的公共函数
const createMarker = (map, position, content, extData) => {
  const marker = new AMapObj.Marker({
    position: position,
    content: content,
    anchor: 'bottom-center',
    offset: new AMapObj.Pixel(0, 0),
    zIndex: 100,
    map: map,
    extData: extData,
    visible: extData.level === 'province', // 省级默认显示，市级默认隐藏
    bubble: false
  });
  marker.on('click', async (e) => {
    // 点击时先获取人员数据
    await GetPersonByAddressNameData(extData.name);
    // 数据更新后再弹窗
    showInfoWindow(extData.name, e.lnglat);
  });
  return marker;
};

let map = null;
let AMapObj = null;

// 省级数据
let provinceData = {};

// 市级数据
let cityData = {};

// 所有人员数据
let allPersonList = [];

// 信息窗体实例
let infoWindow = null;

onMounted(() => {
  initMap();
  getAddressStaticData();
});

onUnmounted(() => {
  if (map) {
    map.destroy();
  }
});

// 同步人
function testApi() {
  GetAllPersonApi.getAllPerson().then(res => {
    console.log(res);
  })
}
// 同步考勤
function testApi2() {
  GetTheDayAttendanceListApi.getTheDayAttendanceList().then(res => {
    console.log(res);
  })
}

// 获取所有人员数据
function getAllPersonData() {
  GetAllPersonApi.getAllPerson().then(res => {
    if (res.data && Array.isArray(res.data)) {
      allPersonList = res.data;
    }
  });
}

//获取考勤地域人数统计
function getAddressStaticData() {
  GetAddressStaticDataApi.getAddressStaticData().then(res => {
    // console.log(res);
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

  })
}

//根据地址名称获取外勤人员列表
//根据地址名称获取外勤人员列表
function GetPersonByAddressNameData(addressName) {
  return GetPersonByAddressName.getPersonByAddressName(addressName).then(res => {
    // console.log(res);
    if (res.data && Array.isArray(res.data)) {
      allPersonList = res.data;
    } else {
      allPersonList = [];
    }
  }).catch(e => {
    console.error(e);
    allPersonList = [];
  });
}

function initMap() {
  AMapLoader.load({
    key: '291535961b0055175f859cad17407bcb',
    version: '2.0',
    plugins: ['AMap.Scale', 'AMap.DistrictLayer', 'AMap.DistrictSearch'], // 引入简易行政区图插件和搜索插件
  })
    .then((AMap) => {
      AMapObj = AMap; // Restore AMapObj assignment
      // 创建简易行政区图层（中国）
      const disCountry = new AMap.DistrictLayer.Country({
        zIndex: 10,
        SOC: 'CHN', // 中国
        depth: 2,   // 深度：2表示展示省份和地级市
        styles: {
          'nation-stroke': '#459CFF', // 国界线颜色
          'coastline-stroke': '#459CFF', // 海岸线颜色
          'province-stroke': 'rgba(255, 255, 255, 0.5)', // 省界颜色
          'city-stroke': 'rgba(255, 255, 255, 0.3)', // 市界颜色，比省界淡一些
          'fill': function (props) {
            // 根据不同省份及其adcode填充不同颜色，或统一颜色
            // 这里使用一种科技感的深蓝渐变模拟，返回固定色测试
            return 'rgb(39, 112, 181)';
          }
        }
      });

      map = new AMap.Map('map-container', {
        resizeEnable: true,
        zoom: 4.2, // 调整缩放级别以完整显示中国
        center: [105.122082, 35.719192], // 中心点对准中国几何中心
        viewMode: '3D',
        showLabel: false, // 不显示底图文字
        // zoomEnable: false, // 恢复缩放
        // scrollWheel: false, // 恢复滚轮
        // doubleClickZoom: false, // 恢复双击
        layers: [
          disCountry // 只添加行政区图层，实现“仅显示公鸡”效果，无底图
        ],
        skyColor: '#001529', // 天空颜色与背景一致作为融合
        pitch: 0, // 俯视角度，0为垂直
      });

      // 点击地图空白处关闭信息窗体
      map.on('click', () => {
        if (infoWindow) {
          infoWindow.close();
        }
      });

      // 显示省份名称
      initProvinceNames(AMap, map);
    })
    .catch((e) => {
      console.error(e);
    });
}



function initProvinceNames(AMap, map) {
  new AMap.DistrictSearch({
    subdistrict: 2, // 返回下两级行政区（省、市）
    extensions: 'base', // 返回基本信息（包含中心点）
  }).search('中国', (status, result) => {
    if (status === 'complete') {
      const provinces = result.districtList[0].districtList;
      const cityMarkers = []; // 存储市级文字标记
      const provinceDataMarkers = []; // 存储省级数据气泡
      const cityDataMarkers = []; // 存储市级数据气泡

      provinces.forEach((p) => {
        // 创建省份文字标记
        new AMap.Text({
          text: p.name,
          position: [p.center.lng, p.center.lat],
          anchor: 'center',
          zIndex: 10,
          style: { 'background-color': 'transparent', 'border': 'none', 'color': 'rgba(255, 255, 255, 0.9)', 'font-size': '12px', 'text-shadow': '0 0 3px #000', 'font-family': 'Microsoft YaHei', 'cursor': 'pointer' },
          map: map,
        }).on('click', () => map.setZoomAndCenter(7, [p.center.lng, p.center.lat]));

        // 省级数据 Marker
        if (provinceData[p.name]) {
          const content = getSvgContent('#06c4d4', provinceData[p.name], 'province');
          provinceDataMarkers.push(createMarker(map, [p.center.lng, p.center.lat], content, { name: p.name, level: 'province' }));
        }

        // 市级数据
        if (p.districtList) {
          p.districtList.forEach(c => {
            // 市级文字标记
            cityMarkers.push(new AMap.Text({
              text: c.name,
              position: [c.center.lng, c.center.lat],
              anchor: 'center',
              zIndex: 9,
              visible: false,
              style: { 'background-color': 'transparent', 'border': 'none', 'color': 'rgba(200, 200, 200, 0.8)', 'font-size': '10px', 'text-shadow': '0 0 2px #000', 'font-family': 'Microsoft YaHei', 'pointer-events': 'none' },
              map: map,
            }));

            // 市级数据 Marker
            if (cityData[c.name]) {
              const content = getSvgContent('#faad14', cityData[c.name], 'city');
              cityDataMarkers.push(createMarker(map, [c.center.lng, c.center.lat], content, { name: c.name, level: 'city' }));
            }
          });
        }
      });

      // 监听缩放事件控制标记显示
      map.on('zoomend', () => {
        const zoom = map.getZoom();
        const showCity = zoom >= 6; // 缩放大于等于6时显示市级

        // 控制文字标记
        cityMarkers.forEach(marker => {
          showCity ? marker.show() : marker.hide();
        });

        // 控制数据气泡
        if (showCity) {
          // 放大显示市级数据，隐藏省级数据
          provinceDataMarkers.forEach(m => m.hide());
          cityDataMarkers.forEach(m => m.show());
        } else {
          // 缩小显示省级数据，隐藏市级数据
          provinceDataMarkers.forEach(m => m.show());
          cityDataMarkers.forEach(m => m.hide());
        }
      });
    }
  });
}

function showInfoWindow(name, position) {
  const list = allPersonList
  // 构建内容
  const content = `
    <div class="custom-info-window">
      <div class="info-header">
        <span class="info-title">${name}</span>
        <span class="info-close" onclick="closeInfoWindow()">×</span>
      </div>
      <div class="info-body">
        <div class="list-header">
           <span style="width: 20%">姓名</span>
           <span style="width: 20%">部门</span>
           <span style="width: 20%">职位</span>
           <span style="width: 30%">地址</span>
           <span style="width: 30%">电话</span>
        </div>
        <div class="list-content" style="max-height: 250px; overflow-y: auto;" onwheel="event.stopPropagation()">
          ${list.length > 0 ? list.map(item => `
            <div class="list-item">
              <span style="width: 20%">${item.Name || '-'}</span>
              <span class="ellipsis-tooltip" style="width: 20%" title="${(item.Department || '-').split('\\').pop() || ''}">${(item.Department || '-').split('\\').pop()}</span>
              <span class="ellipsis-tooltip" title="${item.JobTitle || ''}" style="width: 20%">${item.JobTitle || '-'}</span>
              <span class="ellipsis-tooltip" title="${item.PositionDetail || ''}" style="width: 30%">${item.PositionDetail || '-'}</span>
              <span style="width: 30%">${item.Phone || '-'}</span>
            </div>
          `).join('') : '<div class="no-data">暂无数据</div>'}
        </div>
      </div>
    </div>
  `;

  if (!infoWindow) {
    infoWindow = new AMapObj.InfoWindow({
      isCustom: true, // 使用自定义窗体
      content: content,
      offset: new AMapObj.Pixel(0, -35)
    });
  } else {
    infoWindow.setContent(content);
  }

  infoWindow.open(map, position);
}

// 暴露给全局以便HTML字符串中的onclick调用
window.closeInfoWindow = function () {
  if (infoWindow) {
    infoWindow.close();
  }
}

function resetMap() {
  if (map) {
    map.setZoomAndCenter(4, [105.122082, 35.719192]);
    map.setPitch(0);
    window.closeInfoWindow();
  }
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
