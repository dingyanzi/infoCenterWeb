<!--
  * 系统设置 列表
  *
  * @Author:    1024创新实验室-主任：卓大
  * @Date:      2022-06-08 21:50:41
  * @Wechat:    zhuda1024
  * @Email:     lab1024@163.com
  * @Copyright  1024创新实验室 （ https://1024lab.net ），Since 2012
-->
<template>
  <div>
    <a-form class="smart-query-form">
      <a-row class="smart-query-form-row">
        <a-form-item :label="$t('config.list.query.label.key')" class="smart-query-form-item">
          <a-input @keyup.enter="onSearch" style="width: 300px" v-model:value="queryForm.ConfigKey" :placeholder="$t('config.list.query.placeholder.key')" />
        </a-form-item>

        <a-form-item class="smart-query-form-item smart-margin-left10">
          <a-button-group>
            <a-button type="primary" @click="onSearch" v-privilege="'support:config:query'">
              <template #icon>
                <SearchOutlined />
              </template>
              {{ $t('config.list.button.search') }}
            </a-button>
            <a-button @click="resetQuery" v-privilege="'support:config:query'">
              <template #icon>
                <ReloadOutlined />
              </template>
              {{ $t('config.list.button.reset') }}
            </a-button>
          </a-button-group>
          <a-button @click="toEditOrAdd()" v-privilege="'support:config:add'" type="primary" class="smart-margin-left20">
            <template #icon>
              <PlusOutlined />
            </template>
            {{ $t('config.list.button.add') }}
          </a-button>
        </a-form-item>
      </a-row>
    </a-form>

    <a-card size="small" :bordered="false" :hoverable="true">
      <a-row justify="end">
        <TableOperator class="smart-margin-bottom5" v-model="columns" :tableId="TABLE_ID_CONST.SUPPORT.CONFIG" :refresh="ajaxQuery" />
      </a-row>

      <a-table size="small" :loading="tableLoading" bordered :dataSource="tableData" :columns="columns" rowKey="ConfigId" :pagination="false">
        <template #bodyCell="{ record, column }">
          <template v-if="column.dataIndex === 'action'">
            <div class="smart-table-operate">
              <a-button @click="toEditOrAdd(record)" v-privilege="'support:config:update'" type="link">{{ $t('config.list.operate.edit') }}</a-button>
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
          :show-total="(total) => $t('config.list.pagination.total', { total })"
        />
      </div>
    </a-card>
    <ConfigFormModal ref="configFormModal" @reloadList="resetQuery" />
  </div>
</template>
<script setup>
  import { onMounted, reactive, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  
  const { t } = useI18n();
  import { configApi } from '/@/api/support/config-api';
  import ConfigFormModal from './config-form-modal.vue';
  import { PAGE_SIZE_OPTIONS } from '/@/constants/common-const';
  import { smartSentry } from '/@/lib/smart-sentry';
  import TableOperator from '/@/components/support/table-operator/index.vue';
  import { TABLE_ID_CONST } from '/@/constants/support/table-id-const';
  import { buildFilterParams, FILTER_TYPE } from '/@/utils/smart-filter';

  const columns = ref([
    {
      title: () => t('config.list.column.id'),
      width: 50,
      dataIndex: 'ConfigId',
    },
    {
      title: () => t('config.list.column.key'),
      dataIndex: 'ConfigKey',
      ellipsis: true,
    },
    {
      title: () => t('config.list.column.name'),
      dataIndex: 'ConfigName',
      ellipsis: true,
    },
    {
      title: () => t('config.list.column.value'),
      dataIndex: 'ConfigValue',
      ellipsis: true,
    },
    {
      title: () => t('config.list.column.remark'),
      dataIndex: 'Remark',
      ellipsis: true,
      width: 150,
    },
    {
      title: () => t('config.list.column.createTime'),
      dataIndex: 'CreateTime',
      width: 150,
    },
    {
      title: () => t('config.list.column.updateTime'),
      dataIndex: 'UpdateTime',
      width: 150,
    },

    {
      title: () => t('config.list.column.operate'),
      dataIndex: 'action',
      fixed: 'right',
      width: 60,
    },
  ]);

  // ---------------- 查询数据 -----------------------

  const queryFormState = {
    ConfigKey: '',
    CurrentPage: 1,
    pageSize: 10,
    OrderByType:'Asc',
    OrderByFileds:'ConfigKey'
  };
  const queryForm = reactive({ ...queryFormState });

  const tableLoading = ref(false);
  const tableData = ref([]);
  const total = ref(0);

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
      ConfigKey: FILTER_TYPE.EQUAL,
    };
    const { filters, cleanQueryForm } = buildFilterParams(queryForm, filterConfig);
    cleanQueryForm.filters = filters;
    try {
      tableLoading.value = true;
      let responseModel = await configApi.queryList(cleanQueryForm);
      console.log(responseModel);
      const list = responseModel.data.Data;
      total.value = responseModel.data.DataCount;
      tableData.value = list;
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      tableLoading.value = false;
    }
  }

  // ------------------------- 表单操作 弹窗 ------------------------------

  const configFormModal = ref();
  function toEditOrAdd(rowData) {
    configFormModal.value.showModal(rowData);
  }

  onMounted(ajaxQuery);
</script>