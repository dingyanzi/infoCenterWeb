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
        <div class="page-title">锋馥外勤调度指挥中心</div>
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

    <!-- 外勤人员分布 -->
    <div class="card pie-card">
      <div class="card-title pie-title">
        <span>外勤人员分布</span>
        <button class="legend-toggle" :class="{ active: pieVisible }" @click="toggleLegend">
          <span>{{ pieVisible ? '收起' : '展开' }}</span>
          <UpOutlined v-if="pieVisible" class="toggle-icon" />
          <DownOutlined v-else class="toggle-icon" />
        </button>
      </div>
      <div v-show="pieVisible" class="pie-content">
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

/* ---------------- 饼图整体显示/隐藏 ---------------- */
// 点击标题右侧按钮：整个饼图（含图例）展开或收起
const pieVisible = ref(true);
const visibleLegendNames = computed(() => pieData.value.map((d) => d.name));
// 卡片高度跟随图例行数：图例从饼图下方 224px 开始往下排，紧贴饼图、底部不留空
// legend 已固定 lineHeight:22，单行精确 22px，加缓冲避免末排被裁
const legendCardHeight = computed(() => {
  const n = visibleLegendNames.value.length;
  const rows = Math.max(1, Math.ceil(n / 3));
  return 224 + rows * 22 + 8;
});
const toggleLegend = () => {
  pieVisible.value = !pieVisible.value;
  nextTick(() => {
    // 重新显示时图表容器恢复尺寸，需重绘并 resize，否则图表会空白/错位
    if (pieVisible.value) {
      renderPieChart();
      if (pieChart) pieChart.resize();
    }
    // 显隐改变卡片高度，主动重算缩放与外层高度，保证滚动范围与内容一致
    applyScale();
    // 强制重排重绘，规避移动端 transform:scale 下卡片背景不随高度刷新（底部断层）
    if (pageRef.value) void pageRef.value.offsetHeight;
  });
};

const renderPieChart = () => {
  if (!pieChartRef.value) return;
  if (!pieChart) pieChart = echarts.init(pieChartRef.value);
  
  pieChart.setOption({
    tooltip: { trigger: 'item', show: false },
    legend: {
      orient: 'horizontal',
      top: '224px',
      left: 'center',
      icon: 'circle',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 12,
      lineHeight: 22,
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
        radius: ['20px', '95px'],
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
    simpleDetail: item.SimpleDetail || '',
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

  if (filter.city) {
    // 选了市：看市内各区县分布 —— 用 SimpleDetail 去掉 省+市 前缀后的剩余部分（如"湖南省永州市祁阳市"→"祁阳市"）
    personList.value.forEach((p) => {
      const detail = p.simpleDetail || '';
      if (!detail) return;
      let rest = detail;
      if (filter.province && rest.startsWith(filter.province)) rest = rest.slice(filter.province.length);
      if (filter.city && rest.startsWith(filter.city)) rest = rest.slice(filter.city.length);
      const key = rest || '其他区域';
      dataMap[key] = (dataMap[key] || 0) + 1;
    });
  } else if (filter.province) {
    // 只选省：看省内各市的分布 —— 用 SimpleDetail 去掉省前缀后取"市"段（如"湖南省永州市祁阳市"→"永州市"）
    personList.value.forEach((p) => {
      const detail = p.simpleDetail || '';
      if (!detail) return;
      let rest = detail;
      if (filter.province && rest.startsWith(filter.province)) rest = rest.slice(filter.province.length);
      const match = rest.match(/^([\u4e00-\u9fa5]{2,10}?市)/);
      const key = match ? match[1] : (rest || '其他区域');
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
    // 清空省份：恢复全国默认数据（全国饼图 + 全国全部人员列表）
    resetFilter();
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
  // 内容动态变化（展开图例 / 加载人员等）时自动重算缩放与高度，避免滚动错位
  scaleObserver = new ResizeObserver(() => applyScale());
  if (pageRef.value) scaleObserver.observe(pageRef.value);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('resize', applyScale);
  if (scaleObserver) scaleObserver.disconnect();
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
  // 用 innerWidth 而非 clientWidth：垂直滚动条出现会挤占 clientWidth，导致 scale 抖动
  const vw = window.innerWidth;
  // 手机端等比缩放；超过 480px（如 PC 预览）时锁定上限，保持居中
  const scale = Math.min(vw / DESIGN_WIDTH, MAX_WIDTH / DESIGN_WIDTH);
  // 以顶部为缩放基准，保证视觉顶部与容器顶部对齐
  el.style.transformOrigin = 'top center';
  el.style.transform = `scale(${scale})`;
  // 关键：transform 只改“视觉大小”，不改“布局占位高度”。若只压外层高度，子元素仍按
  // 原始高度 H 占位，会导致滚动范围与看到的内容错位（滚不到底/顶）。用负 margin 把多出的
  // 占位收回，使外层高度刚好等于缩放后视觉高度，滚动范围与视觉一致。
  el.style.marginBottom = `-${el.offsetHeight * (1 - scale)}px`;
  if (el.parentElement) {
    el.parentElement.style.height = `${el.offsetHeight * scale}px`;
  }
};

let scaleObserver = null;
</script>

<style lang="less" scoped>
@import './index.less';
</style>
