<template>
  <div class="smart-table-container">
    <a-table
      size="small"
      :dataSource="dataSource"
      :columns="columns"
      :rowKey="rowKey"
      :scroll="scroll"
      bordered
      :pagination="false"
      :showSorterTooltip="false"
      @resizeColumn="handleResizeColumn"
    >
      <template #bodyCell="{ text, record, column }">
        <template v-if="column.dataIndex === 'action'">
          <slot name="action" :record="record" />
        </template>
        <template v-else-if="$slots.bodyCell">
          <slot name="bodyCell" :text="text" :record="record" :column="column" />
        </template>
      </template>
      <template #headerCell="{ column }">
        <slot name="headerCell" :column="column">
          {{ column.title }}
        </slot>
      </template>
    </a-table>

    <div class="smart-query-table-page">
      <a-pagination
        showSizeChanger
        showQuickJumper
        show-less-items
        :pageSizeOptions="pageSizeOptions"
        :defaultPageSize="queryForm.pageSize"
        v-model:current="queryForm.currentPage"
        v-model:pageSize="queryForm.pageSize"
        :total="total"
        @change="handlePageChange"
        :show-total="(total) => `共${total}条`"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import SmartCopyIcon from '/@/components/framework/smart-copy-icon/index.vue';

const props = defineProps({
  dataSource: {//表格数据
    type: Array,
    default: () => []
  },
  columns: {//表格列
    type: Array,
    default: () => []
  },
  rowKey: {//行键
    type: String,
    default: 'id'
  },
  scroll: {
    type: Object,
    default: () => ({ x: 1000, y: 400 })
  },
  total: {//总条数
    type: Number,
    default: 0
  },
  pageSizeOptions: {//分页大小选项
    type: Array,
    default: () => ['10', '20', '30', '40', '50']
  },
  queryForm: {//查询表单
    type: Object,
    default: () => ({
      currentPage: 1,
      pageSize: 10
    })
  }
});

const emit = defineEmits(['resizeColumn', 'pageChange']);

function handleResizeColumn(w, col) {
  emit('resizeColumn', w, col);
}

function handlePageChange() {//分页改变
  emit('pageChange');
}
</script>

<style scoped>
.smart-table-container {
  width: 100%;
}

.smart-query-table-page {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>