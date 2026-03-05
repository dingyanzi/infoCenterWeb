<template>
  <div>
    <a-form class="smart-query-form">
      <a-row class="smart-query-form-row">
        <a-form-item :label="t('menu.query.label.name')" class="smart-query-form-item">
          <a-input style="width: 300px" v-model:value="queryForm.keyCode" :placeholder="t('menu.query.placeholder.name')" />
        </a-form-item>

        <a-form-item class="smart-query-form-item smart-margin-left10">
          <a-button-group>
            <a-button type="primary" @click="query" v-privilege="'system:menu:Query'">
              <template #icon>
                <SearchOutlined />
              </template>
              {{ t('menu.query.button.search') }}
            </a-button>

            <a-button @click="resetQuery">
              <template #icon>
                <ReloadOutlined />
              </template>
              {{ t('menu.query.button.reset') }}
            </a-button>
          </a-button-group>
        </a-form-item>
      </a-row>
    </a-form>

    <a-card size="small" :bordered="false" :hoverable="true">
      <a-row class="smart-table-btn-block">
        <div class="smart-table-operate-block">
          <a-button v-privilege="'system:menu:Add'" type="primary" @click="showDrawer">
            <template #icon>
              <PlusOutlined />
            </template>
            {{ $t('system.addMenu') }}
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
          <template v-if="column.dataIndex === 'menuType'">
            <a-tag :color="menuTypeColorArray[text]">{{ $smartEnumPlugin.getDescByValue('MENU_TYPE_ENUM', text)
            }}</a-tag>
          </template>
          <template v-if="column.dataIndex === 'icon'">
            <component :is="$antIcons[text]" />
          </template>

          <template v-if="column.dataIndex === 'operate'">
            <div class="smart-table-operate">
              <a-button v-privilege="'system:menu:Add'" v-if="record.menuType == MENU_TYPE_ENUM.CATALOG.value"
                type="primary" size="small" @click="showAddSub(record)">
                {{ t('menu.operate.addSub') }}
              </a-button>
              <a-button v-privilege="'system:menu:Edit'" v-if="record.menuType !== MENU_TYPE_ENUM.POINTS.value"
                type="primary" size="small" @click="showDrawer(record)">{{ t('menu.operate.edit') }}</a-button>
              <a-button v-if="record.menuType !== MENU_TYPE_ENUM.POINTS.value" danger type="primary" size="small"
                @click="singleDelete(record)">{{ t('menu.operate.delete') }}</a-button>
              <a-button v-privilege="'system:menu:Delete'" v-if="record.menuType !== MENU_TYPE_ENUM.POINTS.value"
                style="font-size: 12px;" size="small" type="primary" @click="updateStatus(record)">{{
                  record.disabledFlag ? t('menu.operate.enable') : t('menu.operate.disable')
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
import { useI18n } from 'vue-i18n';
import MenuOperateModal from './components/menu-operate-modal.vue';
import { buildMenuTableTree } from './menu-data-handler';
import { useColumns } from './menu-list-table-columns';
import { menuApi } from '/@/api/system/menu-api';
import SmartEnumSelect from '/@/components/framework/smart-enum-select/index.vue';
import { SmartLoading } from '/@/components/framework/smart-loading';
import { smartSentry } from '/@/lib/smart-sentry';
import TableOperator from '/@/components/support/table-operator/index.vue';
import { TABLE_ID_CONST } from '/@/constants/support/table-id-const';
import { MENU_TYPE_ENUM } from '/@/constants/system/menu-const';

// 获取 i18n 实例
const { t } = useI18n();

// 获取表格列配置
const columns = useColumns();

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
    title: t('menu.modal.delete.title'),
    icon: createVNode(ExclamationCircleOutlined),
    content: _.join(menuNameArray, '、'),
    okText: t('menu.modal.delete.confirm'),
    okType: 'danger',
    onOk() {
      console.log('OK');
      const menuIdList = menuArray.map((e) => e.menuId);
      requestBatchDelete(menuIdList);
      selectedRows = [];
    },
    cancelText: t('menu.modal.delete.cancel'),
    onCancel() { },
  });

  async function requestBatchDelete(menuIdList) {
    SmartLoading.show();
    try {
      await menuApi.batchDeleteMenu(menuIdList);
      message.success(t('menu.message.deleteSuccess'));
      query();
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      SmartLoading.hide();
    }
  }
}

function updateStatus(record) {
  Modal.confirm({
    title: t('menu.modal.status.title'),
    icon: createVNode(ExclamationCircleOutlined),
    content: record.disabledFlag ? t('menu.modal.status.confirm.enable') : t('menu.modal.status.confirm.disable'),
    onOk() {
      requestUpdateStatus(record);
    },
    cancelText: t('menu.modal.status.cancel'),
    onCancel() { },
  });
}

async function requestUpdateStatus(record) {
  SmartLoading.show();
  try {
    await menuApi.editPermissionEnable({ Id: record.menuId, enable: record.disabledFlag });
    message.success(t('menu.message.operationSuccess'));
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
<style scoped>
.smart-table-operate button {
  font-size: 12px !important;
  margin: 0 3px;
}
</style>