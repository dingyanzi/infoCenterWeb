<template>

  <a-drawer :body-style="{ paddingBottom: '80px' }" :maskClosable="true" :title="form.Id ? '编辑' : '添加'" :open="visible"
    :width="600" @close="onClose" destroyOnClose>
    <a-form ref="formRef" :labelCol="{ span: 5 }" :labelWrap="true" :model="form" :rules="rules">
      <!-- <a-form-item :label="form.menuType === MENU_TYPE_ENUM.CATALOG.value ? '上级目录' : '上级菜单'">
        <MenuTreeSelect ref="parentMenuTreeSelect" v-model:value="form.parentId" />
      </a-form-item> -->
      <!--      目录 菜单 start   -->
      <a-form-item label="菜单名称" name="Name">
        <a-input v-model:value="form.Name" placeholder="请输入菜单名称" />
      </a-form-item>
      <a-form-item label="菜单图标" name="Icon">
        <IconSelect @updateIcon="selectIcon">
          <template #iconSelect>
            <a-input v-model:value="form.Icon" placeholder="请输入菜单图标" style="width: 200px" />
            <component :is="$antIcons[form.Icon]" class="smart-margin-left15" style="font-size: 20px" />
          </template>
        </IconSelect>
      </a-form-item>

      <a-form-item v-if="form.menuType === MENU_TYPE_ENUM.MENU.value" label="组件地址" name="Code">
        <a-input v-model:value="form.Code" placeholder="请输入组件地址 默认带有开头/@/views" />
      </a-form-item>

      <!--      目录 菜单 end   -->
      <a-form-item label="排序" name="OrderSort" help="值越小越靠前">
        <a-input-number v-model:value="form.OrderSort" :min="0" placeholder="请输入排序" style="width: 100px" />
      </a-form-item>
      <a-form-item v-if="form.menuType === MENU_TYPE_ENUM.MENU.value" label="按钮" name="Btns">
        <a-checkbox-group v-model:value="form.Btns">
          <a-row>
            <a-col :span="6" v-for="item in BtnsOptions" :key="item.value">
              <a-checkbox :value="item.value">{{ item.label }}</a-checkbox>
            </a-col>
          </a-row>
        </a-checkbox-group>
      </a-form-item>
      <a-form-item label="描述" name="Description">
        <a-textarea :rows="2" v-model:value="form.Description" placeholder="请输入描述" />
      </a-form-item>
    </a-form>
    <div class="footer">
      <a-button style="margin-right: 8px" @click="onClose">取消</a-button>
      <a-button style="margin-right: 8px" type="primary" @click="onSubmit()">提交 </a-button>
    </div>
  </a-drawer>
</template>
<script setup>
import { message } from 'ant-design-vue';
import _ from 'lodash';
import { nextTick, reactive, ref, computed } from 'vue';
// import MenuTreeSelect from './menu-tree-select.vue';
import { menuApi } from '/@/api/system/menu-api';
import IconSelect from '/@/components/framework/icon-select/index.vue';
import { MENU_DEFAULT_PARENT_ID, MENU_PERMS_TYPE_ENUM, MENU_TYPE_ENUM } from '/@/constants/system/menu-const';
import { smartSentry } from '/@/lib/smart-sentry';
import { SmartLoading } from '/@/components/framework/smart-loading';

// ----------------------- 以下是字段定义 emits props ------------------------
// emit
const emit = defineEmits(['reloadList']);

// ----------------------- 展开、隐藏编辑窗口 ------------------------

// 是否展示抽屉
const visible = ref(false);

const contextMenuTreeSelect = ref();
// const parentMenuTreeSelect = ref();
const BtnsOptions = ref([]);//按钮集合
//展开编辑窗口
async function showDrawer(rowData) {
  Object.assign(form, formDefault);
  if (rowData && !_.isEmpty(rowData)) {
    form.menuType = rowData.menuType
    form.Name = rowData.menuName;
    form.Icon = rowData.icon
    form.OrderSort = rowData.sort
    form.Id = rowData.menuId
    form.Pid = rowData.parentId
    form.Description = rowData.Description
    if (form.menuType == 2) {//菜单调取查询接口
      form.Code = rowData.component
      let res = await menuApi.getEnumTypeList({ enumName: 'BtnPermissionEnum' });
      BtnsOptions.value = res.data.map(item => ({ label: item.Description, value: item.Value }));
      //获取当前菜单已拥有的按钮
      let confirmBtnList = await menuApi.getSelectBtnListByPid({ Pid: form.Id });
      form.Btns = confirmBtnList ? confirmBtnList.data : [];
    }
    if (form.Pid === MENU_DEFAULT_PARENT_ID) {
      form.Pid = 0;
    }
  }
  visible.value = true;
  refreshParentAndContext();
}

function refreshParentAndContext() {
  nextTick(() => {
    if (contextMenuTreeSelect.value) {
      contextMenuTreeSelect.value.queryMenuTree();
    }
    // if (parentMenuTreeSelect.value) {
    //   parentMenuTreeSelect.value.queryMenuTree();
    // }
  });
}

// 隐藏窗口
function onClose() {
  Object.assign(form, formDefault);
  formRef.value.resetFields();
  visible.value = false;
}

// ----------------------- form表单相关操作 ------------------------

const formRef = ref();
const formDefault = {
  Id: undefined,//菜单ID
  Name: undefined,//菜单名称
  menuType: MENU_TYPE_ENUM.CATALOG.value,//菜单类型
  Icon: undefined,//菜单图标
  Pid: undefined,//父级ID
  OrderSort: undefined,//排序
  component: undefined,//组件路径
  Btns: [],//按钮集合
};
let form = reactive({ ...formDefault });

const rules = computed(() => {
  return {
    Name: [
      { required: true, message: '菜单名称不能为空' },
      { max: 20, message: '菜单名称不能大于20个字符', trigger: 'blur' },
    ],
    // Btns: [
    //   { required: form.menuType === MENU_TYPE_ENUM.MENU.value, type: 'array', message: '请选择按钮', trigger: 'change' },
    // ],
  };
});

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

const onSubmit = async () => {
  let validateFormRes = await validateForm(formRef.value);
  if (!validateFormRes) {
    message.error('参数验证错误，请仔细填写表单数据!');
    return;
  }
  SmartLoading.show();
  try {
    let params = _.cloneDeep(form);
    // 若无父级ID 默认设置为0
    if (!params.Pid) {
      params.Pid = 0;
    }
    if (params.menuType == undefined) {
      params.Code = '/'
    }
    console.log("params", params)
    if (params.Id) {
      await menuApi.editPermission(params);
    } else {
      await menuApi.addPermission(params);
    }
    message.success(`${params.Id ? '修改' : '添加'}成功`);
    onClose();
    emit('reloadList');
  } catch (error) {
    smartSentry.captureError(error);
  } finally {
    SmartLoading.hide();
  }
};

function selectIcon(icon) {
  form.Icon = icon;
}

// ----------------------- 以下是暴露的方法内容 ------------------------
defineExpose({
  showDrawer,
});
</script>
<style lang="less" scoped>
.footer {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 100%;
  border-top: 1px solid #e9e9e9;
  padding: 10px 16px;
  background: #fff;
  text-align: left;
  z-index: 1;
}
</style>
