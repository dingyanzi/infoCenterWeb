<template>
  <div class="screenView">
    <!-- 顶部标题 -->
    <div class="headBg">
      <img class="logoImg" :src="logoImg" alt="" />
      <img class="headImg" :src="headBgImg" alt="" />
      <div class="title">诺博智能仓储可视化看板</div>
      <!-- <div class="subTitle">2号库</div> -->
    </div>
    <!-- 内容区域 -->
    <div class="contentBg">
      <!-- 左边内容 -->
      <div class="leftContent">
        <!-- 关键指标 -->
        <div class="dayView">
          <img class="titImg" :src="titBgImg" alt="" />
          <div class="title">关键指标</div>
        </div>
        <!-- 毛坯/喷漆件占比 -->
        <div class="orderView">
          <img class="titImg" :src="titBgImg" alt="" />
          <div class="title">毛坯/喷漆件占比</div>
          <div class="orderRatio" id="orderRatio"></div>
        </div>
        <!-- 输送线任务  -->
        <div class="materialView">
          <img class="titImg" :src="titBgImg" alt="" />
          <div class="title">输送线任务</div>
          <div class="materialNums" id="materialNum"></div>
        </div>
      </div>
      <!-- 中间内容 -->
      <div class="centerContent">
        <!-- 全景（库区分布图） -->
        <div class="taskView">
          <img class="titImg" :src="titBg2Img" alt="" />
          <div class="title">全景（库区分布图）</div>
        </div>
        <!-- 储位分布图 -->
        <div class="outInView">
          <img class="titImg" :src="titBg2Img" alt="" />
          <div class="title">储位分布图</div>
          <div class="outInList"></div>
        </div>
      </div>
      <!-- 右边内容 -->
      <div class="rightContent">
        <!-- 库区状态信息 -->
        <div class="unTaskView">
          <img class="titImg" :src="titBg2Img" alt="" />
          <div class="title">库区状态信息</div>
          <div class="progress-list">
            <div class="progress-item">
              <div class="label">毛坯件数量</div>
              <div class="bar">
                <div class="fill blue" :style="{ width: rough + '%' }"></div>
              </div>
            </div>

            <div class="progress-item">
              <div class="label">喷漆件数量</div>
              <div class="bar">
                <div class="fill cyan" :style="{ width: paint + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
        <!-- 库位利用率 -->
        <div class="locationView">
          <img class="titImg" :src="titBgImg" alt="" />
          <div class="title">库位利用率</div>
          <div class="locationNums" id="locationNum"></div>
        </div>
        <!-- 物料库龄统计 -->
        <div class="materialAgeView">
          <img class="titImg" :src="titBgImg" alt="" />
          <div class="title">设备实时状态</div>
          <div class="materialAgeNumList"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import * as echarts from 'echarts';
  import logoImg from '/@/assets/images/logo/smart-admin-logo.png';
  import headBgImg from '/@/assets/screen/headBg.png';
  import titBgImg from '/@/assets/screen/titBg.png';
  import titBg2Img from '/@/assets/screen/titBg2.png';
  // import { getHomePageLocationsStatistics } from '@/api/screen';

  // 响应式数据
  const homePageLocationsStatistics = ref([
    { value: 0, name: '占用', key: 'InStockCount' },
    { value: 0, name: '空货位', key: 'EmptyCount' },
    { value: 0, name: '预留入库', key: 'PreInCount' },
    { value: 0, name: '预留出库', key: 'PreOutCount' },
    { value: 0, name: '禁用', key: 'DisCount' },
  ]);

  // 定时器变量
  let timer = null;
  let dataRefreshTimer = null;
  // ECharts 实例
  let charts = [];

  // 方法
  const setScale = () => {
    const screenView = document.querySelector('.screenView');
    if (!screenView) return;

    const designWidth = 1920;
    const designHeight = 1080;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const scaleX = windowWidth / designWidth;
    const scaleY = windowHeight / designHeight;
    const scale = Math.max(scaleX, scaleY);

    screenView.style.transform = `translate(-50%, -50%) scale(${scale})`;
    screenView.style.transformOrigin = 'center';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  };

  // 初始化数据
  const initData = () => {
    getMaterialTrayCountFun(); //输送线任务
    getOrderRatioFun(); //毛坯/喷漆件占比
    getHomePageLocationsStatisticsFun(); //货位使用统计
  };

  // 接口数据直接赋值这里
  const rough = ref(70);
  const paint = ref(40);

  // 输送线任务
  const getMaterialTrayCountFun = () => {
    // getMaterialTrayCount().then(res => {
    //   if (res.status === 200) {
    //     GetMaterialTrayCountEchart();
    //   }
    // })
    GetMaterialTrayCountEchart();
  };

  // 货位使用统计
  const getHomePageLocationsStatisticsFun = () => {
    // getHomePageLocationsStatistics().then(res => {
    //   if (res.status === 200) {
    //     const data = res.data;
    //     homePageLocationsStatistics.value = homePageLocationsStatistics.value.map(item => ({
    //       ...item, value: Number(data[item.key]) || 0
    //     }));
    //     GetHomePageLocationsStatisticsEchart();
    //   }
    // });
    GetHomePageLocationsStatisticsEchart();
  };

  // ECharts 工具函数：注册图表，方便统一销毁
  const registerChart = (chart) => {
    charts.push(chart);
    return chart;
  };

  //毛坯/喷漆件占比
  const getOrderRatioFun = () => {
    // getOrderRatio().then(res => {
    //   if (res.status === 200) {
    //     GetMaterialTrayCountEchart();
    //   }
    // })
    GetOrderRatioEchart();
  };
  const GetOrderRatioEchart = () => {
    const myChart = registerChart(echarts.init(document.getElementById('orderRatio')));
    const option = {
      xAxis: {
        type: 'category',
        data: ['毛坯件数量', '喷漆件数量'],
        axisLabel: { color: '#fff' },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#fff' },
      },
      series: [
        {
          data: [120, 600],
          type: 'bar',
          label: {
            show: true,
            position: 'top',
            color: '#fff',
          },
          // 给柱子单独设置颜色：第一个渐变蓝，第二个固定色
          itemStyle: {
            color: function (params) {
              if (params.dataIndex === 0) {
                return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#74b3ff' }, // 顶部浅蓝
                  { offset: 1, color: '#188df0' }, // 底部深蓝
                ]);
              } else {
                return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#00ffff' },
                  { offset: 1, color: '#009999' },
                ]);
              }
            },
          },
        },
      ],
      legend: { textStyle: { color: '#fff' } },
    };
    myChart.setOption(option);
    window.addEventListener('resize', () => myChart.resize());
  };

  // 输送线任务
  const GetMaterialTrayCountEchart = () => {
    const myChart = registerChart(echarts.init(document.getElementById('materialNum')));
    const option = {
      legend: {},
      tooltip: {},
      dataset: {
        source: [
          ['product', '入库', '出库'],
          ['注塑', 43.3, 85.8],
          ['上件', 72.4, 53.9],
          ['下件', 62.4, 73.9],
          ['组装', 42.4, 63.9],
        ],
      },
      xAxis: { type: 'category', axisLabel: { color: '#fff' } },
      yAxis: { axisLabel: { color: '#fff' } },
      series: [
        {
          type: 'bar',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#4b9aff' },
              { offset: 1, color: '#188df0' },
            ]),
          },
          label: {
            show: true,
            position: 'top',
            color: '#fff',
          },
        },
        {
          type: 'bar',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#00ffff' },
              { offset: 1, color: '#00a8a8' },
            ]),
          },
          label: {
            show: true,
            position: 'top',
            color: '#fff',
          },
        },
      ],
      legend: { left: '30%', bottom: '5%', textStyle: { color: '#fff' } },
    };
    myChart.setOption(option);
    window.addEventListener('resize', () => myChart.resize());
  };

  // 货位使用统计饼图
  const GetHomePageLocationsStatisticsEchart = () => {
    const myChart = registerChart(echarts.init(document.getElementById('locationNum')));
    const option = {
      color: ['#2174FF', '#07A872', '#F6D91E', '#F5787B', '#000'],
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: '1%', top: '10%', textStyle: { color: '#fff' } },
      series: [
        {
          type: 'pie',
          radius: ['40%', '60%'],
          center: ['46%', '60%'],
          data: homePageLocationsStatistics.value,
          label: { show: true, color: '#fff', formatter: '{b}: {c}' },
        },
      ],
    };
    myChart.setOption(option);
    window.addEventListener('resize', () => myChart.resize());
  };

  // 生命周期
  onMounted(() => {
    setScale();
    window.addEventListener('resize', setScale);
    initData();
  });
  // onUnmounted(() => {
  //   // 清理定时器
  //   clearInterval(timer);
  //   clearInterval(dataRefreshTimer);
  //   // 清理事件监听
  //   window.removeEventListener('resize', setScale);
  //   // 销毁 ECharts 实例
  //   charts.forEach((chart) => chart.dispose());
  // });
</script>

<style scoped lang="less">
  @import './index.less';
</style>
