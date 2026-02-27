<template>
  <div>
    <a-form class="smart-query-form">
      <a-row class="smart-query-form-row">
        <a-form-item label="参数类型" class="smart-query-form-item">
          <a-input style="width: 300px" v-model:value="queryForm.ParamType" placeholder="请输入参数类型" />
        </a-form-item>

        <a-form-item class="smart-query-form-item smart-margin-left10">
          <a-button-group>
            <a-button type="primary" @click="onSearch">
              <template #icon>
                <SearchOutlined />
              </template>
              查询
            </a-button>
            <a-button @click="resetQuery" v-privilege="'support:config:query'">
              <template #icon>
                <ReloadOutlined />
              </template>
              重置
            </a-button>
          </a-button-group>
          <a-button @click="toEditOrAdd()" v-privilege="'support:config:add'" type="primary" class="smart-margin-left20">
            <template #icon>
              <PlusOutlined />
            </template>
            新建
          </a-button>
        </a-form-item>
      </a-row>
    </a-form>

    <a-card size="small" :bordered="false" :hoverable="true">
      <a-row justify="end">
        <TableOperator class="smart-margin-bottom5" v-model="columns" :tableId="TABLE_ID_CONST.SUPPORT.CONFIG" :refresh="ajaxQuery" />
      </a-row>

      <a-table size="small" :loading="tableLoading" bordered :dataSource="tableData" :columns="columns" rowKey="ID" :pagination="false">
        <template #bodyCell="{ record, column }">
          <template v-if="column.dataIndex === 'action'">
            <div class="smart-table-operate">
              <a-button @click="toEditOrAdd(record)" v-privilege="'support:config:update'" type="link">编辑</a-button>
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
          v-model:current="queryForm.currentPage"
          v-model:pageSize="queryForm.pageSize"
          :total="total"
          @change="ajaxQuery"
          :show-total="(total) => `共${total}条`"
        />
      </div>
    </a-card>
    <ConfigFormModal ref="configFormModal" @reloadList="resetQuery" />
  </div>
</template>
<script setup>
  import { onMounted, reactive, ref } from 'vue';
  import { configApi } from '/@/api/support/config-api';
  import ConfigFormModal from './config-form-modal.vue';
  import { PAGE_SIZE_OPTIONS } from '/@/constants/common-const';
  import { smartSentry } from '/@/lib/smart-sentry';
  import TableOperator from '/@/components/support/table-operator/index.vue';
  import { TABLE_ID_CONST } from '/@/constants/support/table-id-const';
  import { buildFilterParams, FILTER_TYPE } from '/@/utils/smart-filter';

  const columns = ref([
    {
      title: '序号',
      width: 50,
      dataIndex: 'ParamIndex',
    },
    {
      title: '参数类型',
      dataIndex: 'ParamType',
      ellipsis: true,
    },
    {
      title: '参数值',
      dataIndex: 'ParamValue',
      ellipsis: true,
    },
    {
      title: '备注',
      dataIndex: 'Note',
      ellipsis: true,
      width: 150,
    },
    {
      title: '创建时间',
      dataIndex: 'CreateTime',
      width: 150,
    },
    {
      title: '修改时间',
      dataIndex: 'UpdateTime',
      width: 150,
    },

    {
      title: '操作',
      dataIndex: 'action',
      fixed: 'right',
      width: 60,
    },
  ]);

  // ---------------- 查询数据 -----------------------

  const queryFormState = {
    currentPage: 1,
    pageSize: 10,
    OrderByType: 1,
    OrderByFileds: "CreateTime",
    filters: []
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
    queryForm.currentPage = 1;
    ajaxQuery();
  }

  async function ajaxQuery() {
    const filterConfig = {
      ParamType: FILTER_TYPE.CONTAINS,
    };
    const { filters, cleanQueryForm } = buildFilterParams(queryForm, filterConfig);
    cleanQueryForm.filters = filters;
    try {
      tableLoading.value = true;
      let responseModel = await configApi.queryList(cleanQueryForm);
      const list = responseModel.data.list;
      total.value = responseModel.data.total;
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
