<!--
  * 生成编码表单
-->
<template>
  <a-modal title="生成编码" :width="500" :open="visible" @cancel="onClose">
    <template #footer>
      <a-button @click="onClose">关闭</a-button>
    </template>
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }">
      <a-form-item label="物料分类" name="categoryId" style="margin-top: 20px;">
        <a-row :gutter="8">
          <a-col :span="16">
            <CategoryTree v-model:value="form.categoryId" placeholder="请选择物料分类" />
          </a-col>
          <a-col :span="8">
            <a-button type="primary" @click="onSubmit">生成</a-button>
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item v-if="form.categoryCode" label="物料编码" name="categoryCode">
        <a-row :gutter="8" style="align-items: center;">
          <a-col :span="16">
            <a-input style="width: 100%" placeholder="物料编码" v-model:value="form.categoryCode" />
          </a-col>
          <a-col :span="2" style="text-align: right;">
            <SmartCopyIcon :value="form.categoryCode" />
          </a-col>
        </a-row>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script setup>
  import { ref, nextTick, reactive } from 'vue';
  import CategoryTree from '/@/components/business/category-tree-select/index.vue';
  import SmartCopyIcon from '/@/components/framework/smart-copy-icon/index.vue';
  import { CATEGORY_TYPE_ENUM } from '/@/constants/business/erp/category-const';
  import { message } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import _ from 'lodash';
  import { goodsApi } from '/@/api/business/goods/goods-api';
  import { categoryApi } from '/@/api/business/category/category-api';
  import { smartSentry } from '/@/lib/smart-sentry';

  // emit
  const emit = defineEmits(['reloadList']);

  // 组件ref
  const formRef = ref();

  const formDefault = {
    //商品分类
    categoryId: undefined,
    //物料分类编码
    categoryCode: '',
  };
  let form = reactive({ ...formDefault });
  const rules = {
    categoryId: [{ required: true, message: '请选择物料分类' }],
  };
  // 是否展示抽屉
  const visible = ref(false);

  function showDrawer(rowData) {
    Object.assign(form, formDefault);
    if (rowData && !_.isEmpty(rowData)) {
      Object.assign(form, rowData);
    }
    visible.value = true;
    nextTick(() => {
      formRef.value.clearValidate();
    });
  }

  function onClose() {
    Object.assign(form, formDefault);
    visible.value = false;
    emit('reloadList');
  }

  function onSubmit() {
    formRef.value
      .validate()
      .then(async () => {
        SmartLoading.show();
        try {
          const response = await categoryApi.GenerateMaterialCode({
            categoryId: form.categoryId
          });
          form.categoryCode = response.data;
          message.success('生成编码成功');
        } catch (error) {
          smartSentry.captureError(error);
          message.error('生成编码失败');
        } finally {
          SmartLoading.hide();
        }
      })
      .catch((error) => {
        console.log('error', error);
        message.error('参数验证错误，请仔细填写表单数据!');
      });
  }

  defineExpose({
    showDrawer,
  });
</script>
