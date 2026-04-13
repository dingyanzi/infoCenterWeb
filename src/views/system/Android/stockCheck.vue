<!--
  * 手持-库存盘点
-->
<template>
  <div class="task-container">
    <div class="returnBox">
      <div class="titleIco returnIndex">
        <router-link to="/Android/index">
          <LeftOutlined class="returnIco" />
        </router-link>
      </div>
      <div class="title">库存盘点</div>
    </div>
    <div class="mainContent">
      <div class="searchInput">
        <div class="demo-input-suffix">
          <div class="title">物料编号</div>
          <a-input class="input-mini" clearable v-model="trayCode" prop="TrayCode" />
        </div>
        <div class="demo-input-suffix">
          <div class="title">物料码</div>
          <a-input class="input-mini" clearable v-model="materialCode" />
        </div>
        <div class="demo-input-suffix" v-if="inventoryDetail.length > 0">
          <a-button type="primary" @click="AddMaterial">{{ $t('CheckOrder.AddMaterial') }}</a-button>
        </div>

        <div v-if="errorTxt" class="errorTxt">-----{{ errorTxt }}------</div>
      </div>
    </div>
    <div class="btnBox fixed-bottom">
      <div class="button-placeholder">
        <a-button type="primary" v-show="isShow" @click="handCorrectStock(null, 1)">一键盘点</a-button>
      </div>
      <a-button type="default" @click="resetFilter">重置</a-button>
    </div>


  </div>
</template>
<style scoped lang="less">
@import './common.less';
</style>
<script setup>
import { LeftOutlined } from '@ant-design/icons-vue';
import _ from 'lodash';
import { ref, watch } from 'vue';
const inventoryDetail = ref([]);
const isShow = ref(false);
const trayCode = ref('');
const materialCode = ref('');
const errorTxt = ref('');

const resetFilter = () => {
  trayCode.value = '';
  materialCode.value = '';
  errorTxt.value = '';
}
const handCorrectStock = (data, type) => {
  if (type === 1) {
    isShow.value = true;
  }
}
</script>
