/*
 * 类目api
 */
import { getRequest, postRequest } from '/@/lib/axios';

export const categoryApi = {
  // 添加类目 
  addCategory: (param) => {
    return postRequest('/MaterialCategory/Add', param);
  },
  // GET
  // 删除类目
  deleteCategoryById: (param) => {
    return getRequest(`/MaterialCategory/Delete`, param);
  },
  // 查询类目层级树 
  queryCategoryTree: (param) => {
    return getRequest('/MaterialCategory/GetCategoryTreeByName', param);
  },
  // 更新类目
  updateCategory: (param) => {
    return postRequest('/MaterialCategory/Edit', param);
  },

  // 获取物料记录分页列表 
  GetMaterialRecordForPaged: (param) => {
    return postRequest('/MaterialRecord/GetMaterialRecordForPaged', param);
  },
  // 生成物料编码 
  GenerateMaterialCode: (param) => {
    return getRequest('/MaterialRecord/GenerateMaterialCode', param);
  },
};
