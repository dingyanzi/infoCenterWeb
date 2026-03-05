<template>
  <div>
    <div class="tree-header">
      <p>{{ t('role.tree.header') }}</p>
      <a-button v-if="selectRoleId" type="primary" @click="saveChange">{{ t('role.tree.button.save') }}</a-button>
    </div>
    <!-- 功能权限勾选部分 -->
    <RoleTreeCheckbox :tree="tree" />
  </div>
</template>
<script setup>
  import { inject, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { message } from 'ant-design-vue';
  import _ from 'lodash';
  import RoleTreeCheckbox from './role-tree-checkbox.vue';
  import { roleMenuApi } from '/@/api/system/role-menu-api';
  import { useRoleStore } from '/@/store/modules/system/role';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { smartSentry } from '/@/lib/smart-sentry';

  // 获取 i18n 实例
  const { t } = useI18n();

  let roleStore = useRoleStore();
  let tree = ref();
  let selectRoleId = inject('selectRoleId');

  watch(selectRoleId, () => getRoleSelectedMenu(), {
    immediate: true,
  });

  async function getRoleSelectedMenu() {
    if (!selectRoleId.value) {
      return;
    }
    let resAll = await roleMenuApi.getAllPermissionTree();
    let res = await roleMenuApi.getRoleSelectedMenu(selectRoleId.value);
    if (_.isEmpty(roleStore.treeMap)) {
      roleStore.initTreeMap(resAll.data || []);
    }
    roleStore.initCheckedData(res.data || []);
    tree.value = resAll.data;
  }
  async function saveChange() {
    let checkedData = roleStore.checkedData;
    if (_.isEmpty(checkedData)) {
      message.error(t('role.tree.message.noPermission'));
      return;
    }
    let params = {
      Id: selectRoleId.value,
      PermissionIds: checkedData,
    };
    SmartLoading.show();
    try {
      await roleMenuApi.updateRoleMenu(params);
      message.success(t('role.tree.message.saveSuccess'));
    } catch (error) {
    } finally {
      SmartLoading.hide();
    }
  }
</script>
<style scoped lang="less">
  @import 'index.less';
</style>
