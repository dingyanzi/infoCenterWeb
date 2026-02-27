<template>
  <div class="login-container">
    <div class="box-item desc">
      <div class="welcome">
        <p>WCS 人员调度系统</p>
        <p class="sub-welcome">「智能调度、简洁、高效、安全」的开发平台</p>
      </div>
      <img class="welcome-img" :src="loginGif" />
    </div>
    <div class="box-item login">
      <div class="login-title">账号登录</div>
      <a-form ref="formRef" class="login-form" :model="loginForm" :rules="rules">
        <a-form-item name="loginName">
          <a-input v-model:value.trim="loginForm.userName" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item name="password">
          <a-input-password v-model:value="loginForm.password" autocomplete="on"
            :type="showPassword ? 'text' : 'password'" placeholder="请输入密码：至少三种字符，最小 8 位" />
        </a-form-item>
        <a-form-item>
          <a-checkbox v-model:checked="rememberPwd">记住密码</a-checkbox>
        </a-form-item>
        <a-form-item>
          <div class="btn" @click="onLogin">登录</div>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>
<script setup>
import { message } from 'ant-design-vue';
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { loginApi } from '/@/api/system/login-api';
import { SmartLoading } from '/@/components/framework/smart-loading';
// import { LOGIN_DEVICE_ENUM } from '/@/constants/system/login-device-const';
import { useUserStore } from '/@/store/modules/system/user';
import loginGif from '/@/assets/images/login/login-min.gif';

import { buildRoutes } from '/@/router/index';
// import { smartSentry } from '/@/lib/smart-sentry';
import { encryptData } from '/@/lib/encrypt';
import { localSave } from '/@/utils/local-util.js';
import LocalStorageKeyConst from '/@/constants/local-storage-key-const.js';
// import { useDictStore } from '/@/store/modules/system/dict.js';
// import { dictApi } from '/@/api/support/dict-api.js';

//--------------------- 登录表单 ---------------------------------

const loginForm = reactive({
  userName: 'admin',
  password: '',
  // loginDevice: LOGIN_DEVICE_ENUM.PC.value,
});
const rules = {
  userName: [{ required: true, message: '用户名不能为空' }],
  password: [{ required: true, message: '密码不能为空' }],
};

const showPassword = ref(false);
const router = useRouter();
const formRef = ref();
const rememberPwd = ref(false);

onMounted(() => {
  // 读取本地存储的记住密码状态
  const rememberPwdStatus = localStorage.getItem(LocalStorageKeyConst.REMEMBER_PWD);
  if (rememberPwdStatus === 'true') {
    rememberPwd.value = true;
    // 读取本地存储的用户名和密码
    const savedUserName = localStorage.getItem(LocalStorageKeyConst.USER_NAME);
    const savedPassword = localStorage.getItem(LocalStorageKeyConst.USER_PASSWORD);
    if (savedUserName) {
      loginForm.userName = savedUserName;
    }
    if (savedPassword) {
      loginForm.password = savedPassword;
    }
  }
  
  document.onkeyup = (e) => {
    if (e.keyCode === 13) {
      onLogin();
    }
  };
});

onUnmounted(() => {
  document.onkeyup = null;
});

//登录
async function onLogin() {
  formRef.value.validate().then(async () => {
    try {
      SmartLoading.show();
      // 密码加密
      let encryptPasswordForm = Object.assign({}, loginForm, {
        password: encryptData(loginForm.password),
      });
      // 1. 执行登录
      const res = await loginApi.login(encryptPasswordForm);
      localSave(LocalStorageKeyConst.USER_TOKEN, res.data.token ? res.data.token : '');
      
      // 处理记住密码
      if (rememberPwd.value) {
        localStorage.setItem(LocalStorageKeyConst.REMEMBER_PWD, 'true');
        localStorage.setItem(LocalStorageKeyConst.USER_NAME, loginForm.userName);
        localStorage.setItem(LocalStorageKeyConst.USER_PASSWORD, loginForm.password);
      } else {
        localStorage.removeItem(LocalStorageKeyConst.REMEMBER_PWD);
        localStorage.removeItem(LocalStorageKeyConst.USER_NAME);
        localStorage.removeItem(LocalStorageKeyConst.USER_PASSWORD);
      }
      
      message.success('登录成功');

      // 2. 并发获取: 用户信息 + 菜单权限树
      const [resUser, resMenu] = await Promise.all([
        loginApi.getUserInfo(),
        loginApi.getUserPermissiontree(),
      ]);

      // 3. 更新 Pinia (传入用户信息 和 菜单树)
      useUserStore().setUserLoginInfo(resUser.data, resMenu.data);

      // 4. 构建系统的路由
      buildRoutes();
      router.push('/home');
    } catch (e) {
      console.error(e);
      // smartSentry.captureError(e);
    } finally {
      SmartLoading.hide();
    }
  });
}

</script>
<style lang="less" scoped>
@import './login.less';
</style>
