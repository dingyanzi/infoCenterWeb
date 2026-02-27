<template>
  <a-modal :open="visible" :title="form.ID ? '编辑' : '添加'" ok-text="确认" cancel-text="取消" @ok="onSubmit" @cancel="onClose">
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }">
      <a-form-item label="序号" name="ParamIndex">
        <a-input v-model:value="form.ParamIndex" placeholder="请输入序号" />
      </a-form-item>
      <a-form-item label="参数类型" name="ParamType">
        <a-input v-model:value="form.ParamType" placeholder="请输入参数类型" />
      </a-form-item>
      <a-form-item label="参数值" name="ParamValue">
        <a-input v-model:value="form.ParamValue" placeholder="请输入参数值" />
      </a-form-item>
      <a-form-item label="备注" name="Note">
        <textarea v-model="form.Note" style="width: 100%; height: 100px; outline: none"></textarea>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script setup>
  import { message } from 'ant-design-vue';
  import { reactive, ref } from 'vue';
  import { configApi } from '/@/api/support/config-api';
  import { SmartLoading } from '/@/components/framework/smart-loading';

  // emit
  const emit = defineEmits(['reloadList']);

  //  组件
  const formRef = ref();

  const formDefault = {
    ID: undefined,
    ParamIndex: '',
    ParamType: '',
    ParamValue: '',
    Note: '',
  };
  let form = reactive({ ...formDefault });
  const rules = {
    ParamIndex: [{ required: true, message: '请输入序号' }],
    ParamType: [{ required: true, message: '请输入参数类型' }],
    ParamValue: [{ required: true, message: '请输入参数值' }],
  };
  // 是否展示
  const visible = ref(false);

  function showModal(rowData) {
    Object.assign(form, formDefault);
    if (rowData) {
      Object.assign(form, rowData);
    }
    visible.value = true;
  }

  function onClose() {
    Object.assign(form, formDefault);
    visible.value = false;
  }

  function onSubmit() {
    formRef.value
      .validate()
      .then(async () => {
        SmartLoading.show();
        try {
          if (form.ID) {
            await configApi.updateConfig(form);
          } else {
            await configApi.addConfig(form);
          }
          message.success(`${form.ID ? '修改' : '添加'}成功`);
          emit('reloadList');
          onClose();
        } catch (error) {
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
