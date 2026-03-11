<!--
  * 商品列表
-->
<template>
  <!---------- 查询表单form begin ----------->
  <a-form class="smart-query-form">
    <a-row class="smart-query-form-row" v-privilege="'goods:query'">
      <a-form-item label="物料名称" class="smart-query-form-item">
        <a-input @change="onSearch" style="width: 200px" v-model:value="queryForm.CategoryName" placeholder="物料名称" />
      </a-form-item>

      <a-form-item class="smart-query-form-item">
        <a-button-group>
          <a-button type="primary" @click="onSearch" v-privilege="'goods:query'">
            <template #icon>
              <SearchOutlined />
            </template>
            查询
          </a-button>
          <a-button @click="resetQuery" v-privilege="'goods:query'">
            <template #icon>
              <ReloadOutlined />
            </template>
            重置
          </a-button>
        </a-button-group>
      </a-form-item>
    </a-row>
  </a-form>
  <!---------- 查询表单form end ----------->

  <a-card size="small" :bordered="false" :hoverable="true">
    <!---------- 表格操作行 begin ----------->
    <a-row class="smart-table-btn-block">
      <div class="smart-table-operate-block">
        <a-button @click="addGoods" type="primary" v-privilege="'goods:add'">
          <template #icon>
            <PlusOutlined />
          </template>
          生成编码
        </a-button>
      </div>
      <div class="smart-table-setting-block">
        <TableOperator v-model="columns" :tableId="TABLE_ID_CONST.BUSINESS.ERP.GOODS" :refresh="queryData" />
      </div>
    </a-row>
    <!---------- 表格操作行 end ----------->
    <a-table
      size="small"
      :dataSource="tableData"
      :columns="columns"
      rowKey="goodsId"
      :scroll="{ x: 1000, y: yHeight }"
      bordered
      :pagination="false"
      :showSorterTooltip="false"
      @resizeColumn="handleResizeColumn"
    >
    <template #bodyCell="{ text, record, column }">
      <template v-if="column.dataIndex === 'MaterialCode'">
        {{ text ? text : '' }}
        <SmartCopyIcon :value="record.MaterialCode" />
      </template>
    </template>
      <template #headerCell="{ column }">
        {{ column.title }}
      </template>
    </a-table>

    <div class="smart-query-table-page">
      <a-pagination
        showSizeChanger
        showQuickJumper
        show-less-items
        :PageSizeOptions="PAGE_SIZE_OPTIONS"
        :defaultPageSize="queryForm.PageSize"
        v-model:current="queryForm.CurrentPage"
        v-model:PageSize="queryForm.PageSize"
        :total="total"
        @change="queryData"
        :show-total="(total) => `共${total}条`"
      />
    </div>

    <MaterialFormModal ref="formModal" @reloadList="queryData" />
  </a-card>
</template>
<script setup>
  import MaterialFormModal from './components/material-form-modal.vue';
  import { onMounted, reactive, ref } from 'vue';
  import { message, Modal } from 'ant-design-vue';
  import { categoryApi } from '/@/api/business/category/category-api';
  import { PAGE_SIZE_OPTIONS } from '/@/constants/common-const';
  import TableOperator from '/@/components/support/table-operator/index.vue';
  import { TABLE_ID_CONST } from '/@/constants/support/table-id-const';
  import SmartCopyIcon from '/@/components/framework/smart-copy-icon/index.vue';
  import { buildFilterParams, FILTER_TYPE } from '/@/utils/smart-filter';
  import _ from 'lodash';

  // ---------------------------- 表格列 ----------------------------

  const columns = ref([
    {
      title: '物料类别名称',
      dataIndex: 'CategoryName',
      resizable: true,
      width: 150,
    },
    {
      title: '物料类别编码',
      dataIndex: 'CategoryCode',
      resizable: true,
      width: 150,
    },
    {
      title: '物料编码',
      dataIndex: 'MaterialCode',
      resizable: true,
      width: 150,
    },
    {
      title: '创建人',
      dataIndex: 'CreateName',
      resizable: true,
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'CreateTime',
      resizable: true,
      width: 150,
    },
  ]);

  // ---------------------------- 查询数据表单和方法 ----------------------------

  const queryFormState = {
    CurrentPage: 1,
    PageSize: 10,
    OrderByType: 'Asc',
    OrderByFileds:'CreateTime',
    CategoryName: undefined,
  };
  // 查询表单form
  const queryForm = reactive(_.cloneDeep(queryFormState));
  // 表格加载loading
  const tableLoading = ref(false);
  // 表格数据
  const tableData = ref([]);
  // 总数
  const total = ref(0);
  function handleResizeColumn(w, col) {
    columns.value.forEach((item) => {
      if (item.dataIndex === col.dataIndex) {
        item.width = Math.floor(w);
        // 拖动宽度标识
        item.dragAndDropFlag = true;
      }
    });
  }
  // 重置查询条件
  function resetQuery() {
    let PageSize = queryForm.PageSize;
    Object.assign(queryForm, _.cloneDeep(queryFormState));
    queryForm.PageSize = PageSize;
    queryData();
  }

  // 搜索
  function onSearch() {
    queryForm.CurrentPage = 1;
    queryData();
  }

 

  // 查询数据
  async function queryData() {
    tableLoading.value = true;
    const filterConfig = {
      CategoryName: FILTER_TYPE.CONTAINS
    };
    try {
      // 使用 buildFilterParams 构建筛选参数
      const { filters, cleanQueryForm } = buildFilterParams(queryForm, filterConfig);
      // 将 filters 添加到查询参数中
      const requestParams = {
        ...cleanQueryForm,
        filters
      };
      let queryResult = await categoryApi.GetMaterialRecordForPaged(requestParams);
      tableData.value = queryResult.Data;
      total.value = queryResult.TotalCount;
    } catch (e) {
      // smartSentry.captureError(e);
    } finally {
      tableLoading.value = false;
    }
  }
  onMounted(queryData);

  // ---------------------------- 添加/修改 ----------------------------
  const formModal = ref();

  function addGoods(goodsData) {
    formModal.value.showDrawer(goodsData);
  }

  // 动态设置表格高度
  const yHeight = ref(0);
  onMounted(() => {
    resetGetHeight();
  });
  function resetGetHeight() {
    // 搜索部分高度
    let doc = document.querySelector('.ant-form');
    // 按钮部分高度
    let btn = document.querySelector('.smart-table-btn-block');
    // 表格头高度
    let tableCell = document.querySelector('.ant-table-cell');
    // 分页高度
    let page = document.querySelector('.smart-query-table-page');
    // 内容区总高度
    let box = document.querySelector('.admin-content');
    setTimeout(() => {
      let dueHeight = doc.offsetHeight + 10 + 24 + btn.offsetHeight + 15 + tableCell.offsetHeight + page.offsetHeight + 20;
      yHeight.value = box.offsetHeight - dueHeight;
    }, 100);
  }
  window.addEventListener(
    'resize',
    _.throttle(() => {
      resetGetHeight();
    }, 1000)
  );
</script>
