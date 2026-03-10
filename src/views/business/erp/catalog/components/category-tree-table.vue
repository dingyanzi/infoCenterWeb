<template>
  <a-card size="small" :bordered="false" :hoverable="true">
    <a-form class="smart-query-form">
      <a-row class="smart-query-form-row">
        <a-form-item label="关键词" class="smart-query-form-item">
          <a-input style="width: 200px" v-model:value="queryForm.categoryName" placeholder="请输入物料名称或物料编码" />
        </a-form-item>
        <a-form-item class="smart-query-form-item smart-margin-left10">
          <a-button type="primary" @click="queryList">
            <template #icon>
              <SearchOutlined />
            </template>
            查询
          </a-button>
          <a-button @click="resetQuery" class="smart-margin-left10">
            <template #icon>
              <ReloadOutlined />
            </template>
            重置
          </a-button>
        </a-form-item>
      </a-row>
    </a-form>
    <a-row class="smart-table-btn-block">
      <div class="smart-table-operate-block">
        <a-button @click="addCategory()" type="primary" v-privilege="`category:add`">
          <template #icon>
            <PlusOutlined />
          </template>
          新建
        </a-button>
      </div>
      <div class="smart-table-setting-block"></div>
    </a-row>

    <a-table
      :scroll="{ x: 1000 }"
      size="small"
      :dataSource="tableData"
      :columns="columns"
      rowKey="value"
      bordered
      :pagination="false"
      @expandedRowsChange="changeExand"
      :expanded-row-keys="expandedRowKeys"
    >
      <template #bodyCell="{ record, column }">
        <template v-if="column.dataIndex === 'action'">
          <div class="smart-table-operate">
            <a-button @click="addCategory(record.value)" type="link" v-privilege="`category:addChild`">增加子分类</a-button>
            <a-button @click="addCategory(undefined, record)" type="link" v-privilege="`category:update`">编辑</a-button>
            <a-button @click="confirmDeleteCategory(record.value)" danger type="link" v-privilege="`category:delete`"
              >删除</a-button
            >
          </div>
        </template>
      </template>
    </a-table>
    <CategoryFormModal ref="formModal" @reloadList="reloadList" />
  </a-card>
</template>
<script setup>
  import { computed, onMounted, reactive, ref } from 'vue';
  import { message, Modal } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import CategoryFormModal from './category-form-modal.vue';
  import { categoryApi } from '/@/api/business/category/category-api';
  import { CATEGORY_TYPE_ENUM } from '/@/constants/business/erp/category-const';
  import { smartSentry } from '/@/lib/smart-sentry';

  // const columnNameList = [
  //   {
  //     categoryType: CATEGORY_TYPE_ENUM.GOODS.value,
  //     columnName: '物料分类',
  //   },
  // ];



  // ------------------------------ 查询 ------------------------------
  const tableLoading = ref(false);
  const tableData = ref([]);
  const queryForm = reactive({
    categoryName: '',
  });
  const columns = reactive([
    {
      title: '物料分类',
      dataIndex: 'label',
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 200,
    },
  ]);

  async function queryList() {
    try {
      tableLoading.value = true;
      let responseModel = await categoryApi.queryCategoryTree(queryForm);
      tableData.value = responseModel.data;
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      tableLoading.value = false;
    }
  }

  function resetQuery() {
    queryForm.categoryName = '';
    queryList();
  }

  const expandedRowKeys = ref([]);
  function reloadList(parentId) {
    queryList();
    if (parentId) {
      expandedRowKeys.value.push(parentId);
    }
  }

  onMounted(queryList);
  defineExpose({
    queryList,
  });

  function changeExand(val) {
    expandedRowKeys.value = val;
  }

  // ------------------------------ 添加 ------------------------------

  const formModal = ref();
  function addCategory(parentId, rowData) {
    formModal.value.showModal( parentId, rowData);
    // formModal.value.showModal(props.categoryType, parentId, rowData);

  }

  // ------------------------------ 删除 ------------------------------

  function confirmDeleteCategory(categoryId) {
    Modal.confirm({
      title: '提示',
      content: '确定要删除当前分类吗?',
      okText: '确定',
      okType: 'danger',
      async onOk() {
        deleteCategory(categoryId);
      },
      cancelText: '取消',
      onCancel() {},
    });
  }
  async function deleteCategory(categoryId) {
    try {
      SmartLoading.show();
      await categoryApi.deleteCategoryById({id: categoryId});
      message.success('删除成功');
      queryList();
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      SmartLoading.hide();
    }
  }
</script>
