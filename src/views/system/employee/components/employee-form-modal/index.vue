<template>
  <a-drawer :title="form.employeeId ? t('employee.form.title.edit') : t('employee.form.title.add')" :width="600" :open="visible" :body-style="{ paddingBottom: '80px' }"
    @close="onClose" destroyOnClose>
    <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
      <a-form-item :label="t('employee.form.label.username')" name="LoginName">
        <a-input v-model:value.trim="form.LoginName" :placeholder="t('employee.form.placeholder.username')" />
      </a-form-item>
      <a-form-item :label="t('employee.form.label.role')" name="RoleIds">
        <a-select mode="multiple" v-model:value="form.RoleIds" optionFilterProp="title" :placeholder="t('employee.form.placeholder.role')">
          <a-select-option v-for="item in roleList" :key="item.Id" :title="item.Name">{{ item.Name
          }}</a-select-option>
        </a-select>
      </a-form-item>  
      <a-form-item :label="t('employee.form.label.remark')" name="remark">
         <a-textarea :rows="2" v-model:value="form.Remark" :placeholder="t('employee.form.placeholder.remark')" />
      </a-form-item>  
    </a-form>
    <div class="footer">
      <a-button style="margin-right: 8px" @click="onClose">{{ t('employee.form.button.cancel') }}</a-button>
      <a-button type="primary" style="margin-right: 8px" @click="onSubmit(false)">{{ t('employee.form.button.save') }}</a-button>
    </div>
  </a-drawer>
</template>
<script setup>
import { message } from 'ant-design-vue';
import _ from 'lodash';
import { nextTick, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { employeeApi } from '/@/api/system/employee-api';
import { roleApi } from '/@/api/system/role-api';
import { SmartLoading } from '/@/components/framework/smart-loading';

// 获取 i18n 实例
const { t } = useI18n();
// ----------------------- 以下是字段定义 emits props ---------------------
// emit
const emit = defineEmits(['refresh', 'show-account']);

// ----------------------- 显示/隐藏 ---------------------

const visible = ref(false); // 是否展示抽屉
// 隐藏
function onClose() {
  reset();
  visible.value = false;
}
// 显示
async function showDrawer(rowData) {
  Object.assign(form, formDefault);
  form.RoleIds = rowData.RIDs;

  if (rowData && !_.isEmpty(rowData)) {
    Object.assign(form, rowData);
  }
  visible.value = true;
  nextTick(() => {
    queryAllRole();
  });
}

// ----------------------- 表单显示 ---------------------

const roleList = ref([]); //角色列表
async function queryAllRole() {
  let res = await roleApi.getRoleList();
  roleList.value = res.data;
}

const formRef = ref(); // 组件ref
const formDefault = {
  LoginName: undefined,
  RoleNames: undefined,
};

let form = reactive(_.cloneDeep(formDefault));
function reset() {
  Object.assign(form, formDefault);
  formRef.value.resetFields();
}

// ----------------------- 表单提交 ---------------------
// 表单规则
const rules = {
  LoginName: [
    { required: true, message: t('employee.form.rules.username.required') },
    { max: 30, message: t('employee.form.rules.username.max'), trigger: 'blur' },
  ],
  RoleIds: [{ required: true, message: t('employee.form.rules.role.required') }],
};

// 校验表单
function validateForm(formRef) {
  return new Promise((resolve) => {
    formRef
      .validate()
      .then(() => {
        resolve(true);
      })
      .catch(() => {
        resolve(false);
      });
  });
}

// 提交数据
async function onSubmit(keepAdding) {
  let validateFormRes = await validateForm(formRef.value);
  if (!validateFormRes) {
    message.error(t('employee.form.message.validationError'));
    return;
  }
  SmartLoading.show();
  if (form.Id) {
    await updateEmployee(keepAdding);
  } else {
    await addEmployee(keepAdding);
  }
}

async function addEmployee(keepAdding) {
  try {
    let { data } = await employeeApi.addEmployee(form);
    if(data==null){
      return
    }
    message.success(t('employee.form.message.addSuccess'));
    emit('show-account', form.LoginName, data);
    if (keepAdding) {
      reset();
    } else {
      onClose();
    }
    emit('refresh');
  } catch (error) {
  } finally {
    SmartLoading.hide();
  }
}
async function updateEmployee(keepAdding) {
  try {
    let result = await employeeApi.updateEmployee(form);
    message.success(t('employee.form.message.updateSuccess'));
    if (keepAdding) {
      reset();
    } else {
      onClose();
    }
    emit('refresh');
  } catch (error) {
  } finally {
    SmartLoading.hide();
  }
}

// ----------------------- 以下是暴露的方法内容 ----------------------------
defineExpose({
  showDrawer,
});
</script>
<style scoped lang="less">
.footer {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 100%;
  border-top: 1px solid #e9e9e9;
  padding: 10px 16px;
  background: #fff;
  text-align: right;
  z-index: 1;
}

.hint {
  margin-top: 5px;
  color: #bfbfbf;
}
</style>
