<!--
  * 角色 列表
  *
  * @Author:    1024创新实验室-主任：卓大
  * @Date:      2022-09-12 22:34:00
  * @Wechat:    zhuda1024
  * @Email:     lab1024@163.com
  * @Copyright  1024创新实验室 （ https://1024lab.net ），Since 2012
  *
-->
<template>
  <a-card title="角色列表" class="role-container" style="padding: 0">
    <template #extra>
      <a-button type="primary" size="small" @click="showRoleFormModal">添加</a-button>
    </template>
    <a-menu mode="vertical" v-model:selectedKeys="selectedKeys">
      <a-menu-item v-for="item in roleList" :key="item.roleId">
        <a-popover placement="right">
          <template #content>
            <div style="display: flex; flex-direction: column">
              <a-button type="text" @click="deleteRole(item.roleId)" >删除</a-button>
              <a-button type="text" @click="showRoleFormModal(item)" >编辑</a-button>
            </div>
          </template>
          {{ item.Name }}
        </a-popover>
      </a-menu-item>
    </a-menu>
  </a-card>
  <RoleFormModal ref="roleFormModal" @refresh="queryAllRole" />
</template>
<script setup>
import { message, Modal } from 'ant-design-vue';
import _ from 'lodash';
import { computed, onMounted, ref } from 'vue';
import { roleApi } from '/@/api/system/role-api';
import { SmartLoading } from '/@/components/framework/smart-loading';
import RoleFormModal from '../role-form-modal/index.vue';
import { smartSentry } from '/@/lib/smart-sentry';

// ----------------------- 角色列表显示 ---------------------
const roleList = ref([]);
let defaultParams = {
  OrderByFileds: 'Id',
  CurrentPage: 1,
  OrderByType: 1,
  pageSize: 999,
  filters:[]
};
onMounted(queryAllRole);

// 查询列表
async function queryAllRole() {

  let res = await roleApi.queryAll(defaultParams);
  roleList.value = res.data.Data;
  if (!_.isEmpty(res.data) && res.data.Data[0].Id) {
    selectedKeys.value = [res.data.Data[0].Id];
  }
}

let selectedKeys = ref([]);
const selectRoleId = computed(() => {
  if (!selectedKeys.value && _.isEmpty(selectedKeys.value)) {
    return null;
  }
  return selectedKeys.value[0];
});
// ----------------------- 添加、修改、删除 ---------------------------------
const roleFormModal = ref();

// 显示表单框
function showRoleFormModal(role) {
  roleFormModal.value.showModal(role);
}

// 删除角色
function deleteRole(roleId) {
  if (!roleId) {
    return;
  }
  Modal.confirm({
    title: '提示',
    content: '确定要删除该角色么？',
    okText: '确定',
    okType: 'danger',
    async onOk() {
      SmartLoading.show();
      try {
        await roleApi.deleteRole(roleId);
        message.info('删除成功');
        queryAllRole();
      } catch (e) {
        smartSentry.captureError(e);
      } finally {
        SmartLoading.hide();
      }
    },
    cancelText: '取消',
    onCancel() { },
  });
}

// ----------------------- 以下是暴露的方法内容 ----------------------------
defineExpose({
  selectRoleId,
});
</script>
<style scoped lang="less">
.role-container {
  height: 100%;
  overflow-y: auto;

  :deep(.ant-card-body) {
    padding: 5px;
  }
}

.ant-menu-inline,
.ant-menu-vertical,
.ant-menu-vertical-left {
  border-right: none;
}
</style>
