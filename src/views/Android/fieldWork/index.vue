<!--
  * 锋馥外勤调度中心 - 手机端首页
  * 功能：人员统计、地区筛选、区域分布饼图、人员列表
  * 联动：下拉框与饼图双向联动，饼图向下钻取仅到市级
-->
<template>
  <div class="phone-wrapper">
    <div class="field-work-page" ref="pageRef">
    <!-- 蓝色渐变 header 区 -->
    <div class="header-wrap">
      <!-- 顶部标题 -->
      <div class="page-header">
        <div class="page-title">锋馥外勤调度中心</div>
        <div class="back-btn placeholder"></div>
      </div>
    </div>

    <!-- 骑跨在蓝白交界处的统计卡片 -->
    <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-label">
            <span>当前外勤总人数</span>
          </div>
          <div class="stat-value">
            <TeamOutlined class="value-icon" />
            <span class="number">{{ stats.total }}</span>
            <span class="unit">人</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">
            <span>非大陆外勤人数</span>
          </div>
          <div class="stat-value">
            <GlobalOutlined class="value-icon" />
            <span class="number">{{ stats.nonMainland }}</span>
            <span class="unit">人</span>
          </div>
        </div>
      </div>

    <!-- 筛选下拉 -->
    <div class="filter-row">
      <a-select
        v-model:value="filter.province"
        :options="provinceOptions"
        placeholder="省份"
        class="filter-select"
        :bordered="false"
        :allow-clear="true"
        :show-arrow="true"
        @change="onProvinceChange"
      >
        <template #suffixIcon>
          <CaretDownOutlined class="caret-icon" />
        </template>
      </a-select>
      <a-select
        v-model:value="filter.city"
        :options="cityOptions"
        placeholder="城市"
        class="filter-select"
        :bordered="false"
        :allow-clear="true"
        :disabled="!filter.province"
        @change="onFilterChange"
      >
        <template #suffixIcon>
          <CaretDownOutlined class="caret-icon" />
        </template>
      </a-select>
      <button class="reset-btn" title="重置筛选，恢复全国数据" @click="resetFilter">
        <ReloadOutlined />
      </button>
    </div>

    <!-- 区域分布占比 饼图 -->
    <div class="card pie-card">
      <div class="card-title pie-title">
        <span>区域分布占比</span>
        <button class="legend-toggle" :class="{ active: legendExpanded }" @click="toggleLegend">
          <span>{{ legendExpanded ? '收起' : '展开全部' }}</span>
          <DownOutlined v-if="!legendExpanded" class="toggle-icon" />
          <UpOutlined v-else class="toggle-icon" />
        </button>
      </div>
      <div class="pie-content">
        <div ref="pieChartRef" class="pie-chart" :style="{ height: legendCardHeight + 'px' }"></div>
      </div>
    </div>

    <!-- 人员列表 -->
    <div class="card list-card">
      <div class="card-title list-title">
        <span class="title-left">全部人员<span class="title-count">({{ filteredPersonList.length }})</span></span>
        <a-input
          v-model:value="keyword"
          placeholder="搜索人员"
          class="person-search"
          :bordered="false"
          :allow-clear="true"
        >
          <template #prefix>
            <SearchOutlined class="search-icon" />
          </template>
        </a-input>
      </div>
      <div class="person-list">
        <div class="person-item" v-for="person in filteredPersonList" :key="person.id">
          <div class="person-avatar">
            <UserOutlined />
          </div>
          <div class="person-info">
            <div class="person-name">{{ person.name }}</div>
            <div class="person-row">
              <span class="person-field">部门：{{ person.department }}</span>
              <span class="person-field">职位：{{ person.position }}</span>
            </div>
            <div class="person-row address-row">
              <span class="person-field">地址：{{ person.address }}</span>
            </div>
            <div class="person-row phone-row">
              <span class="person-field">电话：{{ person.phone }}</span>
              <span
                v-if="person.phone && person.phone !== '-'"
                class="call-btn"
                title="拨打电话"
                @click="callPhone(person.phone)"
              >
                <PhoneOutlined />
              </span>
            </div>
          </div>
        </div>
        <div v-if="loading" class="empty-tip">加载中...</div>
        <div v-else-if="filteredPersonList.length === 0" class="empty-tip">
          <template v-if="keyword">未找到匹配“{{ keyword }}”的人员</template>
          <template v-else>{{ filter.province ? '暂无数据' : '请选择省份或城市查看人员' }}</template>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import {
  TeamOutlined,
  GlobalOutlined,
  UserOutlined,
  CaretDownOutlined,
  ReloadOutlined,
  PhoneOutlined,
  SearchOutlined,
  DownOutlined,
  UpOutlined,
} from '@ant-design/icons-vue';
import * as echarts from 'echarts';
import { useRouter } from 'vue-router';
import { GetAddressStaticDataApi, GetPersonByAddressName } from '/@/api/system/home-view';
import { PROVINCE_CITY } from '/@/components/framework/area-cascader/province-city';

const router = useRouter();

/* ---------------- 统计数据 ---------------- */
const stats = reactive({
  total: 0,
  nonMainland: 0,
});

const loading = ref(false);

/* ---------------- 筛选条件 ---------------- */
const filter = reactive({
  province: undefined,
  city: undefined,
});

/* ---------------- 省份（接口数据）/ 城市（行政区划插件数据） ---------------- */
const provinceOptions = ref([]);

const cityOptions = computed(() => {
  if (!filter.province) return [];
  const province = PROVINCE_CITY.find((p) => p.label === filter.province);
  if (!province || !Array.isArray(province.children)) return [];
  return province.children.map((c) => {
    const label = c.label.endsWith('市') ? c.label : `${c.label}市`;
    return { value: label, label };
  });
});

/* ---------------- 饼图数据和颜色 ---------------- */
// 预设高级科技感色板（完美搭配 #4a8dff）
const BLUE_PALETTE = ['#00E5FF', '#7C4DFF', '#2ED8A7', '#FFD166', '#FF5C8A', '#4A8DFF', '#00B4D8', '#9D4EDD'];

const getDistinctColor = (index) => {
  return BLUE_PALETTE[index % BLUE_PALETTE.length];
};

const pieData = ref([]);
const pieChartRef = ref(null);
let pieChart = null;

/* ---------------- 图例折叠开关 ---------------- */
// 图例常驻底部；默认只展示前 N 项，点击"展开全部"展示所有图例
const LEGEND_COLLAPSED_COUNT = 6;
const legendExpanded = ref(false);
const visibleLegendNames = computed(() => {
  const names = pieData.value.map((d) => d.name);
  return legendExpanded.value ? names : names.slice(0, LEGEND_COLLAPSED_COUNT);
});
// 卡片高度跟随图例行数：饼图底(230) + 固定间距(10) + 图例实际高度，保证图例贴底、底部不空
const legendCardHeight = computed(() => {
  const n = visibleLegendNames.value.length;
  const rows = Math.max(1, Math.ceil(n / 3));
  return 260 + rows * 18 + 4;
});
const toggleLegend = () => {
  legendExpanded.value = !legendExpanded.value;
  nextTick(() => {
    renderPieChart();
    if (pieChart) pieChart.resize();
  });
};

const renderPieChart = () => {
  if (!pieChartRef.value) return;
  if (!pieChart) pieChart = echarts.init(pieChartRef.value);
  
  pieChart.setOption({
    tooltip: { trigger: 'item', show: false },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      left: 'center',
      icon: 'circle',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 12,
      textStyle: { color: '#4b5563', fontSize: 11 },
      data: visibleLegendNames.value,
      formatter: (name) => {
        const item = pieData.value.find((d) => d.name === name);
        return `${name} ${item ? item.value : 0}人`;
      },
    },
    series: [
      {
        type: 'pie',
        radius: ['20px', '112px'],
        center: ['50%', '118px'],
        startAngle: 90,
        label: { show: false },
        labelLine: { show: false },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
        },
        emphasis: { scale: true, scaleSize: 4 },
        data: pieData.value.map((d) => ({
          name: d.name,
          value: d.value,
          itemStyle: { color: d.color },
        })),
      },
    ],
  });
  nextTick(() => {
    if (pieChart) pieChart.resize();
  });
};

/* ---------------- 人员列表（接口数据） ---------------- */
const personList = ref([]);

/* ---------------- 人员名称搜索 ---------------- */
const keyword = ref('');

const filteredPersonList = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  if (!kw) return personList.value;
  return personList.value.filter((p) => (p.name || '').toLowerCase().includes(kw));
});

const mapPerson = (item, index) => {
  const code = (item.Name || '').charCodeAt(0) || 0;
  return {
    id: index,
    name: item.Name || '-',
    department: (item.Department || '-').split('\\').pop(),
    position: item.JobTitle || '-',
    address: item.PositionDetail || item.AttendenceRemark || '-',
    phone: item.Phone || '-',
  };
};

// 拨打电话
const callPhone = (phone) => {
  if (!phone || phone === '-') return;
  window.location.href = `tel:${phone}`;
};

const loadPersons = async (addressName) => {
  loading.value = true;
  try {
    const res = await GetPersonByAddressName.getPersonByAddressName(addressName);
    const list = res && res.data && Array.isArray(res.data) ? res.data : [];
    personList.value = list.map((item, index) => mapPerson(item, index));
  } catch (e) {
    console.error(e);
    personList.value = [];
  } finally {
    loading.value = false;
  }
};

/* ---------------- 根据人员列表动态生成饼图 (展示到省/市两级) ---------------- */
const updatePieDataByFilter = () => {
  const dataMap = {};

  // 从地址中去除省份前缀（如"浙江省杭州市" → "杭州市"），保证图例只展示市/区名
  const stripProvince = (addr) => {
    if (filter.province && addr.startsWith(filter.province)) {
      return addr.slice(filter.province.length);
    }
    return addr;
  };

  if (filter.city) {
    // 选了市：看市内各区县分布（从人员地址提取"区/县"）
    personList.value.forEach((p) => {
      const addr = stripProvince(p.address || '');
      const match = addr.match(/([\u4e00-\u9fa5]{1,10}?区)/) || addr.match(/([\u4e00-\u9fa5]{1,10}?县)/);
      const key = match ? match[1] : '其他区域';
      dataMap[key] = (dataMap[key] || 0) + 1;
    });
  } else if (filter.province) {
    // 只选省：看省内各市的分布（例如：杭州市余杭区 -> 匹配到杭州市）
    personList.value.forEach((p) => {
      const addr = stripProvince(p.address || '');
      const match = addr.match(/([\u4e00-\u9fa5]{2,10}?市)/);
      const key = match ? match[1] : '其他区域';
      dataMap[key] = (dataMap[key] || 0) + 1;
    });
  } else {
    // 未选省：全国分布（兜底数据）
    pieData.value = [];
    nextTick(() => renderPieChart());
    return;
  }

  const keys = Object.keys(dataMap);
  if (keys.length === 0) {
    pieData.value = [];
  } else {
    pieData.value = keys.map((key, i) => ({
      // 直接使用提取的市/区名（如"杭州市"/"余杭区"），不带省前缀
      name: key,
      value: dataMap[key],
      color: getDistinctColor(i, keys.length),
    }));
  }
  nextTick(() => renderPieChart());
};

/* ---------------- 筛选联动 ---------------- */
// 省份切换时清空已选城市
const onProvinceChange = () => {
  filter.city = undefined;
  onFilterChange();
};

const onFilterChange = async () => {
  if (filter.province) {
    loading.value = true;
    // 按 市/省 优先级加载人员列表
    await loadPersons(filter.city || filter.province);
    loading.value = false;

    // 选省 / 选市均联动更新饼图
    updatePieDataByFilter();
  } else {
    // 清空省份时同步清空城市，不展示人员列表
    filter.city = undefined;
    personList.value = [];
    // 恢复默认饼图
    pieData.value = [];
    nextTick(() => renderPieChart());
  }
};

/* ---------------- 重置筛选 ---------------- */
const resetFilter = () => {
  filter.province = undefined;
  filter.city = undefined;
  personList.value = [];
  loadAddressStaticData(); 
  loadPersons();
};

/* ---------------- 初始加载 ---------------- */
const loadAddressStaticData = async () => {
  try {
    const res = await GetAddressStaticDataApi.getAddressStaticData();
    const data = res && res.data ? res.data : {};

    if (data.Count) stats.total = data.Count;

    const provinceArr = Array.isArray(data.ProvinceData) ? data.ProvinceData : [];
    const provinceList = provinceArr.filter((item) => item.AddressName);
    provinceOptions.value = provinceList.map((item) => ({ value: item.AddressName, label: item.AddressName }));

    // 默认加载全国饼图（图例省份名保留完整名称，如"江苏省"）
    pieData.value = provinceList
      .slice()
      .sort((a, b) => (b.Count || 0) - (a.Count || 0))
      .map((item, i) => ({
        name: item.AddressName,
        value: item.Count || 0,
        color: getDistinctColor(i, provinceList.length),
      }));

    nextTick(() => renderPieChart());

    loadNonMainland();
  } catch (e) {
    console.error(e);
    pieData.value = [];
    nextTick(() => renderPieChart());
  }
};

const loadNonMainland = async () => {
  try {
    const res = await GetPersonByAddressName.getPersonByAddressName('NoPos');
    const list = res && res.data && Array.isArray(res.data) ? res.data : [];
    stats.nonMainland = list.length;
  } catch (e) {
    console.error(e);
    stats.nonMainland = 0;
  }
};



/* ---------------- 生命周期 ---------------- */
onMounted(async () => {
  await loadAddressStaticData();
   await loadPersons();
  nextTick(() => renderPieChart());
  window.addEventListener('resize', handleResize);
  // 手机端等比缩放适配
  applyScale();
  window.addEventListener('resize', applyScale);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('resize', applyScale);
  if (pieChart) {
    pieChart.dispose();
    pieChart = null;
  }
});

const handleResize = () => {
  if (pieChart) pieChart.resize();
};

/* ---------------- 手机端等比缩放（375 设计稿基准） ---------------- */
// 设计稿宽度与最大展示宽度（PC 预览时不超过 480px）
const DESIGN_WIDTH = 375;
const MAX_WIDTH = 480;

const pageRef = ref(null);

const applyScale = () => {
  const el = pageRef.value;
  if (!el) return;
  const vw = document.documentElement.clientWidth || window.innerWidth;
  // 手机端等比缩放；超过 480px（如 PC 预览）时锁定上限，保持居中
  const scale = Math.min(vw / DESIGN_WIDTH, MAX_WIDTH / DESIGN_WIDTH);
  el.style.transform = `scale(${scale})`;
  // 外层高度补偿，保证缩放后内容可正常滚动
  if (el.parentElement) {
    el.parentElement.style.height = `${el.offsetHeight * scale}px`;
  }
};
</script>

<style lang="less" scoped>
/* 外层容器：承载缩放后的页面，高度由 JS applyScale 动态补偿 */
.phone-wrapper {
  width: 100%;
  min-height: 100vh;
  background: #f0f4fa;
  overflow-x: hidden;
}

.field-work-page {
  /* 375 设计稿固定宽度，由 JS applyScale 整体等比缩放（手机端自适应） */
  width: 375px;
  min-height: 100vh;
  background: #f0f4fa;
  padding-bottom: 40px;
  margin: 0 auto;
  transform-origin: top center;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Segoe UI', sans-serif;
  color: #1f2937;
}

/* ============ 顶部蓝色 header ============ */
.header-wrap {
  position: relative;
  background: linear-gradient(180deg, #4a8dff 0%, #2e6cf3 100%);
  padding-bottom: 60px;
  border-radius: 0 0 24px 24px;
  box-shadow: 0 6px 20px rgba(46, 108, 243, 0.18);
  color: #fff;
}

.page-header {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: relative;

  .back-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: #fff;
    font-size: 18px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover { background: rgba(255, 255, 255, 0.12); }
    &.placeholder { visibility: hidden; }
  }

  .page-title {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    font-size: 20px;
    font-weight: 600;
    letter-spacing: 1px;
    color: #fff;
  }
}

/* ============ 统计卡片 ============ */
.stats-cards {
  position: relative;
  z-index: 2;
  margin: -35px 16px 0;
  display: flex;
  gap: 12px;
}

.stat-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 12px;
  padding: 12px 14px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
  color: #1f2937;

  .stat-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #4a8dff;
    font-weight: 500;
  }

  .stat-value {
    margin-top: 8px;
    display: flex;
    align-items: baseline;
    gap: 6px;

    .value-icon { color: #4a8dff; font-size: 18px; margin-right: 4px; }
    .number {
      font-size: 26px;
      font-weight: 700;
      color: #1f2937;
      font-family: 'DIN Alternate', -apple-system, sans-serif;
    }
    .unit { font-size: 12px; color: #6b7280; }
  }
}

/* ============ 筛选下拉 ============ */
.filter-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 16px 14px;
}

.reset-btn {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: none;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  color: #4a8dff;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #4a8dff;
    color: #fff;
    box-shadow: 0 2px 10px rgba(74, 141, 255, 0.35);
  }
  &:active { transform: scale(0.92); }
}

.filter-select {
  flex: 1;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  :deep(.ant-select-selector) {
    height: 40px !important;
    padding: 0 12px !important;
    border: none !important;
    box-shadow: none !important;
    background: transparent !important;
  }
  :deep(.ant-select-selection-placeholder) {
    color: #9ca3af;
    font-size: 14px;
    line-height: 40px !important;
    text-align: center;
  }
  :deep(.ant-select-selection-item) {
    line-height: 40px !important;
    text-align: center;
    font-size: 14px;
    color: #4a8dff;
    font-weight: 500;
  }
  :deep(.ant-select-arrow) {
    color: #9ca3af;
    font-size: 12px;
  }
  :deep(.ant-select-clear) {
    color: #9ca3af;
    font-size: 12px;
    right: 10px;
    background: #fff;
    border-radius: 50%;

    &:hover { color: #4a8dff; }
  }
  :deep(.caret-icon) { color: #9ca3af; font-size: 12px; }
  &.ant-select-disabled { opacity: 0.55; }
}

/* ============ 通用卡片 ============ */
.card {
  margin: 0 16px 14px;
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: baseline;
  gap: 6px;

  .title-count {
    font-weight: 500;
    color: #6b7280;
    font-size: 13px;
    margin-left: 2px;
  }
}

/* ============ 饼图卡片 ============ */
.pie-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #ffffff 0%, #eef5ff 100%);
}

.pie-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.legend-toggle {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(74, 141, 255, 0.1);
  border: none;
  border-radius: 14px;
  color: #4a8dff;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  .toggle-icon { font-size: 11px; }
  &:hover {
    background: rgba(74, 141, 255, 0.18);
  }
  &:active { transform: scale(0.95); }
  &.active {
    background: #4a8dff;
    color: #fff;
  }
}

.pie-content {
  position: relative;
  display: flex;
  justify-content: center;
  z-index: 1;
}

.pie-chart {
  width: 100%;
  height: 280px;
}

/* ============ 人员列表 ============ */
.list-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  .title-left {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  .person-search {
    flex-shrink: 0;
    width: 130px;
    height: 32px;
    background: #f0f4fa;
    border-radius: 16px;

    .search-icon { color: #9ca3af; font-size: 13px; }

    :deep(.ant-input) {
      font-size: 13px;
      background: transparent;
    }
    :deep(.ant-input::placeholder) { color: #9ca3af; }
    :deep(.ant-input-clear) {
      color: #9ca3af;
      background: #f0f4fa;
      font-size: 11px;
    }
  }
}

.person-list { display: flex; flex-direction: column; }

.person-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid #f0f3f8;
  cursor: pointer;
  transition: background 0.2s;

  &:last-child { border-bottom: none; }
  &:hover {
    background: #f9fbff;
    margin: 0 -10px;
    padding: 14px 10px;
    border-radius: 10px;
  }
}

.person-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  flex-shrink: 0;
  background: #4a8dff;
}

.person-info { flex: 1; min-width: 0; }

.person-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.person-row {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;

  .person-field { white-space: nowrap; }

  // 地址单独一行，完整展示可换行
  &.address-row {
    .person-field {
      white-space: normal;
      word-break: break-all;
      line-height: 1.5;
      max-width: 100%;
    }
  }

  // 拨打电话图标按钮
  &.phone-row {
    gap: 8px;

    .call-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: rgba(74, 141, 255, 0.12);
      color: #4a8dff;
      font-size: 12px;
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.2s;

      &:hover {
        background: #4a8dff;
        color: #fff;
      }

      &:active {
        transform: scale(0.9);
      }
    }
  }
}

.empty-tip {
  text-align: center;
  font-size: 13px;
  color: #9ca3af;
  padding: 40px 0;
}
</style>