<template>
  <div class="secure" style="background-color: #ffff99">
    <van-nav-bar
      title="安全中心"
      left-text="返回"
      right-text="退出登录"
      left-arrow
      :fixed="true"
      @click-left="back"
      @click-right="logout"
      class="animated bounceInDown"
    />

    <div class="btns animated fadeInRight">
      <van-button class="destroy" type="default" block @click="showActionSheet">修改密码</van-button>

      <van-button class="destroy" type="default" block @click="destroyAccount">注销账号</van-button>
    </div>

    <van-action-sheet v-model="isShow" title="修改密码">
      <van-form @submit="updatePassword">
        <van-field
          v-model="userInfo.oldPassword"
          type="text"
          name="旧密码"
          label="旧密码"
          placeholder="旧密码(6-16位)"
        />
        <van-field
          v-model="userInfo.password"
          type="text"
          name="新密码"
          label="新密码"
          placeholder="新密码(6-16位)"
        />
        <div style="margin: 16px;">
          <van-button round block type="info" native-type="submit">提交</van-button>
        </div>
      </van-form>
    </van-action-sheet>
  </div>
</template>

<script>
//导入表单验证模块
import { valid } from "../utils/valid";

//导入公共方法模块
import { utils } from "../utils/utils";

export default {
  name: "Secure",

  data() {
    return {
      isShow: false,
      userInfo: {
        oldPassword: "",
        password: ""
      }
    };
  },

  created() {
    if (!this.isLogin) {
      this.$router.push({ name: "Login" });
    }
  },

  computed: {
    isLogin() {
      return this.$store.state.isLogin;
    }
  },

  methods: {
    back() {
      this.$router.go(-1);
    },

    showActionSheet() {
      this.isShow = true;
    },

    //修改密码
    updatePassword() {
      if (!this.isLogin) {
        this.$router.push({ name: "Login" });
        return;
      }

      if (valid.validForm(this.userInfo, this)) {
        //如果通过

        //判断两个密码是否一致
        if (this.userInfo.password == this.userInfo.oldPassword) {
          this.$toast("新密码不能和旧密码一致");
          return;
        }

        let tokenString = localStorage.getItem("_t");

        //加载提示
        this.$toast.loading({
          forbidClick: true,
          duration: 0,
          message: "加载中..."
        });

        this.axios({
          method: "POST",
          url: "/updatePassword",
          data: {
            appkey: this.appkey,
            tokenString,
            oldPassword: this.userInfo.oldPassword,
            password: this.userInfo.password
          },
          transformRequest: utils.transformRequest
        })
          .then(result => {
            this.$toast.clear();

            if (result.data.code === "E001") {
              //修改成功
              this.isShow = false;

              //清除本地存储的token
              localStorage.removeItem("_t");

              this.$store.commit("changeData", {
                key: "isLogin",
                value: false
              });

              this.$router.push({ name: "Login" });
            } else {
              this.$toast(result.data.msg);
            }
          })
          .catch(err => {
            this.$toast.clear();
          });
      }
    },

    //退出登录
    logout() {
      if (!this.isLogin) {
        this.$router.push({ name: "Login" });
        return;
      }

      let tokenString = localStorage.getItem("_t");

      //加载提示
      this.$toast.loading({
        forbidClick: true,
        duration: 0,
        message: "加载中..."
      });

      this.axios({
        method: "POST",
        url: "/logout",
        data: {
          appkey: this.appkey,
          tokenString
        },
        transformRequest: utils.transformRequest
      })
        .then(result => {
          this.$toast.clear();

          this.$store.commit("changeData", { key: "isLogin", value: false });
          localStorage.removeItem("_t");
          this.$router.push({ name: "Login" });
        })
        .catch(err => {
          this.$toast.clear();
        });
    },

    //注销账号
    destroyAccount() {
      if (!this.isLogin) {
        this.$router.push({ name: "Login" });
        return;
      }

      this.$dialog
        .confirm({
          title: "注销账号",
          message: "是否确定注销，一旦确认注销就无法恢复"
        })
        .then(text => {
          if (text == "confirm") {
            //执行注销
            let tokenString = localStorage.getItem("_t");

            //加载提示
            this.$toast.loading({
              forbidClick: true,
              duration: 0,
              message: "加载中..."
            });

            this.axios({
              method: "POST",
              url: "/destroyAccount",
              data: {
                appkey: this.appkey,
                tokenString
              },
              transformRequest: utils.transformRequest
            })
              .then(result => {
                this.$toast.clear();

                localStorage.removeItem("_t");
                this.$store.commit("changeData", {
                  key: "isLogin",
                  value: false
                });
                this.$router.push({ name: "Login" });
              })
              .catch(err => {
                this.$toast.clear();
              });
          }
        })
        .catch(err => {});
    }
  }
};
</script>

<style lang="less" scoped>
.secure {
  padding-top: 46px;
  background-color: #ffff99;
  .btns {
    margin-top: 30px;
    padding: 0 10px;
  }

  .destroy {
    margin-top: 30px;
    background-color: #ffcc00;
  }
  /deep/.van-nav-bar--fixed {
    background-color: #66cc00;
  }
  /deep/.van-nav-bar__text {
    color: #444;
  }
  /deep/.van-nav-bar .van-icon,
  .van-nav-bar__text,
  .van-nav-bar__title {
    color: #ffcc00;
  }
  /deep/.van-popup--bottom.van-popup--round {
    background-color: #ffff99;
  }
  /deep/.van-cell {
    background-color: #ffff99;
    color: #ffcc00;
  }
  /deep/.van-button--info {
    color: #ffcc00;
    background-color: #66cc00;
    border: 0.02667rem solid #66cc00;
  }
  .van-dialog {
    background-color: #66cc00;
  }
  .van-button--default {
    background-color: #66cc00;
    color: #ffcc00;
    border: 0.02667rem solid #66cc00;
  }
  /deep/.van-nav-bar__title{
     color: #FFCC00;
  }
  /deep/.van-nav-bar__text {
    color: #FFCC00;
  }
  /deep/.van-action-sheet{
    color: #ffcc00;
  }
}
</style>