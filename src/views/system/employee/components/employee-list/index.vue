<template>
  <a-card class="employee-container">
    <div class="header">
      <a-typography-title :level="5">{{ t('employee.list.title') }}</a-typography-title>
      <div class="query-operate">
        <a-input-search v-model:value.trim="params.LoginName" :placeholder="t('employee.list.search.placeholder')" @search="queryEmployeeByKeyword(true)">
          <template #enterButton>
            <a-button type="primary">
              <template #icon>
                <SearchOutlined />
              </template>
              {{ t('employee.list.button.search') }}
            </a-button>
          </template>
        </a-input-search>
        <a-button @click="reset" class="smart-margin-left10">
          <template #icon>
            <ReloadOutlined />
          </template>
          {{ t('employee.list.button.reset') }}
        </a-button>
      </div>
    </div>
    <div class="btn-group">
      <a-button class="btn" type="primary" @click="showDrawer">{{ t('employee.list.button.add') }}</a-button>

      <span class="smart-table-column-operate">
        <TableOperator v-model="columns" :tableId="TABLE_ID_CONST.SYSTEM.EMPLOYEE" :refresh="queryEmployee" />
      </span>
    </div>

    <a-table size="small" :columns="columns" :data-source="tableData" :pagination="false" :loading="tableLoading"
      :scroll="{ x: 1500 }" row-key="Id" bordered>
      <template #bodyCell="{ text, record, index, column }">
        <template v-if="column.dataIndex === 'IsDeleted'">
          <a-tag :color="record.IsDeleted ? 'processing' : 'error'">{{ record.IsDeleted ? t('employee.list.operate.enable') : t('employee.list.operate.disable') }}</a-tag>
        </template>
        <template v-if="column.dataIndex === 'RoleNames'">
          <span>{{ record.RoleNames }}</span>
        </template>
        <template v-else-if="column.dataIndex === 'operate'">
          <div class="smart-table-operate">
            <a-button type="link" size="small" @click="showDrawer(record)">{{ t('employee.list.operate.edit') }}</a-button>
            <a-button type="link" size="small" @click="resetPassword(record.Id, record.LoginName)">{{ t('employee.list.operate.resetPassword') }}</a-button>
            <a-button type="link" @click="updateDisabled(record.Id, record.IsDeleted)">{{
              record.IsDeleted ? t('employee.list.operate.enable') : t('employee.list.operate.disable')
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
    <EmployeePasswordDialog ref="employeePasswordDialog" />
  </a-card>
</template>
<script setup>
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';
import _ from 'lodash';
import { computed, createVNode, reactive, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { employeeApi } from '/@/api/system/employee-api';
import { PAGE_SIZE } from '/@/constants/common-const';
import { SmartLoading } from '/@/components/framework/smart-loading';
import EmployeeFormModal from '../employee-form-modal/index.vue';
import EmployeePasswordDialog from '../employee-password-dialog/index.vue';
import { PAGE_SIZE_OPTIONS, showTableTotal } from '/@/constants/common-const';
import { smartSentry } from '/@/lib/smart-sentry';
import TableOperator from '/@/components/support/table-operator/index.vue';
import { TABLE_ID_CONST } from '/@/constants/support/table-id-const';
import { buildFilterParams, FILTER_TYPE } from '/@/utils/smart-filter';

// 获取 i18n 实例
const { t } = useI18n();
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

// 在组件挂载后更新列标题为翻译后的文本
onMounted(() => {
  columns.value = [
    {
      title: t('employee.list.column.username'),
      dataIndex: 'LoginName',
      width: 100,
    },
    {
      title: t('employee.list.column.status'),
      dataIndex: 'IsDeleted',
      width: 60,
    },
    {
      title: t('employee.list.column.role'),
      dataIndex: 'RoleNames',
      width: 100,
    },
    {
      title: t('employee.list.column.remark'),
      dataIndex: 'Remark',
      width: 100,
    },
    {
      title: t('employee.list.column.operate'),
      dataIndex: 'operate',
      width: 140,
    },
  ];
  queryEmployee();
});
const tableData = ref();

let defaultParams = {
  OrderByFileds: 'Id',
  LoginName: undefined,
  CurrentPage: 1,
  OrderByType: 1,
  pageSize: PAGE_SIZE,
  filters: []
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
  const filterConfig = {
    LoginName: FILTER_TYPE.CONTAINS,
  };
  const { filters, cleanQueryForm } = buildFilterParams(params, filterConfig);
  cleanQueryForm.filters = filters;
  try {
    let res = await employeeApi.queryEmployee(cleanQueryForm);
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
    tableLoading.value = false;
  }
}

// 根据关键字 查询
async function queryEmployeeByKeyword(allDepartment) {
  tableLoading.value = true;
  const filterConfig = {
    LoginName: FILTER_TYPE.CONTAINS,
  };
  const { filters, cleanQueryForm } = buildFilterParams(params, filterConfig);
  cleanQueryForm.filters = filters;
  try {
    cleanQueryForm.CurrentPage = 1;
    let res = await employeeApi.queryEmployee(cleanQueryForm);
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
    title: t('employee.list.modal.title'),
    icon: createVNode(ExclamationCircleOutlined),
    content: t('employee.list.modal.resetPassword'),
    okText: t('employee.list.modal.ok'),
    okType: 'danger',
    async onOk() {
      SmartLoading.show();
      try {
        let { res } = await employeeApi.resetPassword(id);
        message.success(t('employee.list.message.resetSuccess'));
        queryEmployee();
      } catch (error) {
        smartSentry.captureError(error);
      } finally {
        SmartLoading.hide();
      }
    },
    cancelText: t('employee.list.modal.cancel'),
    onCancel() { },
  });
}

// 禁用 / 启用
function updateDisabled(id, IsDeleted) {
  Modal.confirm({
    title: t('employee.list.modal.title'),
    icon: createVNode(ExclamationCircleOutlined),
    content: IsDeleted ? t('employee.list.modal.enable') : t('employee.list.modal.disable'),
    okText: t('employee.list.modal.ok'),
    okType: 'danger',
    async onOk() {
      SmartLoading.show();
      try {
        await employeeApi.updateDisabled(`id=${id}&isEnable=${!IsDeleted}`);
        message.success(IsDeleted ? t('employee.list.message.enableSuccess') : t('employee.list.message.disableSuccess'));
        queryEmployee();
      } catch (error) {
        smartSentry.captureError(error);
      } finally {
        SmartLoading.hide();
      }
    },
    cancelText: t('employee.list.modal.cancel'),
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
