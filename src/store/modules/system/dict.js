import { defineStore } from 'pinia';
import { DICT_SPLIT } from '/@/constants/support/dict-const';
import _ from 'lodash';
import { dictApi } from '/@/api/support/dict-api';
import { smartSentry } from '/@/lib/smart-sentry';

export const useDictStore = defineStore({
  id: 'dict',
  state: () => ({
    // 字典code集合
    dictList: [],
    // 字典集合
    dictMap: new Map(),
  }),

  actions: {
    getDictList(){
      return this.dictList;
    },
    // 获取字典数据
    getDictData(DictCode) {
      if (!DictCode) {
        return [];
      }
      let dictDataList = this.dictMap.get(DictCode);
      return dictDataList ? dictDataList : [];
    },

    // 获取字典的值名称
    getDataList(DictCode, dataValue) {
      if (_.isNil(dataValue) || _.isNaN(dataValue)) {
        return '';
      }

      let dict = this.getDictData(DictCode);
      if (dict.length === 0) {
        return '';
      }

      // 是数字的话，需要特殊处理
      if (_.isNumber(dataValue)) {
        let target = _.find(dict, { DataValue: String(dataValue) });
        return target ? target.DataLabel : '';
      }

      let valueArray = dataValue.split(DICT_SPLIT);
      let result = [];
      for (let item of valueArray) {
        let target = _.find(dict, { DataValue: item });
        if (target) {
          result.push(target);
        }
      }
      return result;
    },

    // 获取字典的值名称
    getDataLabels(DictCode, dataValue) {
      if (_.isNil(dataValue) || _.isNaN(dataValue)) {
        return '';
      }

      let dict = this.getDictData(DictCode);
      if (dict.length === 0) {
        return '';
      }

      // 是数字的话，需要特殊处理
      if (_.isNumber(dataValue)) {
        let target = _.find(dict, { DataValue: String(dataValue) });
        return target ? target.DataLabel : '';
      }

      let valueArray = dataValue.split(DICT_SPLIT);
      let result = [];
      for (let item of valueArray) {
        let target = _.find(dict, { DataValue: item });
        if (target) {
          result.push(target.DataLabel);
        }
      }
      return result.join(DICT_SPLIT);
    },
    // 刷新字典
    async refreshData(){
      try{
        const dictRes = await dictApi.getAllDictData();
        console.log('@@',dictRes.data)
        this.initData(dictRes.data);
      }catch (e){
        smartSentry.captureError(e);
      }
    },
    // 初始化字典
    initData(dictDataList) {
      this.dictMap.clear();
      this.dictList = [];

      for (let data of dictDataList) {
        if (!_.some(this.dictList, { DictCode: data.DictCode })) {
          this.dictList.push({ DictCode: data.DictCode, DictName: data.DictName ,disabledFlag: data.dictDisabledFlag});
        }

        let dataArray = this.dictMap.get(data.DictCode);
        if (!dataArray) {
          dataArray = [];
          this.dictMap.set(data.DictCode, dataArray);
        }
        dataArray.push(data);
      }

      console.log(this.dictList,2)
    },
  },
});