<!--
  * 目录 表单 弹窗
  * 
  * @Author:    1024创新实验室-主任：卓大 
  * @Date:      2022-08-21 19:52:43 
  * @Wechat:    zhuda1024 
  * @Email:     lab1024@163.com 
  * @Copyright  1024创新实验室 （ https://1024lab.net ），Since 2012 
-->
<template>
  <a-modal :open="visible" :title="form.CategoryCode ? '编辑' : '添加'" ok-text="确认" cancel-text="取消" @ok="onSubmit" @cancel="onClose">
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
      <a-form-item label="分类名称" name="CategoryName">
        <a-input v-model:value="form.CategoryName" placeholder="请输入分类名称" />
      </a-form-item>
      <a-form-item label="分类编码" name="CategoryCode">
        <a-input v-model:value="form.CategoryCode" placeholder="请输入分类编码" />
      </a-form-item>
       <a-form-item label="排序" name="OrderSort">
        <a-input v-model:value="form.OrderSort" placeholder="请输入排序" />
      </a-form-item>
       <a-form-item label="描述" name="Remark">
        <a-textarea :rows="2" v-model:value="form.Remark" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script setup>
  import { ref, reactive, nextTick } from 'vue';
  import { message } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import _ from 'lodash';
  import { categoryApi } from '/@/api/business/category/category-api';
  import { smartSentry } from '/@/lib/smart-sentry';

  // emit
  const emit = defineEmits(['reloadList']);

  //  组件
  const formRef = ref();

  // ------------------------------ 显示 、隐藏 ------------------------------

  // 是否展示抽屉
  const visible = ref(false);

  function showModal(parentId, rowData) {
    Object.assign(form, formDefault);
    form.Pid = parentId == 1 ? 0 : parentId;
    if (rowData && !_.isEmpty(rowData)) {
      Object.assign(form, rowData);
    }
    visible.value = true;
    nextTick(() => {
      // 解决弹窗错误信息显示,没有可忽略
      const domArr = document.getElementsByClassName('ant-modal');
      if (domArr && domArr.length > 0) {
        Array.from(domArr).forEach((item) => {
          if (item.childNodes && item.childNodes.length > 0) {
            Array.from(item.childNodes).forEach((child) => {
              if (child.setAttribute) {
                child.setAttribute('aria-hidden', 'false');
              }
            });
          }
        });
      }
    });
  }

  function onClose() {
    Object.assign(form, formDefault);
    visible.value = false;
  }

  // ------------------------------ 表单 ------------------------------

  const formDefault = {
    CategoryCode: undefined,
    CategoryName: '',
    OrderSort: 0,
    parentId: undefined,
  };
  let form = reactive({ ...formDefault });
  const rules = {
    CategoryName: [{ required: true, message: '请输入分类名称' }],
    CategoryCode: [{ required: true, message: '请输入分类编码' }],
  };

  function onSubmit() {
    formRef.value
      .validate()
      .then(async () => {
        SmartLoading.show();
        try {
          if (form.CategoryId) {
            await categoryApi.updateCategory(form);
          } else {
            await categoryApi.addCategory(form);
          }
          message.success(`${form.CategoryCode ? '修改' : '添加'}成功`);
          emit('reloadList', form.parentId);
          onClose();
        } catch (error) {
          smartSentry.captureError(error);
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
    showModal,
  });
</script>
