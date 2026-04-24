<template>
  <div class="screenView">
    <!-- 顶部标题 -->
    <div class="headBg">
      <img class="logoImg" :src="logoImg" alt="">
      <img class="headImg" :src="headBgImg" alt="">
      <div class="title">诺博智能仓储可视化看板</div>
      <!-- <div class="subTitle">2号库</div> -->
    </div>
    <!-- 内容区域 -->
    <div class="contentBg">
      <!-- 左边内容 -->
      <div class="leftContent">
        <!-- 天数 -->
        <div class="dayView">
          <img class="titImg" :src="titBgImg" alt="">
          <div class="title">立库运行天数</div>
          <div class="dayNum">
            <span v-for="(digit, index) in dayDigits" :key="index" class="digit">{{ digit }}</span>
          </div>
          <div class="dayTime">{{ currentTime }}</div>
        </div>
        <!-- 入库单和出库单完成情况 -->
        <div class="orderView">
          <img class="titImg" :src="titBgImg" alt="">
          <div class="orderLists">
            <!-- 入库单完成情况 -->
            <div class="orderList">
              <div class="title">入库单完成情况</div>
              <div class="orderItem">
                <img class="orderIcon" :src="ico1Img" alt="">
                <div class="orderContent">
                  <div class="orderNum">总数量</div>
                  <div class="orderStatus"><span>{{ orderStatistics.InAllCount }}</span>个</div>
                </div>
              </div>
              <div class="orderItem orderItemMargin">
                <img class="orderIcon" :src="ico2Img" alt="">
                <div class="orderContent">
                  <div class="orderNum">进行中数量</div>
                  <div class="orderStatus"><span>{{ orderStatistics.InDoingCount }}</span>个</div>
                </div>
              </div>
            </div>
            <!-- 出库单完成情况 -->
            <div class="orderList">
              <div class="title">出库单完成情况</div>
              <div class="orderItem">
                <img class="orderIcon" :src="ico1Img" alt="">
                <div class="orderContent">
                  <div class="orderNum">总数量</div>
                  <div class="orderStatus"><span>{{ orderStatistics.OutAllCount }}</span>个</div>
                </div>
              </div>
              <div class="orderItem orderItemMargin">
                <img class="orderIcon" :src="ico2Img" alt="">
                <div class="orderContent">
                  <div class="orderNum">进行中数量</div>
                  <div class="orderStatus"><span>{{ orderStatistics.OutDoingCount }}</span>个</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 物料分散托盘个数top5  -->
        <div class="materialView">
          <img class="titImg" :src="titBgImg" alt="">
          <div class="title">物料占用托盘数Top 5</div>
          <div class="materialNums" id="materialNum"></div>
        </div>
      </div>
      <!-- 中间内容 -->
      <div class="centerContent">
        <!-- 完成任务数统计 -->
        <div class="taskView">
          <img class="titImg" :src="titBg2Img" alt="">
          <div class="title">完成任务数统计</div>
          <div class="taskNums" id="taskNum"></div>
        </div>
        <!-- 最近出入库变动列表 -->
        <div class="outInView">
          <img class="titImg" :src="titBg2Img" alt="">
          <div class="title">最近出入库变动列表</div>
          <div class="outInList">
            <el-table :data="tableData" class="outInTable">
              <el-table-column prop="InventoryOperateTypeName" label="操作类型" />
              <el-table-column prop="MaterialCode" label="物料号" />
              <el-table-column prop="MaterialName" label="物料名称" />
              <el-table-column prop="Specifications" label="规格" />
              <el-table-column prop="ChangeQty" label="变动数量">
                <template #default="scope" v-if="scope">
                  {{ scope.row.ChangeQty > 0 ? '+' + scope.row.ChangeQty : scope.row.ChangeQty }} {{ scope.row.Unit }}
                </template>
              </el-table-column>
              <el-table-column prop="CreateTime" label="操作时间" />
            </el-table>
          </div>
        </div>
      </div>
      <!-- 右边内容 -->
      <div class="rightContent">
        <!-- 货位使用统计 -->
        <div class="locationView">
          <img class="titImg" :src="titBgImg" alt="">
          <div class="title">货位使用统计</div>
          <div class="locationNums" id="locationNum"></div>
        </div>
        <!-- 待完成任务数统计 -->
        <div class="unTaskView">
          <img class="titImg" :src="titBg2Img" alt="">
          <div class="title">待完成任务数统计</div>
          <div class="unTaskNums">
            <div class="unTaskNum">
              <img class="unTaskIcon" :src="ico4Img" alt="">
              <div class="name">入库 <span>{{ unTaskNums.InTaskCount }}</span>个</div>
            </div>
            <div class="unTaskNum">
              <img class="unTaskIcon" :src="ico6Img" alt="">
              <div class="name">出库 <span>{{ unTaskNums.OutTaskCount }}</span>个</div>
            </div>
            <div class="unTaskNum">
              <img class="unTaskIcon" :src="ico5Img" alt="">
              <div class="name">移库 <span>{{ unTaskNums.MoveTaskCount }}</span>个</div>
            </div>
            <div class="unTaskNum">
              <img class="unTaskIcon" :src="ico3Img" alt="">
              <div class="name">盘点 <span>{{ unTaskNums.CheckTaskCount }}</span>个</div>
            </div>
          </div>
        </div>
        <!-- 物料库龄统计 -->
        <div class="materialAgeView">
          <img class="titImg" :src="titBgImg" alt="">
          <div class="title">物料库龄统计</div>
          <div class="materialAgeNumList">
            <div class="materialAgeNums" id="materialAgeNum1"></div>
            <div class="materialAgeNums" id="materialAgeNum2"></div>
            <div class="materialAgeNums" id="materialAgeNum3"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from "echarts";
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
  { value: 0, name: '禁用', key: 'DisCount' }
]);

// 定时器变量
let timer = null;
let dataRefreshTimer = null;
// ECharts 实例
let charts = [];

// 计算属性
const dayDigits = computed(() => {
  const daysStr = String(zoneDays.value || 0).padStart(4, '0');
  return daysStr.split('').map(digit => digit);
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

// 更新时间
const updateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const weekday = weekdays[now.getDay()];
  currentTime.value = `${year}年${month}月${day}日 ${hours}:${minutes} 星期${weekday}`;
};

// 初始化数据
const initData = () => {
  getZoneDaysFun();
  getOrderStatisticsFun();
  getLatestInventoryChangeFun();
  getDoingTaskTypeCountFun();
  getMaterialAgingFun();
  getMaterialTrayCountFun();
  getHomePageLocationsStatisticsFun();
  getTaskTypeDayStatisticsFun();
};

// 天数统计
const getZoneDaysFun = () => {
  // 模拟接口，正式环境替换为真实接口
  // getZoneDays().then(res => {
  //   if (res.status === 200) zoneDays.value = res.data;
  // })
  zoneDays.value = 365;
};

// 出入库单完成情况
const getOrderStatisticsFun = () => {
  // getOrderStatistics().then(res => {
  //   if (res.status === 200) orderStatistics.value = res.data;
  // })
  orderStatistics.value = { InAllCount: 100, InDoingCount: 10, OutAllCount: 90, OutDoingCount: 5 };
};

// 最近出入库变动列表
const getLatestInventoryChangeFun = () => {
  // getLatestInventoryChange().then(res => {
  //   if (res.status === 200) tableData.value = res.data.slice(0, 9);
  // })
  tableData.value = [];
};

// 待完成任务数统计
const getDoingTaskTypeCountFun = () => {
  // getDoingTaskTypeCount().then(res => {
  //   if (res.status === 200) unTaskNums.value = res.data;
  // })
  unTaskNums.value = { InTaskCount: 0, OutTaskCount: 0, MoveTaskCount: 0, CheckTaskCount: 0 };
};

// 物料库龄统计
const getMaterialAgingFun = () => {
  // getMaterialAging().then(res => {
  //   if (res.status === 200) {
  //     materialAging.value = res.data;
  //     GetMaterialAgingEchart1();
  //     GetMaterialAgingEchart2();
  //     GetMaterialAgingEchart3();
  //   }
  // })
  materialAging.value = { WithinOneYear: 100, OneToThreeYears: 50, OverThreeYears: 20 };
  GetMaterialAgingEchart1();
  GetMaterialAgingEchart2();
  GetMaterialAgingEchart3();
};

// 物料所占托盘前五
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

// 完成任务数统计
const getTaskTypeDayStatisticsFun = () => {
  // getTaskTypeDayStatistics().then(res => {
  //   if (res.status === 200) {
  //     const taskMap = [
  //       { key: "InTaskCount", name: "入库任务数" },
  //       { key: "OutTaskCount", name: "出库任务数" },
  //       { key: "MoveTaskCount", name: "移库任务数" },
  //       { key: "CheckTaskCount", name: "盘点任务数" }
  //     ];
  //     const taskTypeDayStatistics = taskMap.map(item => ({
  //       name: item.name, type: "line", stack: "Total",
  //       data: res.data.map(row => row[item.key])
  //     }));
  //     const date = res.data.map(row => row.Date);
  //     GetTaskTypeDayStatisticsEchart(taskTypeDayStatistics, date);
  //   }
  // })
  GetTaskTypeDayStatisticsEchart([], []);
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

// 完成任务数统计折线图
const GetTaskTypeDayStatisticsEchart = (arr, date) => {
  const myChart = registerChart(echarts.init(document.getElementById('taskNum')));
  const option = {
    title: { text: '', textStyle: { color: '#fff' } },
    tooltip: { trigger: 'axis' },
    legend: { data: arr.map(item => item.name), textStyle: { color: '#fff', fontSize: 14 }, bottom: 0 },
    grid: { left: 20, right: 60, bottom: 80, containLabel: true },
    xAxis: {
      type: 'category', boundaryGap: false, data: date,
      axisLabel: { color: '#fff', fontSize: 12 },
      axisLine: { show: true, lineStyle: { color: 'rgba(0, 255, 255, 0.3)' } }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: 'rgba(0, 255, 255, 0.3)' } },
      axisLabel: { color: '#fff', fontSize: 12 },
      splitLine: { lineStyle: { color: 'rgba(0, 255, 255, 0.2)' } }
    },
    series: arr
  };
  myChart.setOption(option);
  window.addEventListener('resize', () => myChart.resize());
};

// 物料所占托盘前五
const GetMaterialTrayCountEchart = () => {
  const dataAxis = materialTrayCount.value.map(item => item.MaterialCode);
  const data = materialTrayCount.value.map(item => item.TrayCount);
  const myChart = registerChart(echarts.init(document.getElementById('materialNum')));
  const option = {
    grid: { left: '25%', right: '5%', bottom: '10%', top: '10%', containLabel: true },
    xAxis: { axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#999' }, splitLine: { lineStyle: { color: 'rgba(0,255,255,0.2)' } } },
    yAxis: { type: 'category', data: Array(dataAxis.length).fill(''), axisLabel: { show: false }, axisTick: { show: false }, axisLine: { show: false } },
    series: [{
      type: 'bar',
      itemStyle: { color: (params) => ['#00ffff', '#00ffcc', '#00e5ff', '#00b8d4', '#188df0'][params.dataIndex % 5] },
      label: { show: true, position: 'left', color: '#fff', fontSize: 14, formatter: params => dataAxis[params.dataIndex] },
      data: data
    }]
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
    series: [{
      type: 'pie', radius: ['40%', '60%'], center: ['46%', '60%'],
      data: homePageLocationsStatistics.value,
      label: { show: true, color: '#fff', formatter: '{b}: {c}' }
    }]
  };
  myChart.setOption(option);
  window.addEventListener('resize', () => myChart.resize());
};

// 仪表盘图表
const initGaugeChart = (id, value, axisColor, detailColor, progressColor, type) => {
  let label = '';
  if (type === 1) label = '0-1年';
  else if (type === 2) label = '1-3年';
  else if (type === 3) label = '3年以上';

  const myChart = registerChart(echarts.init(document.getElementById(id)));
  const option = {
    series: [{
      type: 'gauge', radius: '100%', max: 400, splitNumber: 8,
      progress: { show: true, width: 12, itemStyle: { color: '#00ffcc' } },
      axisLine: { lineStyle: { width: 12, color: [[1, axisColor]] } },
      title: { show: true, offsetCenter: [0, '110%'], color: '#fff' },
      detail: { valueAnimation: true, offsetCenter: [0, '82%'], color: detailColor, formatter: '{value} 种' },
      data: [{ value, name: label }]
    }]
  };
  myChart.setOption(option);
  window.addEventListener('resize', () => myChart.resize());
};

const GetMaterialAgingEchart1 = () => initGaugeChart('materialAgeNum1', materialAging.value.WithinOneYear, '#64dbf4', '#49AA19', '#c5f2fb', 1);
const GetMaterialAgingEchart2 = () => initGaugeChart('materialAgeNum2', materialAging.value.OneToThreeYears, '#f5be38', '#ED7D2A', '#fff5de', 2);
const GetMaterialAgingEchart3 = () => initGaugeChart('materialAgeNum3', materialAging.value.OverThreeYears, '#FF4949', '#FF4949', '#ffe8e8', 3);

// 生命周期
onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000);
  dataRefreshTimer = setInterval(initData, 10000);
  setScale();
  window.addEventListener('resize', setScale);
  initData();
});

onBeforeUnmount(() => {
  // 清理定时器
  clearInterval(timer);
  clearInterval(dataRefreshTimer);
  // 清理事件监听
  window.removeEventListener('resize', setScale);
  // 销毁 ECharts 实例
  charts.forEach(chart => chart.dispose());
});
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
      height: 225px;
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
        height: 90%;
        margin: 0 auto;
      }

      .orderLists {
        display: flex;
        flex-direction: row;
        gap: 20px;
        padding: 7px 14px 0;
        position: relative;

        .orderList {
          flex: 1;

          .title {
            font-size: 21px;
            font-weight: bold;
            color: #fff;
            text-align: center;
            margin-bottom: 34px;
            text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
          }

          .orderItem {
            width: 95%;
            display: flex;
            flex-direction: row;
            align-items: center;
            background-color: rgba(0, 255, 255, 0.1);
            border: 1px solid rgba(0, 255, 255, 0.5);
            border-radius: 8px;
            padding: 10px 3px;

            .orderIcon {
              width: 15px;
              height: 15px;
              margin-left: 15px;
            }

            .orderContent {
              display: flex;
              justify-content: space-around;
              align-items: center;
              width: 100%;
              white-space: nowrap;

              .orderNum {
                font-size: 14px;
                font-weight: bold;
                color: #fff;
                white-space: nowrap;
              }

              .orderStatus {
                font-size: 14px;
                font-weight: bold;
                color: #eee;
                white-space: nowrap;

                span {
                  font-size: 16px;
                  padding: 2px 15px;
                  color: #00ffff;
                  text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
                  white-space: nowrap;
                }
              }
            }
          }

          .orderItemMargin {
            margin-top: 16px;
          }
        }
      }
    }

    .dayNum {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 40px;

      .digit {
        font-size: 45px;
        font-weight: bold;
        color: #00ffff;
        background: radial-gradient(circle at center,
            #166ebc 0%,
            #093868 80%,
            #02305b 100%);
        border: 1px solid rgba(0, 255, 255, 0.5);
        padding: 24px 24px;
        border-radius: 4px;
        text-align: center;
        box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        margin: 0 10px;
      }
    }

    .dayTime {
      font-size: 19px;
      color: #00ffff;
      text-align: center;
      margin-top: 30px;
      text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
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
      margin-top: 15px;

      .unTaskNums {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 100%;
        margin: 0 auto;

        .unTaskNum {
          width: 25%;
          height: 100%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;

          .unTaskIcon {
            width: 80px;
            margin: 0 auto;
          }

          .name {
            font-size: 16px;
            font-weight: bold;
            color: #fff;
            text-align: center;
            padding-top: 10px;
            text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);

            span {
              font-size: 14px;
              color: #00ffff;
            }
          }
        }
      }
    }

    .locationView {
      height: 415px !important;
      margin-bottom: 20px;
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