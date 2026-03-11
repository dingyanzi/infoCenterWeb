<template>
  <a-modal :open="visible" :title="form.DictId ? $t('dict.form.title.edit') : $t('dict.form.title.add')" :ok-text="$t('dict.form.button.ok')" :cancel-text="$t('dict.form.button.cancel')" @ok="onSubmit" @cancel="onClose">
    <br />
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" label-wrap>
      <a-form-item :label="$t('dict.form.label.code')" name="DictCode">
        <a-input v-model:value="form.DictCode" :placeholder="$t('dict.form.placeholder.code')" />
      </a-form-item>
      <a-form-item :label="$t('dict.form.label.name')" name="DictName">
        <a-input v-model:value="form.DictName" :placeholder="$t('dict.form.placeholder.name')" />
      </a-form-item>

      <a-form-item :label="$t('dict.form.label.remark')" name="Remark">
        <a-textarea v-model:value="form.Remark" style="width: 100%; height: 100px; outline: none" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script setup>
  import { ref, reactive, getCurrentInstance } from 'vue';
  
  const { proxy } = getCurrentInstance();
  const $t = proxy.$t;
  import { message } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { dictApi } from '/@/api/support/dict-api';
  import { smartSentry } from '/@/lib/smart-sentry';

  // emit
  const emit = defineEmits(['reloadList']);

  //  组件
  const formRef = ref();

  const formDefault = {
    DictId: undefined,
    DictCode: '',
    DictName: '',
    Remark: '',
  };
  let form = reactive({ ...formDefault });
  const rules = {
    DictCode: [{ required: true, message: () => $t('dict.form.rules.code.required') }],
    DictName: [{ required: true, message: () => $t('dict.form.rules.name.required') }],
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
    formRef.value.resetFields();
  }

  function onSubmit() {
    formRef.value
      .validate()
      .then(async () => {
        SmartLoading.show();
        try {
          if (form.DictId) {
            await dictApi.updateDict(form);
          } else {
            await dictApi.addDict(form);
          }
          message.success(form.DictId ? $t('dict.form.message.updateSuccess') : $t('dict.form.message.addSuccess'));
          emit('reloadList');
          onClose();
        } catch (error) {
          smartSentry.captureError(error);
        } finally {
          SmartLoading.hide();
        }
      })
      .catch((error) => {
        message.error($t('dict.form.message.validationError'));
      });
  }

  // ----------------------- 以下是暴露的方法内容 ------------------------
  defineExpose({
    showModal,
  });
</script>
