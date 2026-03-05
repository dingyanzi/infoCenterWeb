/*
 * 国际化入口文件
 *
 * @Author:    1024创新实验室-主任：卓大
 * @Date:      2022-09-06 20:01:19
 * @Wechat:    zhuda1024
 * @Email:     lab1024@163.com
 * @Copyright  1024创新实验室 （ https://1024lab.net ），Since 2012
 */

import en_US from './lang/en-US/index';
import zh_CN from './lang/zh-CN/index';
import { createI18n } from 'vue-i18n';
import localStorageKeyConst from '/@/constants/local-storage-key-const';

/**
 * 获取初始化的语言
 */
function getInitializedLanguage() {
  // 读取本地存储的语言设置
  const appConfigStr = localStorage.getItem(localStorageKeyConst.APP_CONFIG);
  console.log('i18n initialization - Reading language from local storage:', appConfigStr);
  if (appConfigStr) {
    try {
      const appConfig = JSON.parse(appConfigStr);
      console.log('i18n initialization - Parsed app config:', appConfig);
      if (appConfig.language) {
        console.log('i18n initialization - Found language:', appConfig.language);
        return appConfig.language;
      }
    } catch (e) {
      console.error('i18n initialization - Error parsing app config:', e);
    }
  }
  // 默认语言
  console.log('i18n initialization - Using default language: zh_CN');
  return 'zh_CN';
}

// 语言选择数组
export const i18nList = [
  {
    text: '简体中文',
    value: 'zh_CN',
  },
  {
    text: 'English',
    value: 'en_US',
  },
];

export const messages = {
  zh_CN: zh_CN,
  en_US: en_US,
};

const i18n = createI18n({
  fallbackLocale: 'zh_CN', //预设语言环境
  globalInjection: true,
  legacy: false, //
  locale: getInitializedLanguage(), //默认初始化的语言
  messages, //
});

export default i18n;
