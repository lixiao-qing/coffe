<template>
  <div class="register" style="background-color: #ffff99">
     <van-nav-bar class="animated fadeIn" title="注册" left-text="登录"  right-text="关闭" :fixed="true" @click-left="goPage('Login')" @click-right="goPage('Menu')" />
    <div class="logo animated rotateInDownRight">
      <img class="auto-img" src="../assets/logo.png" alt="" />
    </div>
    <van-form @submit="register">
      <van-field
      class="animated  rotateInDownRight"
        v-model="userInfo.phone"
        name="手机号"
        label="手机号"
        placeholder="11位手机号"
        autocomplete="off"
      />
      <van-field
      class="animated rotateInDownRight"
        v-model="userInfo.nickName"
        name="昵称"
        label="昵称"
        placeholder="昵称(1-8个字符)"
        autocomplete="off"
      />
      <van-field
      class="animated rotateInDownRight"
        v-model="userInfo.password"
        type="text"
        name="密码"
        label="密码"
        placeholder="密码(6-16个字符)"
        autocomplete="off"
      />
      <div class="btn-box animated rotateInDownRight">
        <van-button round block type="info" native-type="submit">注册</van-button>
      </div>
    </van-form>
  </div>
</template>

<script>
//导入表单验证模块
import {valid} from '../utils/valid'

//导入公共方法模块
import {utils} from '../utils/utils'

export default {
  name: "Register",

  computed: {
    userInfo() {
      return this.$store.state.registerModule.userInfo;
    }
  },

  methods: {
    //注册
    register() {
      

      if (valid.validForm(this.userInfo, this)) {

        //发起ajax请求

        //加载提示
        this.$toast.loading({
          
          //是否禁止背景点击
          forbidClick: true,

          //禁止自动关闭
          duration: 0,

          message: '注册中...'

        })

        this.axios({
          method: 'POST',
          url: '/register',

          //请求体参数
          data: {
            appkey: this.appkey,
            nickName: this.userInfo.nickName,
            phone: this.userInfo.phone,
            password: this.userInfo.password
          },

          //序列换请求体参数
          transformRequest: utils.transformRequest

        }).then(result => {
          
          

          //关闭加载提示
          this.$toast.clear();

          //如果注册成功
          if (result.data.code == 100) {
            //跳转登录组件
            this.$router.push({name: 'Login'});
          } else {
            this.$toast({
              message: result.data.msg
            })
          }

        }).catch(err => {
          
          this.$toast.clear();
        })

      }

      
    },

    goPage(routerName) {
      this.$router.push({name: routerName});
    }
  }
};
</script>

<style lang="less" scoped>
.register{
  padding-top: 96px;
  background-color: #FFFF99;
  .btn-box{
    margin-top: 16px;
    padding: 0 10px;
  }
  .logo{
    margin: 0 auto 50px;
    width: 120px;
    height: 120px;
  }
  /deep/.van-nav-bar--fixed{
    background-color: #66CC00;
  }
  /deep/.van-cell{
    background-color: #FFFF99;
  }
  
  /deep/.van-nav-bar__text{
     color: #FFCC00;
  }
  /deep/.van-nav-bar__title{
     color: #FFCC00;
  }
  /deep/.van-button--info {
    color:#FFCC00;
    background-color: #66CC00;
    border: 0.02667rem solid #66CC00;

  }
}
</style>