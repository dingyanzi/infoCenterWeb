<template>
  <a-drawer :width="1000" :open="visible" :body-style="{ paddingBottom: '80px' }" :title="$t('dict.data.title')" @close="onClose">
    <a-form class="smart-query-form">
      <a-row class="smart-query-form-row">
        <a-form-item :label="$t('dict.data.query.label.keyword')" class="smart-query-form-item">
          <a-input style="width: 300px" v-model:value="keywords" @change="search" :placeholder="$t('dict.data.query.placeholder.keyword')" />
        </a-form-item>
        <a-form-item :label="$t('dict.data.query.label.enabled')" class="smart-query-form-item">
          <BooleanSelect v-model:value="Enabled" @change="search" style="width: 150px" />
        </a-form-item>

        <a-form-item class="smart-query-form-item smart-margin-left10">
          <a-button type="primary" @click="queryData">
            <template #icon> <SearchOutlined /> </template>
            {{ $t('dict.data.button.search') }}
          </a-button>
          <a-button @click="resetQuery" class="smart-margin-left10">
            <template #icon> <ReloadOutlined /> </template>
            {{ $t('dict.data.button.reset') }}
          </a-button>
        </a-form-item>
      </a-row>
    </a-form>

    <a-row class="smart-table-btn-block">
      <div class="smart-table-operate-block">
        <a-button @click="addOrUpdateData" type="primary" v-privilege="'support:dictData:add'">
          <template #icon>
            <PlusOutlined />
          </template>
          {{ $t('dict.data.button.add') }}
        </a-button>

        <a-button
          @click="confirmBatchDelete"
          type="primary"
          danger
          :disabled="selectedRowKeyList.length === 0"
          v-privilege="'support:dictData:delete'"
        >
          <template #icon>
            <DeleteOutlined />
          </template>
          {{ $t('dict.data.button.batchDelete') }}
        </a-button>
      </div>
      <div class="smart-table-setting-block"></div>
    </a-row>

    <a-table
      size="small"
      :dataSource="tableData"
      :columns="columns"
      rowKey="DictDataId"
      :pagination="false"
      :row-selection="{ selectedRowKeys: selectedRowKeyList, onChange: onSelectChange }"
      bordered
    >
      <template #bodyCell="{ record, column }">
        <template v-if="column.dataIndex === 'Enabled'">
          <a-switch
            @change="(checked) => handleChangeDisabled(checked, record)"
            v-model:checked="record.enabled"
            :checked-children="$t('dict.data.status.enabled')"
            :un-checked-children="$t('dict.data.status.disabled')"
          />
        </template>
        <template v-if="column.dataIndex === 'action'">
          <a-button @click="addOrUpdateData(record)" type="link" v-privilege="'support:dictData:update'">{{ $t('dict.data.operate.edit') }}</a-button>
        </template>
      </template>
    </a-table>

    <div class="smart-query-table-page">{{ $t('dict.data.pagination.total', { total: tableData.length }) }}</div>
    <DictDataFormModal ref="dictDataFormModalRef" @reloadList="queryData" />
  </a-drawer>
</template>
<script setup>
  import { reactive, ref, getCurrentInstance } from 'vue';
  
  const { proxy } = getCurrentInstance();
  const $t = proxy.$t;
  import DictDataFormModal from './dict-data-form-modal.vue';
  import { dictApi } from '/@/api/support/dict-api';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { Modal } from 'ant-design-vue';
  import { message } from 'ant-design-vue';
  import { smartSentry } from '/@/lib/smart-sentry';
  import BooleanSelect from '/@/components/framework/boolean-select/index.vue';
  import _ from 'lodash';
  import { DICT_DATA_STYLE_ENUM } from '/@/constants/support/dict-const';

  // 是否展示抽屉
  const visible = ref(false);
  const dictId = ref(undefined);
  const dictCode = ref(undefined);

  function showModal(id, code) {
    dictId.value = id;
    dictCode.value = code;
    visible.value = true;
    queryData();
  }

  function onClose() {
    visible.value = false;
    dictId.value = undefined;
    dictCode.value = undefined;
  }

  const columns = reactive([
    {
      title: () => $t('dict.data.column.value'),
      dataIndex: 'DataValue',
    },
    {
      title: () => $t('dict.data.column.label'),
      dataIndex: 'DataLabel',
    },
    {
      title: () => $t('dict.data.column.status'),
      width: 90,
      dataIndex: 'Enabled',
    },
    {
      title: () => $t('dict.data.column.sort'),
      width: 50,
      dataIndex: 'SortOrder',
    },
    {
      title: () => $t('dict.data.column.remark'),
      width: 200,
      ellipsis: true,
      dataIndex: 'Remark',
    },
    {
      title: () => $t('dict.data.column.updateTime'),
      width: 150,
      dataIndex: 'UpdateTime',
    },
    {
      title: () => $t('dict.data.column.operate'),
      width: 70,
      dataIndex: 'action',
    },
  ]);

  // ----------------------- 表格 查询 ------------------------
  const keywords = ref(undefined);
  const Enabled = ref(null);

  const selectedRowKeyList = ref([]);
  const tableLoading = ref(false);
  const dictDataList = ref([]);
  const tableData = ref([]);

  function onSelectChange(selectedRowKeys) {
    selectedRowKeyList.value = selectedRowKeys;
  }

  function search() {
    tableData.value = dictDataList.value.filter((item) => {
      let keywordsFilterFlag = true;
      if (keywords.value) {
        keywordsFilterFlag =
          (item.DataValue &&_.includes(item.DataValue.toLowerCase(), keywords.value.toLowerCase())) ||
          (item.DataLabel && _.includes(item.DataLabel.toLowerCase(), keywords.value.toLowerCase())) ||
          (item.Remark && _.includes(item.Remark.toLowerCase(), keywords.value.toLowerCase()));
      }
      let disabledFilterFlag = _.isNull(Enabled.value) ? true : item.enabled === Enabled.value;
      return disabledFilterFlag && keywordsFilterFlag;
    });
  }

  function resetQuery() {
    keywords.value = null;
    Enabled.value = null;
    queryData();
  }

  async function queryData() {
    try {
      tableLoading.value = true;
      let responseData = await dictApi.queryDictData({
        dictId: dictId.value,
      });
     responseData.data.map((e) => {
        e.enabled = !e.Enabled;
        if (e.dataStyle) {
          e.color = DICT_DATA_STYLE_ENUM[e.dataStyle.toUpperCase()].color;
        }
      });
      dictDataList.value = responseData.data;
      search();
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      tableLoading.value = false;
    }
  }

  // ----------------------- 启用/禁用 ------------------------
  async function handleChangeDisabled(Enabled, dictData) {
    SmartLoading.show();
    try {
      await dictApi.updateDictDataDisabled(dictData.dictDataId);
      dictData.Enabled = !Enabled;
      message.success($t('dict.data.message.operationSuccess'));
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      SmartLoading.hide();
    }
  }

  // ----------------------- 批量 删除 ------------------------

  function confirmBatchDelete() {
    Modal.confirm({
      title: $t('dict.data.modal.delete.title'),
      content: $t('dict.data.modal.delete.content'),
      okText: $t('dict.data.modal.delete.ok'),
      okType: 'danger',
      onOk() {
        batchDelete();
      },
      cancelText: $t('dict.data.modal.delete.cancel'),
      onCancel() {},
    });
  }

  async function batchDelete() {
    try {
      SmartLoading.show();
      await dictApi.batchDeleteDictData(selectedRowKeyList.value);
      message.success($t('dict.data.message.deleteSuccess'));
      await queryData();
    } catch (e) {
      // smartSentry.captureError(e);
    } finally {
      SmartLoading.hide();
    }
  }

  // ----------------------- 弹窗表单操作 ------------------------

  const dictDataFormModalRef = ref();
  function addOrUpdateData(rowData) {
    dictDataFormModalRef.value.showModal(rowData, dictId.value, dictCode.value);
  }

  defineExpose({
    showModal,
  });
</script>
