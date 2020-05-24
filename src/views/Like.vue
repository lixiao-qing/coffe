<template>
  <div class="like" style="background-color: #ffff99">
    <van-nav-bar
        class="animated fadeInDown"
        title="我的收藏"
        left-text="返回"
        left-arrow
        :fixed="true"
        @click-left="back"
      />
    <template v-if="likeData.length > 0">
      

      <div class="like-box clearfix animated rotateInDownLeft">
        <div :class="[index % 2 == 0 ? 'a' : 'b']" v-for="(item, index) in likeData" :key="index" @click="goPage(item.pid)">
          <div>
            <img class="auto-img" :src="item.smallImg" alt="">
          </div>
          <div class="title">{{item.name}}</div>
          <div class="clearfix">
            <span class="fl price">￥{{item.price}}</span>
            <span class="fr delete" @click.stop="removeLike(item.pid, index)">
              <van-icon class="v-icon" name="delete" />
            </span>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div>
         <div class="not-like">
          <div class="not-like-icon">
            <van-icon name="like" />
          </div>
          <div v-if="isLogin">没有收藏商品，赶紧去逛一逛！</div>
          <div v-else>
            <span class="login-text" @click="goState">登录，查看收藏数据</span>
          </div>
        </div>
      </div>
    </template>

  </div>
</template>

<script>
  import {mapState} from 'vuex'
  import {utils} from '../utils/utils'

  export default {
    name: 'Like',

    created() {
      this.getLikeData();
    },

    computed: {
      isLogin() {
        return this.$store.state.isLogin;
      },
      ...mapState('likeModule', ['likeData'])
    },

    methods: {

      //返回上一级
      back() {
        this.$router.go(-1);
      },

      goState() {
        this.$router.push({name: 'Login'});
      },
     
      //获取我的收藏商品数据
      getLikeData() {
         let tokenString = localStorage.getItem('_t');
        //初始化数据
        this.axios({
          method: 'GET',
          url: '/findAllLike',
          params: {
            appkey: this.appkey,
            tokenString
          }
        }).then(result => {
          

          this.$store.commit('changeData', {key: 'isLogin', value: result.data.code != 700});

          if (result.data.code == 700) {
            return;
          }

          if (result.data.code == 2000) {
            this.$store.commit('likeModule/changeData', {key: 'likeData', value: result.data.result});
            
          }
        }).catch(err => {
          
        })
      },

      //查看商品详情
      goPage(pid) {
        this.$router.push({name: 'Detail', params: {pid}})
      },

      //删除我的收藏商品
      removeLike(pid, index) {
        
        let tokenString = localStorage.getItem('_t');

        this.axios({
          method: 'POST',
          url: '/notlike',
          data: {
            appkey: this.appkey,
            tokenString,
            pid
          },
          transformRequest: utils.transformRequest
        }).then(result => {
          
          this.$store.commit('likeModule/changeLikeData', index);
        }).catch(err => {
          
        })

      }
    }
  }
</script>

<style lang="less" scoped>
  .like{
    padding-top: 46px;
    background-color: #ffff99;
    .not-like{
      font-size: 18px;
      margin-top: 50px;
      color: #e0e0e0;
      text-align: center;
    }
    .not-like-icon{
      font-size: 64px;
    }
     .login-text{
      color: #444;
    }
    .like-box{
      margin-top: 10px;
      >div{
        float: left;
        width: calc(~"50% - 5px - 20px");
        background-color: #FFCC00;
        padding: 10px;
        margin-bottom: 10px;
        border-radius: 6px;
        &.a{
          margin-right: 5px;
          
        }
        &.b{
          margin-left: 5px;
        }
      }
    }
    .title{
      padding: 10px 0;
      color: #444;
      font-size: 16px;
    }
    .price{
      font-size: 14px;
      color: #FFFF99;
      line-height: 24px;
    }
    .delete{
      height: 24px;
      width: 24px;
      .v-icon{
        font-size: 24px;
        color: #66cc00;
      }
    }
     /deep/.van-nav-bar--fixed{
    background-color: #66CC00;
  }
   /deep/.van-nav-bar .van-icon{
    color: #FFCC00;
  }
  /deep/.van-nav-bar__title{
     color: #FFCC00;
  }
  
   /deep/.van-nav-bar__text {
    color: #FFCC00;
  }
  }
</style>