<template>
  <a-modal :open="visible" :title="form.DictDataId ? '编辑字典值' : '添加字典值'" ok-text="确认" cancel-text="取消" @ok="onSubmit" @cancel="onClose">
    <br />
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }">
      <a-form-item label="字典项名称" name="DataLabel">
        <a-input v-model:value="form.DataLabel" placeholder="请输入 字典项名称" />
      </a-form-item>
      <a-form-item label="字典项值" name="DataValue">
        <a-input v-model:value="form.DataValue" placeholder="请输入 字典项值" />
      </a-form-item>
      <a-form-item label="显示样式">
        <a-select ref="dataStyleSelect" v-model:value="form.DataStyle" :allowClear="true">
          <template v-for="item in DICT_DATA_STYLE_ENUM" :key="item.value">
            <a-select-option :value="item.value">
              <div :style="{ color: token[item.color] }">{{ item.desc }}({{ item.value }})</div>
            </a-select-option>
          </template>
        </a-select>
      </a-form-item>
      <a-form-item label="排序" name="sort" help="值越大越靠前">
        <a-input-number style="width: 100%" v-model:value="form.SortOrder" :min="0" :max="1000" />
      </a-form-item>
      <a-form-item label="备注" name="Remark">
        <a-textarea v-model:value="form.Remark" style="width: 100%; height: 100px; outline: none" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script setup>
  import { ref, reactive } from 'vue';
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
    DataValue: [{ required: true, message: '请输入 字典项值' }],
    DataLabel: [{ required: true, message: '请输入 字典项名称' }],
    SortOrder: [{ required: true, message: '请输入排序' }],
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
          message.success(`${form.DictDataId ? '修改' : '添加'}成功`);
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
        message.error('参数验证错误，请仔细填写表单数据!');
      });
  }

  defineExpose({
    showModal,
  });
</script>
