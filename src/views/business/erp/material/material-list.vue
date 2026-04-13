<!--
  * 物料码管理
-->
<template>
  <!---------- 查询表单form begin ----------->
  <a-form class="smart-query-form">
    <a-row class="smart-query-form-row" v-privilege="'goods:query'">
      <a-form-item label="物料名称" class="smart-query-form-item">
        <a-input @change="onSearch" style="width: 200px" v-model:value="queryForm.CategoryName" />
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
      <!-- 表格操作 -->
      <div class="smart-table-setting-block">
        <TableOperator v-model="columns" :tableId="TABLE_ID_CONST.BUSINESS.ERP.MATERIAL" :refresh="queryData" />
      </div>
    </a-row>
    <!---------- 表格操作行 end ----------->

    <!-- 物料码列表 -->
    <SmartTable
      :dataSource="tableData"
      :columns="columns"
      rowKey="MaterialCode"
      :total="total"
      :pageSizeOptions="PAGE_SIZE_OPTIONS"
      :queryForm="{
        currentPage: queryForm.CurrentPage,
        pageSize: queryForm.PageSize,
      }"
      @resizeColumn="handleResizeColumn"
      @pageChange="queryData"
    />

    <!-- 物料表单弹窗 -->
    <MaterialFormModal ref="formModal" @reloadList="queryData" />
  </a-card>
</template>
<script setup>
  import { onMounted, reactive, ref } from 'vue';
  import MaterialFormModal from './components/material-form-modal.vue'; //物料表单弹窗
  import { categoryApi } from '/@/api/business/category/category-api'; //物料类别接口
  import { PAGE_SIZE_OPTIONS } from '/@/constants/common-const'; //分页大小选项
  import TableOperator from '/@/components/support/table-operator/index.vue'; //表格操作组件
  import { TABLE_ID_CONST } from '/@/constants/support/table-id-const'; //表格ID常量
  import SmartTable from '/@/components/smartTable/smart-table.vue'; //表格组件
  import { buildFilterParams, FILTER_TYPE } from '/@/utils/smart-filter'; //查询参数构建器
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
    //查询入参
    CurrentPage: 1,
    PageSize: 10,
    OrderByType: 'Asc',
    OrderByFileds: 'CreateTime',
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
      //查询参数配置(就是filters的入参配置)
      CategoryName: FILTER_TYPE.CONTAINS,
    };
    try {
      // 使用 buildFilterParams 构建筛选参数
      const { filters, cleanQueryForm } = buildFilterParams(queryForm, filterConfig);
      // 将 filters 添加到查询参数中
      const requestParams = {
        ...cleanQueryForm,
        filters,
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
</script>
