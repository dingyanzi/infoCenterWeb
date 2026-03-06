<template>
  <a-card class="role-container">
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="1" :tab="$t('role.setting.tab.permission')">
        <RoleTree />
      </a-tab-pane>
      <!-- <a-tab-pane key="2" :tab="$t('role.setting.tab.dataScope')">
        <RoleDataScope />
      </a-tab-pane>
      <a-tab-pane key="3" :tab="$t('role.setting.tab.employeeList')">
        <RoleEmployeeList />
      </a-tab-pane> -->
    </a-tabs>
  </a-card>
</template>
<script setup>
  import { ref } from 'vue';
  import RoleDataScope from '../role-data-scope/index.vue';
  import RoleEmployeeList from '../role-employee-list/index.vue';
  import RoleTree from '../role-tree/index.vue';

  defineProps({
    value: Number,
  });

  defineEmits(['update:value']);

  let activeKey = ref();
</script>
