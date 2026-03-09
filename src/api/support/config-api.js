import { postRequest, getRequest } from '/@/lib/axios';

export const configApi = {
  // 分页查询 @author 卓大
  queryList: (param) => {
    return postRequest('/ParamConfig/GetParamConfigForPaged', param);
  },
  // 添加配置参数 @author 卓大
  addConfig: (param) => {
    return postRequest('/ParamConfig/AddParamConfig', param);
  },
  // 修改配置参数 @author 卓大
  updateConfig: (param) => {
    return postRequest('/SystemparamConfigs/UpdateSystemparamConfigs', param);
  },
  // 查询配置详情 @author 卓大
  // queryByKey: (param) => {
  //   return getRequest(`/support/config/queryByKey?configKey=${param}`);
  // },
};
