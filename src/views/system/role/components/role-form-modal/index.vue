<template>
  <a-modal :title="form.roleId ? t('role.form.title.edit') : t('role.form.title.add')" :width="600" :open="modalVisible" @cancel="onClose" :footer="null">
    <a-form ref="formRef" :model="form" :rules="rules" :labelCol="{ span: 4 }">
      <a-form-item :label="t('role.form.label.name')" name="Name">
        <a-input style="width: 100%" :placeholder="t('role.form.placeholder.name')" v-model:value="form.Name" />
      </a-form-item>
      <a-form-item :label="t('role.form.label.remark')">
        <a-input style="width: 100%" :placeholder="t('role.form.placeholder.remark')" v-model:value="form.Description" />
      </a-form-item>
    </a-form>

    <div class="footer">
      <a-button style="margin-right: 8px" @click="onClose">{{ t('role.form.button.cancel') }}</a-button>
      <a-button type="primary" @click="submitForm">{{ t('role.form.button.submit') }}</a-button>
    </div>
  </a-modal>
</template>

<script setup>
  import { message } from 'ant-design-vue';
  import { reactive, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { roleApi } from '/@/api/system/role-api';
  import { smartSentry } from '/@/lib/smart-sentry';
  import { SmartLoading } from '/@/components/framework/smart-loading';

  // 获取 i18n 实例
  const { t } = useI18n();
  // ----------------------- 以下是字段定义 emits props ---------------------
  let emits = defineEmits(['refresh']);

  defineExpose({
    showModal,
  });

  // ----------------------- modal 显示与隐藏 ---------------------
  const modalVisible = ref(false);

  function showModal(role) {
    Object.assign(form, formDefault);
    if (role) {
      Object.assign(form, role);
    }
    modalVisible.value = true;
  }

  function onClose() {
    Object.assign(form, formDefault);
    modalVisible.value = false;
  }

  // ----------------------- 表单 ---------------------

  const formRef = ref();

  const formDefault = {
    roleId: undefined,
    Description: undefined,
    Name: undefined,
  };

  let form = reactive({ ...formDefault });

  // 表单规则
  const rules = {
    Name: [{ required: true, message: t('role.form.rules.name.required') }],
  };

  // 提交表单
  async function submitForm() {
    formRef.value
      .validate()
      .then(async () => {
        SmartLoading.show();
        try {
          if (form.Id) {
            await roleApi.updateRole(form);
          } else {
            await roleApi.addRole(form);
          }
          message.info(form.roleId ? t('role.form.message.editSuccess') : t('role.form.message.addSuccess'));
          emits('refresh');
          onClose();
        } catch (e) {
          smartSentry.captureError(e);
        } finally {
          SmartLoading.hide();
        }
      })
      .catch((error) => {
        message.error(t('role.form.message.validationError'));
      });
  }
</script>

<style scoped lang="less">
  .footer {
    width: 100%;
    border-top: 1px solid #e9e9e9;
    padding: 10px 16px;
    background: #fff;
    text-align: right;
    z-index: 1;
  }
</style>
