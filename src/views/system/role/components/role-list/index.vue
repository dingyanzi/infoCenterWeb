<template>
  <a-card :title="t('role.list.title')" class="role-container" style="padding: 0">
    <template #extra>
      <a-button type="primary" size="small" @click="showRoleFormModal">{{ t('role.list.button.add') }}</a-button>
    </template>
    <a-menu mode="vertical" v-model:selectedKeys="selectedKeys">
      <a-menu-item v-for="item in roleList" :key="item.Id">
        <a-popover placement="right">
          <template #content>
            <div style="display: flex; flex-direction: column">
              <a-button type="text" @click="deleteRole(item.Id,item.Enabled)" >{{ item.Enabled ? t('role.list.operate.disable') : t('role.list.operate.enable') }}</a-button>
              <a-button type="text" @click="showRoleFormModal(item)" >{{ t('role.list.operate.edit') }}</a-button>
            </div>
          </template>
          {{ item.Name }} 
          <a-tag :color="item.Enabled ? 'green' : 'red'" size="small">{{ item.Enabled ? t('role.list.status.enabled') : t('role.list.status.disabled') }}</a-tag>
        </a-popover>
      </a-menu-item>
    </a-menu>
  </a-card>
  <RoleFormModal ref="roleFormModal" @refresh="queryAllRole" />
</template>
<script setup>
import { message, Modal } from 'ant-design-vue';
import _ from 'lodash';
import { computed, onMounted, ref ,createVNode} from 'vue';
import { useI18n } from 'vue-i18n';
import { roleApi } from '/@/api/system/role-api';
import { SmartLoading } from '/@/components/framework/smart-loading';
import RoleFormModal from '../role-form-modal/index.vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';

// 获取 i18n 实例
const { t } = useI18n();

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
function deleteRole(id,Enabled) {
  Modal.confirm({
    title: t('role.list.modal.title'),
    icon: createVNode(ExclamationCircleOutlined),
    content: Enabled ? t('role.list.modal.disable') : t('role.list.modal.enable'),
    okText: t('role.list.modal.ok'),
    okType: 'danger',
    async onOk() {
      SmartLoading.show();
      try {
        await roleApi.ModifyRoleUsable(`id=${id}&enable=${!Enabled}`);
        message.info(Enabled ? t('role.list.message.disableSuccess') : t('role.list.message.enableSuccess'));
        queryAllRole();
      } catch (e) {
      } finally {
        SmartLoading.hide();
      }
    },
    cancelText: t('role.list.modal.cancel'),
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
