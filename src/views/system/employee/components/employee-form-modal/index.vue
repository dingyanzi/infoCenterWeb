<!--
  *  员工 表单 弹窗
  *
  * @Author:    1024创新实验室-主任：卓大
  * @Date:      2022-08-08 20:46:18
  * @Wechat:    zhuda1024
  * @Email:     lab1024@163.com
  * @Copyright  1024创新实验室 （ https://1024lab.net ），Since 2012
-->
<template>
  <a-drawer :title="form.employeeId ? '编辑' : '添加'" :width="600" :open="visible" :body-style="{ paddingBottom: '80px' }"
    @close="onClose" destroyOnClose>
    <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
      <a-form-item label="用户名" name="LoginName">
        <a-input v-model:value.trim="form.LoginName" placeholder="请输入用户名" />
      </a-form-item>
      <a-form-item label="角色" name="roleIdList">
        <a-select mode="multiple" v-model:value="form.roleIdList" optionFilterProp="title" placeholder="请选择角色">
          <a-select-option v-for="item in roleList" :key="item.roleId" :title="item.roleName">{{ item.roleName
          }}</a-select-option>
        </a-select>
      </a-form-item>  
      <a-form-item label="备注" name="remark">
         <a-textarea :rows="2" v-model:value="form.Remark" placeholder="请输入备注" />
      </a-form-item>  
    </a-form>
    <div class="footer">
      <a-button style="margin-right: 8px" @click="onClose">取消</a-button>
      <a-button type="primary" style="margin-right: 8px" @click="onSubmit(false)">保存</a-button>
    </div>
  </a-drawer>
</template>
<script setup>
import { message } from 'ant-design-vue';
import _ from 'lodash';
import { nextTick, reactive, ref } from 'vue';
import { employeeApi } from '/@/api/system/employee-api';
import { roleApi } from '/@/api/system/role-api';
import { SmartLoading } from '/@/components/framework/smart-loading';
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
    { required: true, message: '用户名不能为空' },
    { max: 30, message: '登录账号不能大于30个字符', trigger: 'blur' },
  ],
  roleIdList: [{ required: true, message: '角色不能为空' }],
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
    message.error('参数验证错误，请仔细填写表单数据!');
    return;
  }
  SmartLoading.show();
  if (form.employeeId) {
    await updateEmployee(keepAdding);
  } else {
    await addEmployee(keepAdding);
  }
}

async function addEmployee(keepAdding) {
  try {
    let { data } = await employeeApi.addEmployee(form);
    message.success('添加成功');
    emit('show-account', form.loginName, data);
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
    message.success('更新成功');
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
