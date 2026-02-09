<template>
  <div>
    <a-form class="smart-query-form">
      <a-row class="smart-query-form-row">
        <a-form-item label="名称" class="smart-query-form-item">
          <a-input style="width: 300px" v-model:value="queryForm.keyCode" placeholder="菜单名称" />
        </a-form-item>

        <a-form-item class="smart-query-form-item smart-margin-left10">
          <a-button-group>
            <a-button type="primary" @click="query">
              <template #icon>
                <SearchOutlined />
              </template>
              查询
            </a-button>

            <a-button @click="resetQuery">
              <template #icon>
                <ReloadOutlined />
              </template>
              重置
            </a-button>
          </a-button-group>
        </a-form-item>
      </a-row>
    </a-form>

    <a-card size="small" :bordered="false" :hoverable="true">
      <a-row class="smart-table-btn-block">
        <div class="smart-table-operate-block">
          <a-button type="primary" @click="showDrawer">
            <template #icon>
              <PlusOutlined />
            </template>
            {{ $t('system.addMenu') }}
          </a-button>

          <a-button v-privilege="'system:menu:batchDelete'" type="primary" danger @click="batchDelete"
            :disabled="!hasSelected">
            <template #icon>
              <DeleteOutlined />
            </template>
            批量删除
          </a-button>
        </div>
        <div class="smart-table-setting-block">
          <TableOperator v-model="columns" :tableId="TABLE_ID_CONST.SYSTEM.MENU" :refresh="query" />
        </div>
      </a-row>
      <a-table :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }" size="small"
        :scroll="{ y: 800 }" :defaultExpandAllRows="true" :dataSource="tableData" bordered :columns="columns"
        :loading="tableLoading" rowKey="menuId" :pagination="false">
        <template #bodyCell="{ text, record, column }">
          <template v-if="column.dataIndex === 'component'">
            <span>{{ record.frameFlag ? record.frameUrl : record.component }}</span>
          </template>

          <template v-if="column.dataIndex === 'frameFlag'">
            <span>{{ $smartEnumPlugin.getDescByValue('FLAG_NUMBER_ENUM', text) }}</span>
          </template>

          <template v-if="column.dataIndex === 'permsType'">
            <span>{{ $smartEnumPlugin.getDescByValue('MENU_PERMS_TYPE_ENUM', text) }}</span>
          </template>

          <template v-if="column.dataIndex === 'cacheFlag'">
            <span>{{ $smartEnumPlugin.getDescByValue('FLAG_NUMBER_ENUM', text) }}</span>
          </template>

          <template v-if="column.dataIndex === 'visibleFlag'">
            <span>{{ $smartEnumPlugin.getDescByValue('FLAG_NUMBER_ENUM', text) }}</span>
          </template>

          <template v-if="column.dataIndex === 'disabledFlag'">
            <span>{{ $smartEnumPlugin.getDescByValue('FLAG_NUMBER_ENUM', text) }}</span>
          </template>

          <template v-if="column.dataIndex === 'icon'">
            <component :is="$antIcons[text]" />
          </template>

          <template v-if="column.dataIndex === 'operate'">
            <div class="smart-table-operate">
              <a-button v-if="record.menuType == MENU_TYPE_ENUM.CATALOG.value" type="link" size="small"
                @click="showAddSub(record)">
                添加下级
              </a-button>
              <a-button v-if="record.menuType !== MENU_TYPE_ENUM.POINTS.value" type="link" size="small"
                @click="showDrawer(record)">编辑</a-button>
              <a-button v-if="record.menuType !== MENU_TYPE_ENUM.POINTS.value" danger type="link"
                @click="singleDelete(record)">删除</a-button>
              <a-button style="font-size: 12px;" size="small" type="primary" @click="updateStatus(record)">{{
                record.disabledFlag ? '启用' : '禁用'
              }}</a-button>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <MenuOperateModal ref="menuOperateModal" @reloadList="query" />
  </div>
</template>
<script setup>
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';
import _ from 'lodash';
import { computed, createVNode, onMounted, reactive, ref } from 'vue';
import MenuOperateModal from './components/menu-operate-modal.vue';
import { buildMenuTableTree } from './menu-data-handler';
import { columns } from './menu-list-table-columns';
import { menuApi } from '/@/api/system/menu-api';
import SmartEnumSelect from '/@/components/framework/smart-enum-select/index.vue';
import { SmartLoading } from '/@/components/framework/smart-loading';
import { smartSentry } from '/@/lib/smart-sentry';
import TableOperator from '/@/components/support/table-operator/index.vue';
import { TABLE_ID_CONST } from '/@/constants/support/table-id-const';
import { MENU_TYPE_ENUM } from '/@/constants/system/menu-const';


// ------------------------ 表格渲染 ------------------------
const menuTypeColorArray = ['red', 'blue', 'orange', 'green'];

// ------------------------ 查询表单 ------------------------
const queryFormState = {
  keyCode: '',
};
const queryForm = reactive({ ...queryFormState });

// ------------------------ table表格数据和查询方法 ------------------------

const tableLoading = ref(false);
const tableData = ref([]);

function resetQuery() {
  Object.assign(queryForm, queryFormState);
  query();
}

onMounted(query);

async function query() {
  try {
    tableLoading.value = true;
    let responseModel = await menuApi.queryMenu({ keyCode: queryForm.keyCode });
    // 递归构造树形结构，并付给 TableTree组件
    tableData.value = buildMenuTableTree(responseModel.data);
  } catch (e) {
  } finally {
    tableLoading.value = false;
  }
}

// -------------- 多选操作 --------------
const selectedRowKeys = ref([]);
let selectedRows = [];
const hasSelected = computed(() => selectedRowKeys.value.length > 0);

function onSelectChange(keyArray, selectRows) {
  selectedRowKeys.value = keyArray;
  selectedRows = selectRows;
}

function singleDelete(record) {
  confirmBatchDelete([record]);
}

function batchDelete() {
  confirmBatchDelete(selectedRows);
}

function confirmBatchDelete(menuArray) {
  const menuNameArray = menuArray.map((e) => e.menuName);
  Modal.confirm({
    title: '确定要删除如下菜单吗?',
    icon: createVNode(ExclamationCircleOutlined),
    content: _.join(menuNameArray, '、'),
    okText: '删除',
    okType: 'danger',
    onOk() {
      console.log('OK');
      const menuIdList = menuArray.map((e) => e.menuId);
      requestBatchDelete(menuIdList);
      selectedRows = [];
    },
    cancelText: '取消',
    onCancel() { },
  });

  async function requestBatchDelete(menuIdList) {
    SmartLoading.show();
    try {
      await menuApi.batchDeleteMenu(menuIdList);
      message.success('删除成功!');
      query();
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      SmartLoading.hide();
    }
  }
}

function updateStatus(record) {
  const title = record.disabledFlag ? '启用' : '禁用';
  Modal.confirm({
    title: `提示`,
    icon: createVNode(ExclamationCircleOutlined),
    content: `确认${title}？`,
    onOk() {
      requestUpdateStatus(record);
    },
    cancelText: '取消',
    onCancel() { },
  });
}

async function requestUpdateStatus(record) {
  SmartLoading.show();
  try {
    await menuApi.editPermissionEnable({ Id: record.menuId, enable: record.disabledFlag });
    message.success('操作成功!');
    query();
  } catch (e) {
  } finally {
    SmartLoading.hide();
  }
}


// -------------- 添加、修改 右侧抽屉 --------------
const menuOperateModal = ref();
function showDrawer(rowData) {
  menuOperateModal.value.showDrawer(rowData);
}

function showAddSub(rowData) {
  const subData = {
    parentId: rowData.menuId,
    menuType: rowData.menuType === MENU_TYPE_ENUM.CATALOG.value ? MENU_TYPE_ENUM.MENU.value : MENU_TYPE_ENUM.POINTS.value,
    contextMenuId: rowData.menuType === MENU_TYPE_ENUM.MENU.value ? rowData.menuId : undefined,
  };
  menuOperateModal.value.showDrawer(subData);
}
</script>
