<template>
  <div class="my" style="background-color: #ffff99">
    <div class="bg animated jackInTheBox" :style="{backgroundImage: 'url(' + userInfo.userBg + ')'}">
      <div class="person animated zoomIn">
        <div class="avatar ">
          <img class="auto-img" :src="userInfo.userImg" alt="">
        </div>
        <div class="nickname" v-if="isLogin">{{userInfo.nickName}}</div>
        <div class="nickname" v-else @click="goState()">登录</div>
      </div>
      <div class="desc  animated zoomIn" >{{userInfo.desc == '' ? '这个人很懒，什么都没有留下' : userInfo.desc}}</div>

      <div class="mybg  animated zoomIn">
        <span>更换背景</span>
        <van-uploader class="v-bg" :after-read="upload" />
      </div>

    </div>
    <van-cell-group>
      <van-cell class="animated rotateIn" v-for="(item, index) in cellData" :key="index" :title="item.title" size="large" @click="goPage(item.name)" is-link />
    </van-cell-group>
  </div>
</template>

<script>

  import {mapState} from 'vuex'

  import {utils} from '../utils/utils'

  export default {
    name: 'My',

    created() {
      this.$store.commit('myModule/changeData', {key: 'userInfo', value: {}});
      this.getUserInfo();
    },

    computed: {
      isLogin() {
        return this.$store.state.isLogin;
      },
      ...mapState('myModule', ['cellData', 'userInfo'])
    },

    methods: {
      goPage(name) {
        if (!this.isLogin) {
          this.$toast('请先登录');
          return;
        }
        this.$router.push({name});
      },

      goState() {
        this.$router.push({name: 'Login'});
      },

      //获取用户信息
      getUserInfo() {
        let tokenString = localStorage.getItem('_t');

        //加载提示
        this.$toast.loading({
          forbidClick: true,
          duration: 0,
          message: "加载中..."
        });

        this.axios({
          method: 'GET',
          url: '/findMy',
          params: {
            appkey: this.appkey,
            tokenString
          }
        }).then(result => {
          this.$toast.clear();
          

          this.$store.commit('changeData', {key: 'isLogin', value: result.data.code != 700});

          if (result.data.code == 700) {
            return;
          }

          this.$store.commit('myModule/changeData', {key: 'userInfo', value: result.data.result[0]});
        }).catch(err => {
          this.$toast.clear();
          
        })

      },

       //上传头像
      upload(file) {
        // 

        if (!this.isLogin) {
          this.$toast('请先登录');
          return;
        }

        //控制上传图片大小不能超过 300KB
        let imgSize = 300 * 1024;
        if (file.file.size > imgSize) {
          this.$toast('上传图片大小不能超过300KB');
          return;
        }

        //将图片上传到服务器

        //获取图片类型
        let imgType = file.file.type.split('/')[1];
        // 

        //处理图片的base64
        let serverBase64Img = file.content.replace(/data:image\/[A-Za-z]+;base64,/, '');
        // 

        let tokenString = localStorage.getItem('_t');

        //加载提示
        this.$toast.loading({
          forbidClick: true,
          duration: 0,
          message: "加载中..."
        });

        this.axios({
          method: 'POST',
          url: '/updateUserBg',
          data: {
            appkey: this.appkey,
            tokenString,
            imgType,
            serverBase64Img
          },
          transformRequest: utils.transformRequest
        }).then(result => {
          this.$toast.clear();
          
          this.userInfo.userBg = result.data.userBg;
        }).catch(err => {
         this.$toast.clear();
          
        })

      }
    }
  }
</script>

<style lang="less" scoped>
  .my{
    background-color: #FFFF99;
    .bg{
      height: 80px;
      background-color: #ddd;
      background-repeat: no-repeat;
      background-position: center center;
      background-size: cover;
      padding: 60px 20px;
      position: relative;
    }
    .mybg{
      position: absolute;
      top: 20px;
      right: 20px;
      color: #FFFF99;
      font-size: 14px;
    }
    .v-bg{
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      opacity: 0;
    }
    .person{
      display: flex;
    }
    .avatar{
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background-color: #e8e8e8;
      overflow: hidden;
    }
    .nickname{
      color: #FFFF99;
      font-size: 16px;
      margin-left: 20px;
      line-height: 80px;
    }

    .desc{
      color: #FFFF99;
      font-size: 12px;
      margin-top: 10px;
      margin-left: 100px;
    }
    .van-cell-group{
       background-color: #FFFF99;
    }
    /deep/.van-cell--large{
       background-color: #FFFF99;
    }
    .van-cell__right-icon{
      color: #ffcc00;
    }
  }
</style>