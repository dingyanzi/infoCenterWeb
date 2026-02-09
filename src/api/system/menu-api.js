/*
 * 菜单
 *
 * @Author:    1024创新实验室-主任：卓大
 * @Date:      2022-09-03 22:00:32
 * @Wechat:    zhuda1024
 * @Email:     lab1024@163.com
 * @Copyright  1024创新实验室 （ https://1024lab.net ），Since 2012
 */
import { getRequest, postRequest } from '/@/lib/axios';

export const menuApi = {
  /**
   * 添加菜单
   */
  addPermission: (param) => {
    return postRequest('/Permission/AddPermission', param);
  },

  /**
   * 批量删除菜单
   */
  batchDeleteMenu: (param) => {
    return getRequest(`/Permission/Delete?id=${param}`);
  },

  /**
   * 查询所有菜单列表
   */
  queryMenu: (params) => {
    return getRequest('/Permission/GetPermissonList', params);
  },

  /**
   * 查询菜单树
   */
  queryMenuTree: (onlyMenu) => {
    return getRequest(`/menu/tree?onlyMenu=${onlyMenu}`);
  },

  /**
   * 获取所有请求路径
   */
  getAuthUrl: () => {
    return getRequest('/menu/auth/url');
  },
  /**
   * 获取所有菜单下的操作按钮
   */
  getEnumTypeList: (params) => {
    return getRequest('/BasicInfo/GetEnumTypeList', params);
  },
  /**
  * 获取菜单下已勾选的按钮
  */
  getSelectBtnListByPid: (params) => {
    return getRequest('/Permission/GetSelectBtnListByPid', params);
  },
  /**
  * 修改菜单
  */
  editPermission: (param) => {
    return postRequest('/Permission/EditPermission', param);
  },
  /**
 * 启用/禁用菜单
 */
  editPermissionEnable: (param) => {
    return getRequest('/Permission/EditPermissionEnable', param);
  }
};
