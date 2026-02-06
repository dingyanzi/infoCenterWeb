import AMapLoader from '@amap/amap-jsapi-loader';

let map = null;
let AMapObj = null;
let infoWindow = null;
let provinceData = {};
let cityData = {};
let allPersonList = [];

/**
 * 设置高德地图安全密钥
 */
export function initSecurityConfig() {
    window._AMapSecurityConfig = {
        securityJsCode: 'a638630aee3cf3231434f0587aa4cb8e',
    };
}

/**
 * 设置数据
 * @param {Object} pData 省级数据
 * @param {Object} cData 市级数据
 * @param {Array} aList 所有人员列表
 */
export function setMapData(pData, cData, aList) {
    provinceData = pData || {};
    cityData = cData || {};
    allPersonList = aList || [];
}

/**
 * 更新所有人员列表数据
 * @param {Array} list 
 */
export function setAllPersonList(list) {
    allPersonList = list || [];
}

/**
 * 获取SVG内容
 */
const getSvgContent = (color, count, type) => `
  <div class="map-icon-container">
    <svg viewBox="0 0 1024 1024" width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <path d="M512 85.333333c-164.949333 0-298.666667 133.738667-298.666667 298.666667 0 164.949333 298.666667 597.333333 298.666667 597.333333s298.666667-432.384 298.666667-597.333333c0-164.928-133.717333-298.666667-298.666667-298.666667z m0 448a149.333333 149.333333 0 1 1 0-298.666667 149.333333 149.333333 0 0 1 0 298.666667z" fill="${color}"></path>
    </svg>
    <div class="map-icon-count ${type}-count">${count}</div>
    <div class="pulse-ring"></div>
  </div>
`;

/**
 * 创建标记
 */
const createMarker = (map, position, content, extData, onMarkerClick) => {
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
        if (onMarkerClick) {
            await onMarkerClick(extData.name);
        }
        showInfoWindow(extData.name, e.lnglat);
    });
    return marker;
};

/**
 * 显示信息窗体
 */
function showInfoWindow(name, position) {
    const list = allPersonList;
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

/**
 * 关闭信息窗体
 */
window.closeInfoWindow = function () {
    if (infoWindow) {
        infoWindow.close();
    }
}

/**
 * 初始化省份名称和数据点
 */
function initProvinceNames(AMap, map, onMarkerClick) {
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
                    provinceDataMarkers.push(createMarker(map, [p.center.lng, p.center.lat], content, { name: p.name, level: 'province' }, onMarkerClick));
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
                            cityDataMarkers.push(createMarker(map, [c.center.lng, c.center.lat], content, { name: c.name, level: 'city' }, onMarkerClick));
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

/**
 * 初始化地图
 * @param {string} containerId 容器ID
 * @param {function} onMarkerClick 点击标记的回调函数，返回Promise
 */
export function initMap(containerId, onMarkerClick) {
    return AMapLoader.load({
        key: '291535961b0055175f859cad17407bcb',
        version: '2.0',
        plugins: ['AMap.Scale', 'AMap.DistrictLayer', 'AMap.DistrictSearch'], // 引入简易行政区图插件和搜索插件
    })
        .then((AMap) => {
            AMapObj = AMap;
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
                        return 'rgb(39, 112, 181)';
                    }
                }
            });

            map = new AMap.Map(containerId, {
                resizeEnable: true,
                zoom: 4.3, // 放大地图
                center: [105.122082, 38.0], // 中心点北移以隐藏群岛，保留中国主体
                viewMode: '3D',
                showLabel: false, // 不显示底图文字
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

            // 交互效果变量
            let hoverAdcode = -1;

            // 监听鼠标移动事件实现Hover变色
            map.on('mousemove', function (ev) {
                const px = ev.pixel;
                // 获取鼠标当前位置的行政区信息
                const props = disCountry.getDistrictByContainerPos(px);

                if (props) {
                    const adcode = props.adcode;
                    if (adcode !== hoverAdcode) {
                        hoverAdcode = adcode;
                        // 更新图层样式
                        disCountry.setStyles({
                            'nation-stroke': '#459CFF',
                            'coastline-stroke': '#459CFF',
                            'province-stroke': 'rgba(255, 255, 255, 0.5)',
                            'city-stroke': 'rgba(255, 255, 255, 0.3)',
                            'fill': function (props) {
                                // 高亮当前悬停的行政区，其他保持原色
                                return props.adcode == hoverAdcode ? 'rgba(69, 156, 255, 0.8)' : 'rgb(39, 112, 181)';
                            }
                        });
                    }
                } else {
                    if (hoverAdcode !== -1) {
                        hoverAdcode = -1;
                        // 恢复默认样式
                        disCountry.setStyles({
                            'nation-stroke': '#459CFF',
                            'coastline-stroke': '#459CFF',
                            'province-stroke': 'rgba(255, 255, 255, 0.5)',
                            'city-stroke': 'rgba(255, 255, 255, 0.3)',
                            'fill': function (props) {
                                return 'rgb(39, 112, 181)';
                            }
                        });
                    }
                }
            });

            // 显示省份名称
            initProvinceNames(AMap, map, onMarkerClick);

            return map;
        })
        .catch((e) => {
            console.error(e);
        });
}

/**
 * 重置地图视图
 */
export function resetMap() {
    if (map) {
        map.setZoomAndCenter(4.3, [105.122082, 38.0]);
        map.setPitch(0);
        window.closeInfoWindow();
    }
}

/**
 * 销毁地图
 */
export function destroyMap() {
    if (map) {
        map.destroy();
        map = null;
    }
}
