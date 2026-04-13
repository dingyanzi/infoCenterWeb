<template>
  <div class="login-container">
    <div class="login-logoimg">
      <div class="logoBox">
        <img :src="logoImg" alt="" />
      </div>
      <div class="title">WMS</div>
    </div>
   
  </div>
</template>

<script setup>
import logoImg from '/@/assets/images/logo/smart-admin-logo.png';

</script>

<style  scoped lang="less">

.login-container {
  min-height: 100%;
  background: #f0f2f5;
  .login-logoimg {
    height: 160px;
    background: #0052d9;
    text-align: center;
    padding-top: 47px;
    .logoBox {
      width: 50px;
      height: 50px;
      line-height: 50px;
      background: #ffffff;
      border-radius: 50px;
      margin: 0 auto;
      img {
        width: 31px;
        height: 27px;
        margin: 12px 10px 11px 9px;
      }
    }
    .title {
      padding-top: 17px;
      font-size: 20px;
      font-weight: 600;
      color: #ffffff;
    }
  }
  .login-form {
    margin: 60px auto;
    width: 240px;

    .el-form-item {
      width: 240px;
      height: 40px;
      background: #ffffff;
      border-radius: 22px;
      border: 1px solid #e4e7ed;
      margin-bottom: 40px;
    }

    .login-btn {
      width: 240px;
      height: 40px;
      line-height: 40px;
      text-align: center;
      cursor: pointer;
      .loginBtn {
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, #1291fc 0%, #0052d9 100%);
        border-radius: 22px;
        border: none;
        color: #fff;
      }
    }
    .tips {
      font-size: 14px;
      color: #fff;
      margin-bottom: 10px;

      span {
        &:first-of-type {
          margin-right: 16px;
        }
      }
    }

    .svg-container {
      padding: 0px 5px 0px 15px;
      color: #333;
      vertical-align: middle;
      width: 30px;
      display: inline-block;
      font-size: 18px;
      .svg-icon {
        width: 1.4em !important;
        height: 1.4em !important;
      }
    }
    .show-pwd {
      position: absolute;
      right: 10px;
      top: 0px;
      font-size: 18px;
      color: #889aa4;
      cursor: pointer;
      user-select: none;
      .svg-icon {
        width: 1.4em !important;
        height: 1.4em !important;
      }
    }
    .thirdparty-button {
      position: absolute;
      right: 0;
      bottom: 6px;
    }
  }
  /deep/ .el-input {
    display: inline-block;
    height: 40px;
    line-height: 40px;
    width: 85%;
    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: #333;
      height: 40px;
      line-height: 40px;
      caret-color: #000;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px #e0e3ed inset !important;
        -webkit-text-fill-color: #333 !important;
      }
    }
  }
}
/deep/ .el-form-item__content {
  height: 40px;
  line-height: 40px !important;
}
</style>