<template>
  <a-form class="smart-query-form">
    <a-row class="smart-query-form-row">
      <a-form-item :label="$t('dict.list.query.label.name')" class="smart-query-form-item">
        <a-input style="width: 300px" @keyup.enter="onSearch" v-model:value="queryForm.DictName" :placeholder="$t('dict.list.query.placeholder.name')" />
      </a-form-item>
      <a-form-item :label="$t('dict.list.query.label.enabled')" class="smart-query-form-item">
        <BooleanSelect v-model:value="queryForm.Enabled" style="width: 150px" />
      </a-form-item>
      <a-form-item class="smart-query-form-item smart-margin-left10">
        <a-button-group>
          <a-button type="primary" @click="onSearch">
            <template #icon>
              <SearchOutlined />
            </template>
            {{ $t('dict.list.button.search') }}
          </a-button>
          <a-button @click="resetQuery">
            <template #icon>
              <ReloadOutlined />
            </template>
            {{ $t('dict.list.button.reset') }}
          </a-button>
        </a-button-group>
      </a-form-item>
    </a-row>
  </a-form>

  <a-card size="small" :bordered="false" :hoverable="true">
    <a-row class="smart-table-btn-block">
      <div class="smart-table-operate-block">
        <a-button @click="addOrUpdateDict" v-privilege="'support:dict:add'" type="primary">
          <template #icon>
            <PlusOutlined />
          </template>
          {{ $t('dict.list.button.add') }}
        </a-button>

        <a-button @click="confirmBatchDelete" v-privilege="'support:dict:delete'" type="primary" danger :disabled="selectedRowKeyList.length === 0">
          <template #icon>
            <DeleteOutlined />
          </template>
          {{ $t('dict.list.button.batchDelete') }}
        </a-button>
      </div>
      <div class="smart-table-setting-block">
        <TableOperator class="smart-margin-bottom5" v-model="columns" :tableId="TABLE_ID_CONST.SUPPORT.DICT" :refresh="ajaxQuery" />
      </div>
    </a-row>

    <a-table
      size="small"
      :dataSource="tableData"
      :columns="columns"
      :loading="tableLoading"
      rowKey="DictId"
      :pagination="false"
      bordered
      :row-selection="{ selectedRowKeys: selectedRowKeyList, onChange: onSelectChange }"
    >
      <template #bodyCell="{ record, column }">
        <template v-if="column.dataIndex === 'DictId'">
          <a @click="showDictData(record)">{{ record.DictId }}</a>
        </template>
        <template v-if="column.dataIndex === 'Enabled'">
          <a-switch
            @change="(checked) => handleChangeDisabled(checked, record)"
            v-model:checked="record.Enabled"
            :checked-children="$t('dict.list.status.enabled')"
            :un-checked-children="$t('dict.list.status.disabled')"
          />
        </template>
        <template v-else-if="column.dataIndex === 'action'">
          <div class="smart-table-operate">
            <a-button @click="addOrUpdateDict(record)" v-privilege="'support:dict:update'" type="link">{{ $t('dict.list.operate.edit') }}</a-button>
          </div>
        </template>
      </template>
    </a-table>

    <div class="smart-query-table-page">
      <a-pagination
        showSizeChanger
        showQuickJumper
        show-less-items
        :pageSizeOptions="PAGE_SIZE_OPTIONS"
        :defaultPageSize="queryForm.pageSize"
        v-model:current="queryForm.CurrentPage"
        v-model:pageSize="queryForm.pageSize"
        :total="total"
        @change="ajaxQuery"
        :show-total="(total) => $t('dict.list.pagination.total', { total })"
      />
    </div>

    <DictFormModal ref="dictFormModalRef" @reloadList="ajaxQuery" />
    <!-- 值列表 -->
    <DictDataModal ref="dictDataModalRef" />
  </a-card>
</template>
<script setup>
  import DictFormModal from './components/dict-form-modal.vue';
  import DictDataModal from './components/dict-data-modal.vue';
  import { onMounted, reactive, ref, getCurrentInstance } from 'vue';
  
  const { proxy } = getCurrentInstance();
  const $t = proxy.$t;
  import { message, Modal } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { dictApi } from '/@/api/support/dict-api';
  import { PAGE_SIZE_OPTIONS } from '/@/constants/common-const';
  import { smartSentry } from '/@/lib/smart-sentry';
  import TableOperator from '/@/components/support/table-operator/index.vue';
  import { TABLE_ID_CONST } from '/@/constants/support/table-id-const';
  import BooleanSelect from '/@/components/framework/boolean-select/index.vue';
  import { buildFilterParams, FILTER_TYPE } from '/@/utils/smart-filter';

  const columns = ref([
    {
      title: () => $t('dict.list.column.id'),
      width: 90,
      dataIndex: 'DictId',
    },
    {
      title: () => $t('dict.list.column.code'),
      dataIndex: 'DictCode',
    },
    {
      title: () => $t('dict.list.column.name'),
      dataIndex: 'DictName',
    },
    {
      title: () => $t('dict.list.column.remark'),
      dataIndex: 'Remark',
    },
    {
      title: () => $t('dict.list.column.status'),
      width: 90,
      dataIndex: 'Enabled',
    },
    {
      title: () => $t('dict.list.column.updateTime'),
      width: 160,
      dataIndex: 'UpdateTime',
    },
    {
      title: () => $t('dict.list.column.operate'),
      dataIndex: 'action',
      fixed: 'right',
      width: 50,
    },
  ]);

  // ---------------- 查询数据 -----------------

  const queryFormState = {
    DictName: '',
    Enabled: null,
    CurrentPage: 1,
    pageSize: 10,
    OrderByFileds: 'DictName',
    OrderByType: 'Asc',
    filters: []
  };
  const queryForm = reactive({ ...queryFormState });
  const tableLoading = ref(false);
  const selectedRowKeyList = ref([]);
  const tableData = ref([]);
  const total = ref(0);
  const dictFormModalRef = ref();
  const dictDataModalRef = ref();

  // 显示操作记录弹窗
  function showDictData(dict) {
    dictDataModalRef.value.showModal(dict.DictId, dict.DictCode);
  }

  function onSelectChange(selectedRowKeys) {
    selectedRowKeyList.value = selectedRowKeys;
  }

  function resetQuery() {
    Object.assign(queryForm, queryFormState);
    ajaxQuery();
  }
  function onSearch() {
    queryForm.CurrentPage = 1;
    ajaxQuery();
  }
  async function ajaxQuery() {
    const filterConfig = {
      DictName: FILTER_TYPE.CONTAINS,
      Enabled: FILTER_TYPE.EQUAL,
    };
    const { filters, cleanQueryForm } = buildFilterParams(queryForm, filterConfig);
    cleanQueryForm.filters = filters;
    try {
      tableLoading.value = true;
      let responseData = await dictApi.queryDict(cleanQueryForm);
      const list = responseData.Data;
      total.value = responseData.DataCount;
      tableData.value = list;
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      tableLoading.value = false;
    }
  }

  // ----------------------- 启用/禁用 ------------------------
  async function handleChangeDisabled(Enabled, dict) {
    SmartLoading.show();
    try {
      await dictApi.updateDisabled({ DictId: dict.DictId, Enabled: Enabled });
      dict.Enabled = Enabled;
      message.success($t('dict.list.message.operationSuccess'));
      onSearch();
    } catch (e) {
      // smartSentry.captureError(e);
    } finally {
      SmartLoading.hide();
    }
  }

  // ---------------- 批量 删除 -----------------

  function confirmBatchDelete() {
    Modal.confirm({
      title: $t('dict.list.modal.delete.title'),
      content: $t('dict.list.modal.delete.content'),
      okText: $t('dict.list.modal.delete.ok'),
      okType: 'danger',
      onOk() {
        batchDelete();
      },
      cancelText: $t('dict.list.modal.delete.cancel'),
      onCancel() {},
    });
  }

  async function batchDelete() {
    try {
      SmartLoading.show();
      await dictApi.batchDeleteDict(selectedRowKeyList.value);
      message.success($t('dict.list.message.deleteSuccess'));
      await ajaxQuery();
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      SmartLoading.hide();
    }
  }

  // ---------------- 添加/更新 -----------------

  function addOrUpdateDict(rowData) {
    dictFormModalRef.value.showModal(rowData);
  }

  onMounted(ajaxQuery);
</script>
