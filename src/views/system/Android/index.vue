<!--
  * 手持-库存盘点
-->
<template>
  <div class="task-container">
    <div class="box-header homeTitle">WMS</div>
    <div class="mainContent">
      <div class="cardInfo">
        <li v-for="permission in androidPermissions" :key="permission.code">
          <router-link :to="permission.code">
            <div class="oneCard">
              <div class="icon card1"></div>
              <div class="cardPadding">
                <div class="top">
                  <i :class="permission.icon"></i>
                </div>
                <div class="bottom clearfix">
                  <div>{{ permission.label }}</div>
                </div>

              </div>
            </div>
          </router-link>
        </li>
      </div>
    </div>
  </div>
</template>
<style scoped lang="less">
@import './common.less';

.homeTitle {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  line-height: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  text-align: center;
  letter-spacing: 2px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.cardInfo {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  list-style: none;
  padding: 0 12%;
  margin: 0;
  box-sizing: border-box;

  li {
    width: calc(46%);
    display: block;
    margin-bottom: 15px;
  }

  .oneCard {
    width: 100%;
    height: 100px;
    border-radius: 16px;
    position: relative;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    background: #ffffff;

    &:hover {
      cursor: pointer;
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    &:active {
      transform: translateY(-2px) scale(0.98);
    }

    .icon {
      width: 100%;
      height: 100%;
      border-radius: 16px;
      position: absolute;
      top: 0;
      left: 0;
    }

    .card1 {
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    }

    .card2 {
      background: linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%);
    }

    .card3 {
      background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
    }

    .card4 {
      background: linear-gradient(135deg, #bfdbfe 0%, #60a5fa 100%);
    }

    .cardPadding {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 12px;
      z-index: 2;

      .top {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 50px;

        i {
          font-size: 24px;
          color: #1e40af;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15));
          transition: transform 0.3s ease;
          display: block;
        }
      }

      .bottom {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 38px;

        div {
          font-size: 16px;
          font-weight: bold;
          color: #1e40af;
          text-align: center;
          text-shadow: 0 1px 1px rgba(0, 0, 0, 0.15);
          display: block;
        }
      }
    }

    &:hover .top i {
      transform: scale(1.1);
    }
  }
}
</style>
<script setup>
import { LeftOutlined } from '@ant-design/icons-vue';
import _ from 'lodash';
import { ref, watch } from 'vue';
const androidPermissions = ref([]);//权限列表
</script>
