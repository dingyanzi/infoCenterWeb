<template>
  <a-card class="employee-container">
    <div class="header">
      <a-typography-title :level="5">部门人员</a-typography-title>
      <div class="query-operate">
        <a-input-search v-model:value.trim="params.LoginName" placeholder="用户名" @search="queryEmployeeByKeyword(true)">
          <template #enterButton>
            <a-button type="primary">
              <template #icon>
                <SearchOutlined />
              </template>
              查询
            </a-button>
          </template>
        </a-input-search>
        <a-button @click="reset" class="smart-margin-left10">
          <template #icon>
            <ReloadOutlined />
          </template>
          重置
        </a-button>
      </div>
    </div>
    <div class="btn-group">
      <a-button class="btn" type="primary" @click="showDrawer">添加成员</a-button>
      <a-button class="btn" @click="batchDelete" v-privilege="'system:employee:delete'">批量删除</a-button>

      <span class="smart-table-column-operate">
        <TableOperator v-model="columns" :tableId="TABLE_ID_CONST.SYSTEM.EMPLOYEE" :refresh="queryEmployee" />
      </span>
    </div>

    <a-table size="small"
      :columns="columns" :data-source="tableData" :pagination="false" :loading="tableLoading" :scroll="{ x: 1500 }"
      row-key="Id" bordered>
      <template #bodyCell="{ text, record, index, column }">
        <template v-if="column.dataIndex === 'IsDeleted'">
          <a-tag :color="record.IsDeleted ? 'processing' : 'error'">{{ record.IsDeleted ? '启用' : '禁用' }}</a-tag>
        </template>
        <template v-if="column.dataIndex === 'RoleNames'">
          <span>{{ record.RoleNames}}</span>
        </template>
        <template v-else-if="column.dataIndex === 'operate'">
          <div class="smart-table-operate">
            <a-button type="link" size="small" @click="showDrawer(record)">编辑</a-button>
            <a-button type="link" size="small"
              @click="resetPassword(record.Id, record.LoginName)">重置密码</a-button>
            <a-button type="link" @click="updateDisabled(record.Id, record.IsDeleted)">{{
              record.IsDeleted ? '启用' : '禁用'
            }}</a-button>
          </div>
        </template>
      </template>
    </a-table>
    <div class="smart-query-table-page">
      <a-pagination showSizeChanger showQuickJumper show-less-items :pageSizeOptions="PAGE_SIZE_OPTIONS"
        :defaultPageSize="params.pageSize" v-model:current="params.CurrentPage" v-model:pageSize="params.pageSize"
        :total="total" @change="queryEmployee" :show-total="showTableTotal" />
    </div>
    <EmployeeFormModal ref="employeeFormModal" @refresh="queryEmployee" @show-account="showAccount" />
    <EmployeeDepartmentFormModal ref="employeeDepartmentFormModal" @refresh="queryEmployee" />
    <EmployeePasswordDialog ref="employeePasswordDialog" />
  </a-card>
</template>
<script setup>
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';
import _ from 'lodash';
import { computed, createVNode, reactive, ref, onMounted } from 'vue';
import { employeeApi } from '/@/api/system/employee-api';
import { PAGE_SIZE } from '/@/constants/common-const';
import { SmartLoading } from '/@/components/framework/smart-loading';
import EmployeeFormModal from '../employee-form-modal/index.vue';
import EmployeeDepartmentFormModal from '../employee-department-form-modal/index.vue';
import EmployeePasswordDialog from '../employee-password-dialog/index.vue';
import { PAGE_SIZE_OPTIONS, showTableTotal } from '/@/constants/common-const';
import { smartSentry } from '/@/lib/smart-sentry';
import TableOperator from '/@/components/support/table-operator/index.vue';
import { TABLE_ID_CONST } from '/@/constants/support/table-id-const';
import { buildFilterParams, FILTER_TYPE } from '/@/utils/smart-filter';
// ----------------------- 以下是字段定义 emits props ---------------------

const props = defineProps({
  breadcrumb: Array,
});

//-------------回显账号密码信息----------
let employeePasswordDialog = ref();
function showAccount(accountName, passWord) {
  employeePasswordDialog.value.showModal(accountName, passWord);
}

// ----------------------- 表格/列表/ 搜索 ---------------------
//字段
const columns = ref([
  {
    title: '用户名',
    dataIndex: 'LoginName',
    width: 100,
  },
  {
    title: '状态',
    dataIndex: 'IsDeleted',
    width: 60,
  },
  {
    title: '角色',
    dataIndex: 'RoleNames',
    width: 100,
  },
  {
    title: '备注',
    dataIndex: 'Remark',
    width: 100,
  },
  {
    title: '操作',
    dataIndex: 'operate',
    width: 140,
  },
]);
const tableData = ref();

let defaultParams = {
  OrderByFileds: 'Id',
  LoginName: undefined,
  CurrentPage: 1,
  OrderByType: 1,
  pageSize: PAGE_SIZE,
  filters:[]
};
const params = reactive({ ...defaultParams });
const total = ref(0);

// 搜索重置
function reset() {
  Object.assign(params, defaultParams);
  queryEmployee();
}

const tableLoading = ref(false);

// 查询
async function queryEmployee() {
  tableLoading.value = true;
  // 保存LoginName值
  const loginName = params.LoginName;
  const filterConfig = {
    LoginName: FILTER_TYPE.CONTAINS,
  };
  params.filters = buildFilterParams(params, filterConfig);
  delete params.LoginName;
  try {
    let res = await employeeApi.queryEmployee(params);
    for (const item of res.data.Data) {
      item.RoleNames = _.join(item.RoleNames, ',');
    }
    tableData.value = res.data.Data;
    total.value = res.data.DataCount;
    // 清除选中
    selectedRowKeys.value = [];
    selectedRows.value = [];
  } catch (error) {
  } finally {
    // 恢复LoginName值，保持输入框中的文字
    params.LoginName = loginName;
    tableLoading.value = false;
  }
}

// 根据关键字 查询
async function queryEmployeeByKeyword(allDepartment) {
  tableLoading.value = true;
  // 保存LoginName值
  const loginName = params.LoginName;
  const filterConfig = {
    LoginName: FILTER_TYPE.CONTAINS,
  };
  params.filters = buildFilterParams(params, filterConfig);
  // 删除LoginName，确保接口入参中不包含
  delete params.LoginName;
  try {
    params.CurrentPage = 1;
    let res = await employeeApi.queryEmployee(params);
     for (const item of res.data.Data) {
      item.RoleNames = _.join(item.RoleNames, ',');
    }
    tableData.value = res.data.Data;
    total.value = res.data.DataCount;
    // 清除选中
    selectedRowKeys.value = [];
    selectedRows.value = [];
  } catch (error) {
  } finally {
    // 恢复LoginName值，保持输入框中的文字
    params.LoginName = loginName;
    tableLoading.value = false;
  }
}

onMounted(queryEmployee);

// watch(
//   () => props.departmentId,
//   () => {
//     if (props.departmentId !== params.departmentId) {
//       params.CurrentPage = 1;
//       queryEmployee();
//     }
//   },
//   { immediate: true }
// );

// ----------------------- 多选操作 ---------------------

let selectedRowKeys = ref([]);
let selectedRows = ref([]);
// 是否有选中：用于 批量操作按钮的禁用
const hasSelected = computed(() => selectedRowKeys.value.length > 0);

function onSelectChange(keyArray, selectRows) {
  selectedRowKeys.value = keyArray;
  selectedRows.value = selectRows;
}

// 批量删除员工
function batchDelete() {
  if (!hasSelected.value) {
    message.warning('请选择要删除的员工');
    return;
  }
  const actualNameArray = selectedRows.value.map((e) => e.actualName);
  const employeeIdArray = selectedRows.value.map((e) => e.employeeId);
  Modal.confirm({
    title: '确定要删除如下员工吗?',
    icon: createVNode(ExclamationCircleOutlined),
    content: _.join(actualNameArray, ','),
    okText: '删除',
    okType: 'danger',
    async onOk() {
      SmartLoading.show();
      try {
        await employeeApi.batchDeleteEmployee(employeeIdArray);
        message.success('删除成功');
        queryEmployee();
        selectedRowKeys.value = [];
        selectedRows.value = [];
      } catch (error) {
        smartSentry.captureError(error);
      } finally {
        SmartLoading.hide();
      }
    },
    cancelText: '取消',
    onCancel() { },
  });
}

// 批量更新员工部门
const employeeDepartmentFormModal = ref();

function updateEmployeeDepartment() {
  if (!hasSelected.value) {
    message.warning('请选择要调整部门的员工');
    return;
  }
  const employeeIdArray = selectedRows.value.map((e) => e.employeeId);
  employeeDepartmentFormModal.value.showModal(employeeIdArray);
}

// ----------------------- 添加、修改、禁用、重置密码 ------------------------------------

const employeeFormModal = ref(); //组件

// 展示编辑弹窗
function showDrawer(rowData) {
  let params = {};
  if (rowData) {
    params = _.cloneDeep(rowData);
  } else if (props.departmentId) {
    params.departmentId = props.departmentId;
  }
  employeeFormModal.value.showDrawer(params);
}

// 重置密码
function resetPassword(id, name) {
  console.log(id, name);
  Modal.confirm({
    title: '提醒',
    icon: createVNode(ExclamationCircleOutlined),
    content: '确定要重置密码吗?',
    okText: '确定',
    okType: 'danger',
    async onOk() {
      SmartLoading.show();
      try {
        let { res } = await employeeApi.resetPassword(id);
        message.success('重置成功');
        queryEmployee();
      } catch (error) {
        smartSentry.captureError(error);
      } finally {
        SmartLoading.hide();
      }
    },
    cancelText: '取消',
    onCancel() { },
  });
}

// 禁用 / 启用
function updateDisabled(id, IsDeleted) {
  Modal.confirm({
    title: '提醒',
    icon: createVNode(ExclamationCircleOutlined),
    content: `确定要${IsDeleted ? '启用' : '禁用'}吗?`,
    okText: '确定',
    okType: 'danger',
    async onOk() {
      SmartLoading.show();
      try {
        await employeeApi.updateDisabled(`id=${id}&isEnable=${!IsDeleted}`);
        message.success(`${IsDeleted ? '启用' : '禁用'}成功`);
        queryEmployee();
      } catch (error) {
        smartSentry.captureError(error);
      } finally {
        SmartLoading.hide();
      }
    },
    cancelText: '取消',
    onCancel() { },
  });
}
</script>
<style scoped lang="less">
.header {
  display: flex;
  align-items: center;
}

.query-operate {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.btn-group {
  margin: 10px 0;

  .btn {
    margin-right: 8px;
  }
}
</style>
