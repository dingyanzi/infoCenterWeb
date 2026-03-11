<!--
  *  目录 树形选择组件
-->
<template>
  <a-tree-select
    v-model:value="selectValue"
    :style="`width:${width}`"
    :dropdown-style="{ maxHeight: '400px', overflowX: 'auto' }"
    :tree-data="categoryTreeData"
    :placeholder="placeholder"
    :allowClear="true"
    tree-default-expand-all
    show-search
    :filterTreeNode="filterTreeNode"
    @change="onChange"
  />
</template>

<script setup>
  import { ref, watch, onMounted } from 'vue';
  import { categoryApi } from '/@/api/business/category/category-api';
  import { smartSentry } from '/@/lib/smart-sentry';

  const props = defineProps({
    value: Number,
    placeholder: {
      type: String,
      default: '请选择',
    },
    width: {
      type: String,
      default: '100%',
    },
  });

  const emit = defineEmits(['update:value', 'change']);

  // -----------------  查询 目录 数据 -----------------
  const categoryTreeData = ref([]);
  async function queryCategoryTree() {
    try {
      let param = {
        categoryName:'',
      };
      let resp = await categoryApi.queryCategoryTree(param);
      categoryTreeData.value = resp.data;
      console.log('categoryTreeData:', categoryTreeData.value);
    } catch (e) {
      smartSentry.captureError(e);
    }
  }

  // -----------------  选中相关监听、事件 -----------------
  const selectValue = ref(props.value);
  // 箭头value变化
  watch(
    () => props.value,
    (newValue) => {
      selectValue.value = newValue;
    }
  );


  function onChange(value) {
    emit('update:value', value);
    emit('change', value);
  }

  // 自定义搜索方法，基于 categoryName 字段
  function filterTreeNode(value, node) {
    if (!value) return true;
    const nodeText = node.label || '';
    const matchResult = nodeText.includes(value);
    return matchResult;
  }

  onMounted(queryCategoryTree);
</script>
