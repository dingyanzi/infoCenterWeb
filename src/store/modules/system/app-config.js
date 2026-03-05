/*
 * 项目的配置信息
 *
 * @Author:    1024创新实验室-主任：卓大
 * @Date:      2022-09-06 20:53:47
 * @Wechat:    zhuda1024
 * @Email:     lab1024@163.com
 * @Copyright  1024创新实验室 （ https://1024lab.net ），Since 2012
 */
import { defineStore } from 'pinia';
import { appDefaultConfig } from '/@/config/app-config';
import localStorageKeyConst from '/@/constants/local-storage-key-const';
import { smartSentry } from '/@/lib/smart-sentry';
import { localRead } from '/@/utils/local-util';

let state = {
  ...appDefaultConfig
};

let appConfigStr = localRead(localStorageKeyConst.APP_CONFIG);
let language = appDefaultConfig.language;
if (appConfigStr) {
  try {
    state = JSON.parse(appConfigStr);
    language = state.language;
  } catch (e) {
    smartSentry.captureError(e);
  }
}

/**
 * 获取初始化的语言
 */
export const getInitializedLanguage = function () {
  // 每次调用都重新读取本地存储的语言设置
  const appConfigStr = localStorage.getItem(localStorageKeyConst.APP_CONFIG);
  console.log('Reading language from local storage:', appConfigStr);
  if (appConfigStr) {
    try {
      const appConfig = JSON.parse(appConfigStr);
      console.log('Parsed app config:', appConfig);
      if (appConfig.language) {
        console.log('Found language:', appConfig.language);
        return appConfig.language;
      }
    } catch (e) {
      console.error('Error parsing app config:', e);
      smartSentry.captureError(e);
    }
  }
  console.log('Using default language:', appDefaultConfig.language);
  return appDefaultConfig.language;
};

export const useAppConfigStore = defineStore({
  id: 'appConfig',
  state: () => {
    // 重新读取本地存储的配置
    let currentState = { ...appDefaultConfig };
    const appConfigStr = localRead(localStorageKeyConst.APP_CONFIG);
    if (appConfigStr) {
      try {
        const appConfig = JSON.parse(appConfigStr);
        currentState = { ...currentState, ...appConfig };
      } catch (e) {
        smartSentry.captureError(e);
      }
    }
    return {
      // 读取config下的默认配置
      ...currentState,
      // 全屏
      fullScreenFlag: false,
    };
  },
  actions: {
    reset() {
      for (const k in appDefaultConfig) {
        this[k] = appDefaultConfig[k];
      }
    },
    showHelpDoc() {
      this.helpDocExpandFlag = true;
    },
    hideHelpDoc() {
      this.helpDocExpandFlag = false;
    },
    startFullScreen() {
      this.fullScreenFlag = true;
    },
    exitFullScreen() {
      this.fullScreenFlag = false;
    },
  },
});
