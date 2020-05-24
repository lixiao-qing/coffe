<template>
  <div class="login" style="background-color: #ffff99">

    <van-nav-bar class="animated fadeIn" title="登录" left-text="注册"  right-text="关闭" :fixed="true" @click-left="goPage('Register')" @click-right="goPage('Menu')" />
    
    <div class="logo animated fadeIn">
      <!-- <div class="title">深浅咖啡</div> -->
      <img class="auto-img" src="../assets/logo.png" alt="" />
    </div>
    <van-form @submit="login">
      <van-field
      class="animated fadeIn"
        v-model="userInfo.phone"
        name="手机号"
        label="手机号"
        placeholder="11位手机号"
        autocomplete="off"
      />
      <van-field
      class="animated fadeIn"
        v-model="userInfo.password"
        type="password"
        name="密码"
        label="密码"
        placeholder="密码(6-16个字符)"
        autocomplete="off"
      />
      <div class="btn-box">
        <van-button round block type="info" native-type="submit" class="animated fadeIn">登录</van-button>
      </div>
      <p class="pwd animated fadeIn">
        <span @click="goPage('Email')">找回密码</span>
      </p>
    </van-form>
  </div>
</template>

<script>
//导入表单验证模块
import {valid} from '../utils/valid'

//导入公共方法模块
import {utils} from '../utils/utils'

export default {
  name: "Login",

  computed: {
    userInfo() {
      return this.$store.state.loginModule.userInfo;
    }
  },

  methods: {
    //登录
    login() {
      

      if (valid.validForm(this.userInfo, this)) {

        //发起ajax请求
        

        //加载提示
        this.$toast.loading({
          
          //是否禁止背景点击
          forbidClick: true,

          //禁止自动关闭
          duration: 0,

          message: '登录中...'

        })

        this.axios({
          method: 'POST',
          url: '/login',
          data: {
            appkey: this.appkey,
            phone: this.userInfo.phone,
            password: this.userInfo.password
          },
          transformRequest: utils.transformRequest
        }).then(result => {
          

          //关闭加载提示
          this.$toast.clear();

          //如果登录成功后, 将token保存在cookie中
          if (result.data.code == 200) {
            //将token分段存储
            // let tokenData = result.data.token.split('.');
            // 



            //cookie过期时间
            // let expires = 30 * 24 * 60 * 60;

            // tokenData.forEach((v, i) => {
            //   //v: 一个token分段
            //   this.$cookies.set('t' + i, v, expires);
            // })
            
            //存储token字符串
            localStorage.setItem('_t', result.data.token);

            //跳转页面
            this.$router.push({name: 'Menu'});

          } else {
            this.$toast(result.data.msg);
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

.login{
  padding-top: 96px;
   background-color: #FFFF99;
  .pwd{
    text-align: right;
    padding-right: 25px;
    color: #ffcc00;
   
  }
  .title {
    text-align: center;
    font-size: 22px;
    color: #444;
  }
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
  /deep/.van-nav-bar .van-icon{
    color: #FFCC00;
  }
  /deep/.van-nav-bar__title{
    color: #FFCC00 ;
  }
   /deep/.van-nav-bar__text {
    color: #FFCC00;
  }
  /deep/.van-button--info {
    color: #ffcc00;
    background-color: #66CC00;
    border: 0.02667rem solid #66CC00;

  }
}
</style>