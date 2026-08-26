<!--
  * 锋馥外勤调度中心 - 手机端首页
  * 参考图：锋馥外勤调度中心手机端界面设计
  * 功能：人员统计、地区筛选、区域分布饼图、人员列表
-->
<template>
  <div class="field-work-page">
    <!-- 蓝色渐变 header 区 -->
    <div class="header-wrap">
      <!-- 顶部标题 -->
      <div class="page-header">
        <div class="page-title">锋馥外勤调度指挥中心</div>
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
      <div class="card-title">
        区域分布占比
      </div>
      <div class="pie-content">
        <div ref="pieChartRef" class="pie-chart"></div>
      </div>
    </div>

    <!-- 人员列表 -->
    <div class="card list-card">
      <div class="card-title list-title">
        全部人员<span class="title-count">({{ personList.length }})</span>
      </div>
      <div class="person-list">
        <div class="person-item" v-for="person in personList" :key="person.id">
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
            <div class="person-row">
              <span class="person-field">电话：{{ person.phone }}</span>
            </div>
          </div>
        </div>
        <div v-if="loading" class="empty-tip">加载中...</div>
        <div v-else-if="personList.length === 0" class="empty-tip">
          {{ filter.province ? '暂无数据' : '请选择省份或城市查看人员' }}
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

// 加载状态
const loading = ref(false);

/* ---------------- 筛选条件 ---------------- */
const filter = reactive({
  province: undefined,
  city: undefined,
});

/* ---------------- 省份（接口数据）/ 城市（行政区划插件数据） ---------------- */
const provinceOptions = ref([]);

// 城市下拉：根据所选省份，从行政区划插件 PROVINCE_CITY 中取对应城市的 children
// 城市名统一带"市"后缀（如"杭州" → "杭州市"），下拉展示与接口传参均用该名称
const cityOptions = computed(() => {
  if (!filter.province) return [];
  const province = PROVINCE_CITY.find((p) => p.label === filter.province);
  if (!province || !Array.isArray(province.children)) return [];
  return province.children.map((c) => {
    const label = c.label.endsWith('市') ? c.label : `${c.label}市`;
    return { value: label, label };
  });
});

/* ---------------- 饼图数据 ---------------- */
// 蓝色色阶（仅用于接口无数据时的兜底展示）
const BLUE_PALETTE = ['#00E5FF', '#7C4DFF', '#2ED8A7', '#FFD166', '#FF5C8A', '#4A8DFF', '#00B4D8', '#9D4EDD'];

// 为每个扇区生成不同颜色：按色相环均匀分布，保证省份间颜色不重复（低饱和、中亮度，观感柔和）
const getDistinctColor = (index) => {
  const goldenRatioConjugate = 0.618033988749895;
  // 随着索引增加，色相按黄金比例增加，视觉上非常舒适
  const hue = (index * 360 * goldenRatioConjugate) % 360;
  // 提升饱和度(S)至 75%，亮度(L)保持 60% 左右，保证在暗色背景上的通透感
  return `hsl(${hue}, 75%, 60%)`;
};

// 省份名简称（用于饼图标签）
const shortenName = (name) => {
  return String(name || '').replace(/省|市|特别行政区|壮族自治区|回族自治区|维吾尔自治区|自治区|壮族|回族|维吾尔/g, '');
};

// 全国默认分布数据（接口无数据时兜底）
const DEFAULT_PIE_DATA = () => [
  { name: '浙江', value: 0, color: BLUE_PALETTE[0] },
  { name: '江苏', value: 0, color: BLUE_PALETTE[1] },
  { name: '安徽', value: 0, color: BLUE_PALETTE[2] },
];

const pieData = ref([]);

const renderPieChart = () => {
  if (!pieChartRef.value) return;
  if (!pieChart) pieChart = echarts.init(pieChartRef.value);
  pieChart.setOption({
    tooltip: { trigger: 'item', show: false },
    // 底部图例
    legend: {
      orient: 'horizontal',
      bottom: 0,
      left: 'center',
      icon: 'circle',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 12,
      textStyle: {
        color: '#4b5563',
        fontSize: 11,
      },
      formatter: (name) => {
        const item = pieData.value.find((d) => d.name === name);
        return `${name} ${item ? item.value : 0}人`;
      },
    },
    series: [
      {
        type: 'pie',
        // 南丁格尔玫瑰图（基础 radius 类型：半径与数值成比例）
        radius: ['15%', '68%'],
        // 中心上移，为底部图例留出空间
        center: ['50%', '35%'],
        startAngle: 90,
        // 不使用引导线和扇区标签，信息全部由底部图例展示
        label: { show: false },
        labelLine: { show: false },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
        },
        emphasis: {
          scale: true,
          scaleSize: 4,
        },
        data: pieData.value.map((d) => ({
          name: d.name,
          value: d.value,
          itemStyle: { color: d.color },
        })),
      },
    ],
  });
};

const pieChartRef = ref(null);
let pieChart = null;

/* ---------------- 人员列表（接口数据） ---------------- */
const personList = ref([]);


// 将接口返回的人员字段映射为页面展示字段
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

// 根据地址名称加载人员列表（仅在筛选后调用）
const loadPersons = async (addressName) => {
  if (!addressName) return;
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

// 获取考勤地域人数统计：统计卡片 + 省份/城市下拉 + 全国饼图
const loadAddressStaticData = async () => {
  try {
    const res = await GetAddressStaticDataApi.getAddressStaticData();
    const data = res && res.data ? res.data : {};

    if (data.Count) {
      stats.total = data.Count;
    }

    // 省份下拉 + 饼图：ProvinceData（AddressName 为空的表示国外考情，不参与展示）
    const provinceArr = Array.isArray(data.ProvinceData) ? data.ProvinceData : [];
    const provinceList = provinceArr.filter((item) => item.AddressName);
    provinceOptions.value = provinceList.map((item) => ({ value: item.AddressName, label: item.AddressName }));

    // 饼图展示所有省份分布（ProvinceData 全部，按人数降序，每省不同颜色）
    pieData.value = provinceList
      .slice()
      .sort((a, b) => (b.Count || 0) - (a.Count || 0))
      .map((item, i) => ({
        name: shortenName(item.AddressName),
        value: item.Count || 0,
        color: getDistinctColor(i, provinceList.length),
      }));
    if (pieData.value.length === 0) {
      pieData.value = DEFAULT_PIE_DATA();
    }
    nextTick(() => renderPieChart());

    // 非大陆外勤人数（addressName 传 'NoPos'）
    loadNonMainland();
  } catch (e) {
    console.error(e);
    pieData.value = DEFAULT_PIE_DATA();
    nextTick(() => renderPieChart());
  }
};

// 非大陆外勤人数
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

/* ---------------- 筛选联动 ---------------- */
// 省份切换时清空已选城市
const onProvinceChange = () => {
  filter.city = undefined;
  onFilterChange();
};

const onFilterChange = async () => {
  if (filter.province) {
    if (filter.city) {
      // 已选城市：按城市加载
      await loadPersons(filter.city);
    } else {
      // 只选省份：按省份加载
      await loadPersons(filter.province);
    }
  } else {
    // 清空省份时同步清空城市，不展示人员（默认不展示所有人）
    filter.city = undefined;
    personList.value = [];
  }
};

/* ---------------- 重置筛选 ---------------- */
const resetFilter = () => {
  filter.province = undefined;
  filter.city = undefined;
  // 恢复默认状态：不展示人员列表（饼图始终展示全国省份分布，无需重置）
  personList.value = [];
};

/* ---------------- 生命周期 ---------------- */
onMounted(async () => {
  // 只加载统计/省份/城市/饼图数据，人员列表默认不展示，筛选后才加载
  await loadAddressStaticData();
  nextTick(() => {
    renderPieChart();
  });
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  if (pieChart) {
    pieChart.dispose();
    pieChart = null;
  }
});

const handleResize = () => {
  if (pieChart) pieChart.resize();
};
</script>

<style lang="less" scoped>
.field-work-page {
  min-height: 100vh;
  background: #f0f4fa;
  padding-bottom: 40px;
  max-width: 480px;
  margin: 0 auto;
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

    &:hover {
      background: rgba(255, 255, 255, 0.12);
    }

    &.placeholder {
      visibility: hidden;
    }
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

/* ============ 统计卡片（骑跨在蓝白交界处） ============ */
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

    .label-icon {
      font-size: 12px;
    }
  }

  .stat-value {
    margin-top: 8px;
    display: flex;
    align-items: baseline;
    gap: 6px;

    .value-icon {
      color: #4a8dff;
      font-size: 18px;
      margin-right: 4px;
    }
    .number {
      font-size: 26px;
      font-weight: 700;
      color: #1f2937;
      font-family: 'DIN Alternate', -apple-system, sans-serif;
    }
    .unit {
      font-size: 12px;
      color: #6b7280;
    }
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

  &:active {
    transform: scale(0.92);
  }
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

    &:hover {
      color: #4a8dff;
    }
  }
  :deep(.caret-icon) {
    color: #9ca3af;
    font-size: 12px;
  }

  &.ant-select-disabled {
    opacity: 0.55;
  }
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
  margin-bottom: 12px;
  display: flex;
  align-items: baseline;
  gap: 6px;

  .title-hint {
    font-size: 11px;
    font-weight: 400;
    color: #9ca3af;
  }
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
  align-items: baseline;
  gap: 4px;
}

.person-list {
  display: flex;
  flex-direction: column;
}

.person-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid #f0f3f8;
  cursor: pointer;
  transition: background 0.2s;

  &:last-child {
    border-bottom: none;
  }

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

.person-info {
  flex: 1;
  min-width: 0;
}

.person-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.person-row {
  display: flex;
  gap: 14px;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;

  .person-field {
    white-space: nowrap;
  }

  // 地址单独一行，完整展示可换行
  &.address-row {
    .person-field {
      white-space: normal;
      word-break: break-all;
      line-height: 1.5;
      max-width: 100%;
    }
  }
}

.list-footer {
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
  padding: 14px 0 4px;
  letter-spacing: 0.5px;
}

.empty-tip {
  text-align: center;
  font-size: 13px;
  color: #9ca3af;
  padding: 40px 0;
}
</style>
