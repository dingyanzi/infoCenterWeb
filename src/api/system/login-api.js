import { getRequest, postRequest } from '/@/lib/axios';

export const loginApi = {
  /**
   * 登录
   */
  login: (param) => {
    return postRequest('/Login/Login', param);
  },

  /**
   * 退出登录
   */
  logout: () => {
    return getRequest('/login/logout');
  },

  /**
   * 获取登录用户信息
   */
  getUserInfo: () => {
    return getRequest('/User/GetUserInfo');
  },

  /**
   * 获取用户权限树
   */
  getUserPermissiontree: () => {
    return getRequest('/User/GetUserPermissionList');
  },
};
