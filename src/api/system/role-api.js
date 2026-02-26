import { getRequest, postRequest,deleteRequest } from '/@/lib/axios';

export const roleApi = {
  //获取所有菜单树
  getAllPermissionTree: () => {
    return getRequest('Permission/GetAllPermissionTree');
  },
  //获取可用角色列表
  getRoleList: () => {
    return getRequest('Role/GetRoleList');
  },
  /**
   * @description: 获取所有角色
   */
  queryAll: (data) => {
    return postRequest('Role/GetRolesForPaged', data);
  },
  /**
   * @description:添加角色
   */
  addRole: (data) => {
    return postRequest('Role/AddRole', data);
  },
  /**
   * @description:更新角色
   */
  updateRole: (data) => {
    return postRequest('Role/ModifyRole', data);
  },
   /**
   * @description:启用禁用角色
   */
  ModifyRoleUsable: (params) => {
    return getRequest(`Role/ModifyRoleUsable?${params}`);
  },
  /**
   * @description: 获取角色成员-员工列表
   */
  queryRoleEmployee: (params) => {
    return postRequest('role/employee/queryEmployee', params);
  },
  /**
   * @description: 从角色成员列表中移除员工
   */
  deleteEmployeeRole: (employeeId, roleId) => {
    return getRequest('role/employee/removeEmployee?employeeId=' + employeeId + '&roleId=' + roleId);
  },
  /**
   * @description: 从角色成员列表中批量移除员工
   */
  batchRemoveRoleEmployee: (data) => {
    return postRequest('role/employee/batchRemoveRoleEmployee', data);
  },
  /**
   * @description: 根据角色id获取角色员工列表(无分页)
   */
  getRoleAllEmployee: (roleId) => {
    return getRequest(`role/employee/getAllEmployeeByRoleId/${roleId}`);
  },
  /**
   * @description: 角色成员列表中批量添加员工
   */
  batchAddRoleEmployee: (data) => {
    return postRequest('role/employee/batchAddRoleEmployee', data);
  },
};
