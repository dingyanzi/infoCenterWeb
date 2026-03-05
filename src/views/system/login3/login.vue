<template>
  <div class="login-container">
    <div class="box-item desc">
      <div class="welcome">
        <p>{{ $t('login.systemTitle') }}</p>
        <p class="sub-welcome">{{ $t('login.subWelcome') }}</p>
      </div>
      <img class="welcome-img" :src="loginGif" />
    </div>
    <div class="box-item login">
      <div class="login-title">{{ $t('login.title') }}</div>
      <a-form ref="formRef" class="login-form" :model="loginForm" :rules="rules">
        <a-form-item name="loginName">
          <a-input v-model:value.trim="loginForm.userName" :placeholder="$t('login.userName')" />
        </a-form-item>
        <a-form-item name="password">
          <a-input-password v-model:value="loginForm.password" autocomplete="on"
            :type="showPassword ? 'text' : 'password'" :placeholder="$t('login.password')" />
        </a-form-item>
        <a-form-item>
          <div class="login-form-footer">
            <a-checkbox v-model:checked="rememberPwd">{{ $t('login.rememberPwd') }}</a-checkbox>
            <a-select v-model:value="currentLanguage" :options="languageOptions" style="width: 120px;" @change="handleLanguageChange" />
          </div>
        </a-form-item>
        <a-form-item>
          <div class="btn" @click="onLogin">{{ $t('login.loginBtn') }}</div>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>
<script setup>
import { message } from 'ant-design-vue';
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { loginApi } from '/@/api/system/login-api';
import { SmartLoading } from '/@/components/framework/smart-loading';
// import { LOGIN_DEVICE_ENUM } from '/@/constants/system/login-device-const';
import { useUserStore } from '/@/store/modules/system/user';
import { useAppConfigStore } from '/@/store/modules/system/app-config';
import loginGif from '/@/assets/images/login/login-min.gif';
import i18n from '/@/i18n';

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
});
const rules = {
  userName: [{ required: true, message: '用户名不能为空' }],
  password: [{ required: true, message: '密码不能为空' }],
};

const showPassword = ref(false);
const router = useRouter();
const formRef = ref();
const rememberPwd = ref(false);
const appConfigStore = useAppConfigStore();
const { locale } = useI18n();

// 监听 appConfigStore 的变化，保存到本地存储
appConfigStore.$subscribe((mutation, state) => {
  localStorage.setItem(LocalStorageKeyConst.APP_CONFIG, JSON.stringify(state));
});

// 语言选择相关
const currentLanguage = ref('zh_CN');
const languageOptions = [
  { label: '中文', value: 'zh_CN' },
  { label: 'English', value: 'en_US' },
];

// 处理语言切换
function handleLanguageChange(languageValue) {
  locale.value = languageValue;
  currentLanguage.value = languageValue;
  appConfigStore.$patch({
    language: languageValue,
  });
}

onMounted(() => {
  // 初始化语言设置
  // 1. 从 appConfigStore 获取语言设置
  if (appConfigStore.language) {
    currentLanguage.value = appConfigStore.language;
    locale.value = appConfigStore.language;
  } else {
    // 2. 自动检测浏览器语言
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('zh')) {
      currentLanguage.value = 'zh_CN';
      locale.value = 'zh_CN';
      appConfigStore.$patch({ language: 'zh_CN' });
    } else {
      currentLanguage.value = 'en_US';
      locale.value = 'en_US';
      appConfigStore.$patch({ language: 'en_US' });
    }
  }
  
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
      
      message.success(i18n.global.t('login.loginSuccess'));

      // 2. 并发获取: 用户信息 + 菜单权限树
      const [resUser, resMenu] = await Promise.all([
        loginApi.getUserInfo(),
        loginApi.getUserPermissiontree(),
      ]);

      // 3. 更新 Pinia (传入用户信息 和 菜单树)
      useUserStore().setUserLoginInfo(resUser.data, resMenu.data);

      // 4. 构建系统的路由
      buildRoutes();
      // 确保登录后语言设置与appConfigStore一致
      locale.value = appConfigStore.language;
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

.login-form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
