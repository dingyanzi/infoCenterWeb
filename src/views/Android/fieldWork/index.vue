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
        @change="onFilterChange"
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
        全部人员<span class="title-count">({{ filteredPersonList.length }})</span>
      </div>
      <div class="person-list">
        <div class="person-item" v-for="person in filteredPersonList" :key="person.id">
          <div class="person-avatar" :style="{ background: person.avatarColor }">
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
        <div v-if="filteredPersonList.length === 0" class="empty-tip">暂无数据</div>
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

const router = useRouter();


/* ---------------- 统计数据 ---------------- */
const stats = reactive({
  total: 56,
  nonMainland: 0,
});

/* ---------------- 筛选条件 ---------------- */
const filter = reactive({
  province: undefined,
  city: undefined,
});

/* ---------------- 省份 / 城市 mock 数据 ---------------- */
const provinceOptions = [
  { value: 'zhejiang', label: '浙江省' },
  { value: 'jiangsu', label: '安徽省' },
  { value: 'shandong', label: '山东省' },
  { value: 'fujian', label: '福建省' },
  { value: 'guangdong', label: '广东省' },
  { value: 'sichuan', label: '四川省' },
  { value: 'hubei', label: '湖北省' },
  { value: 'hunan', label: '湖南省' },
];

const cityMap = {
  zhejiang: [
    { value: 'hangzhou', label: '杭州市' },
    { value: 'ningbo', label: '宁波市' },
    { value: 'wenzhou', label: '温州市' },
    { value: 'jiaxing', label: '嘉兴市' },
  ],
  jiangsu: [
    { value: 'nanjing', label: '南京市' },
    { value: 'suzhou', label: '苏州市' },
    { value: 'wuxi', label: '无锡市' },
  ],
  shandong: [
    { value: 'jinan', label: '济南市' },
    { value: 'qingdao', label: '青岛市' },
  ],
  fujian: [{ value: 'fuzhou', label: '福州市' }, { value: 'xiamen', label: '厦门市' }],
  guangdong: [
    { value: 'guangzhou', label: '广州市' },
    { value: 'shenzhen', label: '深圳市' },
  ],
  sichuan: [{ value: 'chengdu', label: '成都市' }, { value: 'mianyang', label: '绵阳市' }],
  hubei: [{ value: 'wuhan', label: '武汉市' }],
  hunan: [{ value: 'changsha', label: '长沙市' }],
};

const cityOptions = computed(() => (filter.province ? cityMap[filter.province] || [] : []));

/* ---------------- 饼图数据 ---------------- */
// 蓝色三色阶（深→中→浅）
const BLUE_PALETTE = ['#1F5BFF', '#6FA3FF', '#B8D4FF', '#D9E6FF', '#EAF2FF'];

// 全国默认分布数据
const DEFAULT_PIE_DATA = () => [
  { name: '浙江', value: 10, color: BLUE_PALETTE[0] },
  { name: '江苏', value: 10, color: BLUE_PALETTE[1] },
  { name: '安徽', value: 5, color: BLUE_PALETTE[2] },
];

const pieData = ref(DEFAULT_PIE_DATA());

const renderPieChart = () => {
  if (!pieChartRef.value) return;
  if (!pieChart) pieChart = echarts.init(pieChartRef.value);
  pieChart.setOption({
    tooltip: { trigger: 'item', show: false },
    series: [
      {
        type: 'pie',
        radius: ['42%', '62%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        startAngle: 90,
        // 引出线 + 文字标注
        label: {
          show: true,
          formatter: '{b}\n{c}人',
          color: '#1f2937',
          fontSize: 12,
          lineHeight: 16,
        },
        labelLine: {
          show: true,
          length: 10,
          length2: 6,
          lineStyle: {
            color: '#9fb4d8',
            width: 1,
          },
        },
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

/* ---------------- 人员列表 mock 数据 ---------------- */
const avatarColors = ['#4A90FF', '#FF8A4A',];

const personList = ref([
  { id: 1, name: '张三', department: '运营部', position: '外勤主管', address: '余杭专...', phone: '138****1234', province: 'zhejiang', city: 'hangzhou' },
  { id: 2, name: '李四', department: '销售部', position: '外勤专员', address: '余杭专...', phone: '139****5678', province: 'zhejiang', city: 'hangzhou' },
  { id: 3, name: '王五', department: '运维部', position: '工程师', address: '姑苏区平江路...', phone: '137****9012', province: 'jiangsu', city: 'suzhou' },
  { id: 4, name: '赵六', department: '客服部', position: '服务专员', address: '泰山区中山路...', phone: '136****3456', province: 'shandong', city: 'jinan' },
  { id: 5, name: '钱七', department: '销售部', position: '外勤专员', address: '思明区...', phone: '135****7890', province: 'fujian', city: 'xiamen' },
  { id: 6, name: '孙八', department: '运营部', position: '外勤主管', address: '天河区...', phone: '134****2345', province: 'guangdong', city: 'guangzhou' },
  { id: 7, name: '周九', department: '技术部', position: '工程师', address: '福田区...', phone: '133****6789', province: 'guangdong', city: 'shenzhen' },
  { id: 8, name: '吴十', department: '客服部', position: '服务专员', address: '锦江区...', phone: '132****0123', province: 'sichuan', city: 'chengdu' },
  { id: 9, name: '郑十一', department: '销售部', position: '外勤专员', address: '武昌区...', phone: '131****4567', province: 'hubei', city: 'wuhan' },
  { id: 10, name: '王十二', department: '运营部', position: '外勤主管', address: '岳麓区...', phone: '130****8901', province: 'hunan', city: 'changsha' },
].map((p) => ({ ...p, avatarColor: avatarColors[p.id % avatarColors.length] })));

/* ---------------- 筛选联动 ---------------- */
const filteredPersonList = computed(() => {
  return personList.value.filter((p) => {
    if (filter.province && p.province !== filter.province) return false;
    if (filter.city && p.city !== filter.city) return false;
    return true;
  });
});

const onFilterChange = () => {
  // 联动饼图：根据筛选范围更新饼图数据
  const list = filteredPersonList.value;
  // 按省/市 聚合（这里用省做维度示例）
  const groups = {};
  list.forEach((p) => {
    const key = p.province;
    const label = provinceOptions.find((o) => o.value === key)?.label?.replace(/[省市]$/, '') || key;
    if (!groups[label]) groups[label] = { name: label, value: 0, color: '' };
    groups[label].value += 1;
  });
  // 如果没有筛选或者筛了但没数据，回退到全国
  let nextData = Object.values(groups);
  if (nextData.length === 0) {
    nextData = DEFAULT_PIE_DATA();
  } else {
    nextData = nextData
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
      .map((d, i) => ({ ...d, color: BLUE_PALETTE[i] || BLUE_PALETTE[BLUE_PALETTE.length - 1] }));
  }
  pieData.value = nextData;
  nextTick(() => renderPieChart());
};

/* ---------------- 重置筛选：恢复全国数据 ---------------- */
const resetFilter = () => {
  filter.province = undefined;
  filter.city = undefined;
  pieData.value = DEFAULT_PIE_DATA();
  nextTick(() => renderPieChart());
};

/* ---------------- 生命周期 ---------------- */
onMounted(() => {
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
  height: 210px;
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
