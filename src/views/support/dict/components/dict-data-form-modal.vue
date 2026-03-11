<template>
  <a-modal :open="visible" :title="form.DictDataId ? $t('dict.data.form.title.edit') : $t('dict.data.form.title.add')" :ok-text="$t('dict.data.form.button.ok')" :cancel-text="$t('dict.data.form.button.cancel')" @ok="onSubmit" @cancel="onClose">
    <br />
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" label-wrap>
      <a-form-item :label="$t('dict.data.form.label.label')" name="DataLabel">
        <a-input v-model:value="form.DataLabel" :placeholder="$t('dict.data.form.placeholder.label')" />
      </a-form-item>
      <a-form-item :label="$t('dict.data.form.label.value')" name="DataValue">
        <a-input v-model:value="form.DataValue" :placeholder="$t('dict.data.form.placeholder.value')" />
      </a-form-item>
      <a-form-item :label="$t('dict.data.form.label.style')">
        <a-select ref="dataStyleSelect" v-model:value="form.DataStyle" :allowClear="true">
          <template v-for="item in DICT_DATA_STYLE_ENUM" :key="item.value">
            <a-select-option :value="item.value">
              <div :style="{ color: token[item.color] }">{{ item.desc }}({{ item.value }})</div>
            </a-select-option>
          </template>
        </a-select>
      </a-form-item>
      <a-form-item :label="$t('dict.data.form.label.sort')" name="sort" :help="$t('dict.data.form.help.sort')">
        <a-input-number style="width: 100%" v-model:value="form.SortOrder" :min="0" :max="1000" />
      </a-form-item>
      <a-form-item :label="$t('dict.data.form.label.remark')" name="Remark">
        <a-textarea v-model:value="form.Remark" style="width: 100%; height: 100px; outline: none" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script setup>
  import { ref, reactive, getCurrentInstance } from 'vue';
  
  const { proxy } = getCurrentInstance();
  const $t = proxy.$t;
  import { message, theme } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { dictApi } from '/@/api/support/dict-api';
  import { smartSentry } from '/@/lib/smart-sentry';
  import { DICT_DATA_STYLE_ENUM } from '/@/constants/support/dict-const';

  const { useToken } = theme;
  const { token } = useToken();

  // emit
  const emit = defineEmits(['reloadList']);

  //  组件
  const formRef = ref();

  const formDefault = {
    DictId: undefined,
    DictCode: undefined,
    DictDataId: undefined,
    SortOrder: 0,
    DataValue: '',
    DataLabel: '',
    DataStyle: '',
    Remark: '',
  };
  let form = reactive({ ...formDefault });
  const rules = {
    DataValue: [{ required: true, message: () => $t('dict.data.form.rules.value.required') }],
    DataLabel: [{ required: true, message: () => $t('dict.data.form.rules.label.required') }],
    SortOrder: [{ required: true, message: () => $t('dict.data.form.rules.sort.required') }],
  };
  // 是否展示
  const visible = ref(false);

  function showModal(rowData, DictId, DictCode) {
    Object.assign(form, formDefault);
    if (rowData) {
      Object.assign(form, rowData);
    }
    form.DictId = DictId;
    form.DictCode = DictCode;
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
          if (form.DictDataId) {
            await dictApi.updateDictData(form);
          } else {
            await dictApi.addDictData(form);
          }
          message.success(form.DictDataId ? $t('dict.data.form.message.updateSuccess') : $t('dict.data.form.message.addSuccess'));
          emit('reloadList');
          onClose();
        } catch (error) {
          smartSentry.captureError(error);
        } finally {
          SmartLoading.hide();
        }
      })
      .catch((error) => {
        console.log('error', error);
        message.error($t('dict.data.form.message.validationError'));
      });
  }

  defineExpose({
    showModal,
  });
</script>
