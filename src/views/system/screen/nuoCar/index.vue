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
          <div class="unTaskNums"></div>
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
  import ico1Img from '/@/assets/screen/ico1.png';
  import ico2Img from '/@/assets/screen/ico2.png';
  import ico5Img from '/@/assets/screen/ico5.png';
  import ico4Img from '/@/assets/screen/ico4.png';
  import ico6Img from '/@/assets/screen/ico6.png';
  import ico3Img from '/@/assets/screen/ico3.png';
  // 接口导入（根据你的实际路径调整）
  // import {
  //   getHomePageLocationsStatistics,
  //   getTaskTypeDayStatistics,
  //   getZoneDays,
  //   getDoingTaskTypeCount,
  //   getMaterialTrayCount,
  //   getOrderStatistics,
  //   getMaterialAging,
  //   getLatestInventoryChange
  // } from '@/api/screen'

  // 响应式数据
  const zoneDays = ref('');
  const orderStatistics = ref({});
  const currentTime = ref('');
  const tableData = ref([]);
  const unTaskNums = ref({});
  const materialAging = ref({});
  const materialTrayCount = ref([]);
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

  // 计算属性
  const dayDigits = computed(() => {
    const daysStr = String(zoneDays.value || 0).padStart(4, '0');
    return daysStr.split('').map((digit) => digit);
  });

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

  // 输送线任务
  const getMaterialTrayCountFun = () => {
    // getMaterialTrayCount().then(res => {
    //   if (res.status === 200) {
    //     materialTrayCount.value = res.data.reverse();
    //     GetMaterialTrayCountEchart();
    //   }
    // })
    materialTrayCount.value = [{ MaterialCode: 'TEST001', TrayCount: 100 }];
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
      series: [{ type: 'bar' }, { type: 'bar' }],
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
  html,
  body {
    height: 100%;
    overflow: hidden;
    margin: 0;
    padding: 0;
  }

  #app {
    height: 100%;
    overflow: hidden;
    margin: 0;
    padding: 0;
    position: relative;
  }

  .screenView {
    width: 1920px;
    height: 1080px;
    background: url('../../../../assets/screen/bg.png') no-repeat center center;
    background-size: cover;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transform-origin: center;
    overflow: hidden;
    z-index: 1;
  }

  .headBg {
    width: 100%;
    height: 100px;
    position: relative;
    z-index: 2;

    .logoImg {
      position: absolute;
      left: 40px;
      top: 50%;
      transform: translateY(-50%);
      width: 100px;
      height: auto;
    }

    .subTitle {
      position: absolute;
      right: 40px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 22px;
      color: #00ffff;
      text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
    }

    .title {
      font-size: 31px;
      font-weight: bold;
      color: #fff;
      text-align: center;
      position: absolute;
      top: 50%;
      left: 48.5%;
      transform: translate(-50%, -50%);
      z-index: 3;
      text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
    }
  }

  .headImg {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
  }

  .contentBg {
    width: 100%;
    height: 980px;
    position: relative;
    top: 0px;
    left: 0;
    overflow: hidden;

    .leftContent {
      width: 461px;
      height: 960px;
      position: absolute;
      top: 0;
      left: 19px;
      padding-top: 20px;

      .dayView {
        width: 100%;
        height: 273px;
        position: relative;
        background-color: rgba(4, 29, 77, 0.5);
        border-radius: 10px;
        border: 1px solid #032a73;
        border-top: none;
        padding: 14px 22px 43px;
        margin-bottom: 15px;

        .titImg {
          width: 100%;
          height: auto;
          position: absolute;
          top: -5px;
          left: 0;
          z-index: 0;
        }

        .title {
          font-size: 19px;
          font-weight: bold;
          color: #fff;
          text-align: center;
          padding-top: 20px;
          text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
          z-index: 1;
          position: relative;
        }
      }

      .orderView {
        width: 100%;
        height: 300px;
        position: relative;
        background-color: rgba(4, 29, 77, 0.5);
        border-radius: 10px;
        border: 1px solid #032a73;
        border-top: none;
        padding: 14px 22px 14px;
        margin-bottom: 15px;

        .titImg {
          width: 100%;
          height: auto;
          position: absolute;
          top: -8px;
          left: 0;
          z-index: 0;
        }

        .title {
          font-size: 19px;
          font-weight: bold;
          color: #fff;
          text-align: center;
          text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
          z-index: 1;
          position: relative;
        }
      }

      .materialView {
        margin-top: 0;
        height: 417px;

        .title {
          margin-top: 10px;
        }
      }

      .orderView,
      .materialView {
        width: 100%;
        position: relative;
        background-color: rgba(4, 29, 77, 0.5);
        border-radius: 10px;
        border: 1px solid #032a73;
        border-top: none;
        padding: 14px 22px 14px;

        .titImg {
          width: 100%;
          height: auto;
          position: absolute;
          top: -8px;
          left: 0;
          z-index: 0;
        }

        .title {
          font-size: 21px;
          font-weight: bold;
          color: #fff;
          text-align: center;
          text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
          z-index: 1;
          position: relative;
        }

        .materialNums {
          width: 100%;
          height: 85%;
          margin: 10px auto 0;
        }
        .orderRatio {
          width: 100%;
          height: 100%;
          margin: 10px auto 0;
        }
      }
    }

    .centerContent {
      width: 922px;
      height: 960px;
      position: absolute;
      top: 0;
      left: 499px;
      padding-top: 20px;

      .taskView {
        width: 100%;
        height: 465px;
        position: relative;
        background-color: rgba(4, 29, 77, 0.5);
        border-radius: 10px;
        border: 1px solid #032a73;
        border-top: none;
        padding: 14px 22px 22px;
        margin-bottom: 15px;

        .titImg {
          width: 100%;
          height: auto;
          position: absolute;
          top: -8px;
          left: 0;
          z-index: 0;
        }

        .title {
          font-size: 21px;
          font-weight: bold;
          color: #fff;
          text-align: center;
          padding-top: 20px;
          text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
          z-index: 1;
          position: relative;
        }
      }

      .outInView {
        width: 100%;
        height: 465px;
        position: relative;
        background-color: rgba(4, 29, 77, 0.6);
        border-radius: 10px;
        border: 1px solid #032a73;
        border-top: none;
        padding: 14px 22px 22px;

        .titImg {
          width: 100%;
          height: auto;
          position: absolute;
          top: -8px;
          left: 0;
          z-index: 0;
        }

        .title {
          font-size: 21px;
          font-weight: bold;
          color: #fff;
          text-align: center;
          padding-top: 10px;
          text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
          z-index: 1;
          position: relative;
        }

        .outInList {
          width: 100%;
          height: 405px;
          margin-top: 10px;
          overflow: hidden;
        }
      }

      .taskNums {
        width: 100%;
        height: 90%;
        margin: 0 auto;
      }
    }

    /* 表格容器样式 */
    .outInView .outInList .outInTable {
      background-color: transparent !important;
      width: 99% !important;
    }

    :deep(.el-table) {
      background-color: transparent !important;
      border: 1px solid rgba(0, 255, 255, 0.3) !important;
      border-radius: 8px !important;
    }

    :deep(.el-table th) {
      background-color: transparent !important;
      color: #00ffff !important;
      font-weight: bold !important;
      text-align: center !important;
      border-bottom: 1px solid rgba(0, 255, 255, 0.3) !important;
    }

    :deep(.el-table td) {
      background-color: transparent !important;
      color: #fff !important;
      text-align: center !important;
      border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
    }

    :deep(.el-table__row:hover) {
      background-color: rgba(0, 255, 255, 0.1) !important;
    }

    .rightContent {
      width: 442px;
      height: 960px;
      position: absolute;
      top: 0;
      left: 1440px;
      padding-top: 20px;

      .materialAgeView {
        margin-top: 20px;
        height: 280px !important;

        .materialAgeNumList {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 80%;

          .materialAgeNums {
            width: 31%;
            height: 100%;
            margin: 0 auto;
          }
        }
      }

      .unTaskView {
        height: 210px !important;
        margin-bottom: 20px;
        .unTaskNums {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 100%;
          margin: 0 auto;
        }
      }

      .locationView {
        height: 415px !important;
      }

      .locationView,
      .materialAgeView,
      .unTaskView {
        width: 100%;
        position: relative;
        background-color: rgba(4, 29, 77, 0.5);
        border-radius: 10px;
        border: 1px solid #032a73;
        border-top: none;
        padding: 14px 22px 14px;

        .titImg {
          width: 100%;
          height: auto;
          position: absolute;
          top: -8px;
          left: 0;
          z-index: 0;
        }

        .title {
          font-size: 21px;
          font-weight: bold;
          color: #fff;
          text-align: center;
          padding-top: 10px;
          text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
          z-index: 1;
          position: relative;
        }

        .locationNums {
          width: 100%;
          height: 90%;
          margin: 0 auto;
        }
      }
    }
  }
</style>
