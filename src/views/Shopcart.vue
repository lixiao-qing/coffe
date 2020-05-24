<template>

  <div class="shopcart" style="background-color: #ffff99">

    <template v-if="allShocartData.length > 0">

      <van-nav-bar :fixed="true" :right-text="isManage ? '完成' : '管理'" @click-right="manage" />

      <div class="shopcart-box">
          <van-list finished-text="哎呀，别拉我啦" :finished="isFinished" v-model="isLoading" @load="loadData" >
            <van-swipe-cell v-for="(item, index) in shopcartData" :key="index" :disabled="!isManage">
              <div class="content-item animated rotateInUpLeft ">
                <div class="shopcart-checkbox">
                  <van-checkbox v-model="item.isChecked" @change="simpleSelect(item)"></van-checkbox>
                </div>
                <div class="pro-img" @click="goPage(item.pid)">
                  <img
                    class="auto-img"
                    :src="item.small_img"
                    alt
                  />
                </div>
                <div class="pro-desc">
                  <div class="pro-name">
                    <div class="clearfix">
                      <div class="ch-name fl">{{item.name}}</div>
                      <div class="rule fl">{{item.rule}}</div>
                    </div>
                    <div class="en-name">{{item.enname}}</div>
                  </div>
                  <div class="pro-price">
                    <div class="fl">￥{{item.price}}</div>
                    <div class="fr clearfix">
                      <span class="icon fl left" @click="decrease(item)"></span>
                      <input class="pro-count fl" type="tex" v-model="item.count" readonly />
                      <span class="icon fl right" @click="increase(item)"></span>
                    </div>
                  </div>
                </div>
              </div>
              <template #right>
                <van-button
                  square
                  text="删除"
                  type="danger"
                  class="delete-button v-btn"
                  color="#66CC00"
                  @click="removeOneShopcart(item.sid, index)"
                />
              </template>
            </van-swipe-cell>
          </van-list>
      
      </div>

      <!-- 提交订单 -->
      <van-submit-bar
        :price="total"
        button-text="提交订单"
        button-type="info"
        :safe-area-inset-bottom="true"
        v-show="!isManage"
        @submit="commit"
      >
        <van-checkbox v-model="isAllSelect" @click="allSelect">全选</van-checkbox>
      </van-submit-bar>

      <!-- 删除 -->
      <van-submit-bar
        class="v-submit"
        button-text="删除"
        button-type="info"
        :safe-area-inset-bottom="true"
        v-show="isManage"
        @submit="removeMoreShopcart"
      >
        <van-checkbox v-model="isAllSelect">全选</van-checkbox>
      </van-submit-bar>
    </template>
    <template v-else>
       <div>
         <div class="not-shopcart">
          <div class="not-shopcart-icon">
            <van-icon name="cart-o" />
          </div>
          <div v-if="isLogin">购物车没有商品，赶紧去逛一逛！</div>
          <div v-else>
            <span class="login-text" @click="goState">登录，查看购物车数据</span>
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
    name: 'Shopcart',
    data() {
      return {
        //触底加载提示
        isLoading: false,

        //全选
        isAllSelect: false
      };
    },
    created() {

      this.$store.commit('shopcartModule/emptyData');

      //获取购物车所有商品
      this.getAllShopcartProduct();
    },
    computed: {
      isLogin() {
        return this.$store.state.isLogin;
      },

      ...mapState('shopcartModule', ['allShocartData', 'shopcartData', 'isFinished', 'count', 'isManage', 'total'])
    },
    methods: {

      goState() {
        this.$router.push({name: 'Login'});
      },

      //查看详情
      goPage(pid) {
        this.$router.push({name: 'Detail', params: {pid}});
      },

      //获取购物车所有商品
      getAllShopcartProduct() {

        //加载提示
        this.$toast.loading({
          forbidClick: true,
          duration: 0,
          message: '加载中...'
        })

        //获取token字符串
        let tokenString = localStorage.getItem('_t');

        this.axios({
          method: 'GET',
          url: '/findAllShopcart',
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

          if (result.data.code == 5000) {

            //添加判断勾选的属性
            result.data.result.forEach(v => {
              v.isChecked = false;
            })

            this.$store.commit('shopcartModule/changeData', {key: 'allShocartData', value: result.data.result});

          }
        }).catch(err => {
           this.$toast.clear();
          
        })
      },

      //加载商品数据
      loadData() {
        setTimeout(() => {
          
          this.isLoading = false;

          if (this.shopcartData.length >= this.allShocartData.length) {
            
            //没有数据可加载
             this.$store.commit('shopcartModule/changeData', {key: 'isFinished', value: true});

             return;
          }
         
          this.$store.commit('shopcartModule/loadShopcartData');
          this.isAllSelect = false;
          
        }, 1000)
        
      },

      //修改购物车商品数量
      modifyShopcartCount(sid, count) {
        //加载提示
        this.$toast.loading({
          forbidClick: true,
          duration: 0,
          message: '处理中...'
        })
        //获取token字符串
        let tokenString = localStorage.getItem('_t');

        this.axios({
          method: 'POST',
          url: '/modifyShopcartCount',
          data: {
            appkey: this.appkey,
            tokenString,
            sid,
            count
          },
          transformRequest: utils.transformRequest
        }).then(result => {
          this.$toast.clear();
          
           this.sum();
        }).catch(err => {
          this.$toast.clear();
          
        })
      },

      //增加商品数量
      increase(item) {
        // 
        ++item.count;

        this.modifyShopcartCount(item.sid, item.count);
      },

      //减少数量
      decrease(item) {
        if (item.count == 1) {
          return;
        }

        --item.count;

        this.modifyShopcartCount(item.sid, item.count);
      },

      //管理商品
      manage() {
        this.$store.commit('shopcartModule/changeData', {key: 'isManage', value: !this.isManage})
      },

      //全选
      allSelect() {
        this.shopcartData.forEach(v => {
          v.isChecked = !this.isAllSelect;
        })
      },

      //单选
      simpleSelect(item) {
       
       

       this.sum();

       if (!item.isChecked) {
         //没有全选
         this.isAllSelect = false;
         return;
       }

       for (let i = 0; i < this.shopcartData.length; i++) {
         if (!this.shopcartData[i].isChecked) {
           //没有全选
          this.isAllSelect = false;
          return;
         }
       }

       this.isAllSelect = true;

      },

      //删除单个商品
      removeOneShopcart(sid, index) {
        let sids = JSON.stringify([sid]);
        
        this.removeShopcart(sids).then(result => {
          this.$toast.clear();
          
          this.$store.commit('shopcartModule/removeShopcartData', [sid]);
           this.sum();
        }).catch(err => {
          this.$toast.clear();
          
        })
      },

      //删除多个商品
      removeMoreShopcart() {

        //获取勾选的商品
        let sids = [];
        this.shopcartData.forEach(v => {
          if (v.isChecked) {
            sids.push(v.sid);
          }
        })

        if (sids.length == 0) {
          this.$toast({
            message: '没有选择商品'
          })
          return;
        }

        // 
        this.removeShopcart(JSON.stringify(sids)).then(result => {
          this.$toast.clear();
          
          this.$store.commit('shopcartModule/removeShopcartData', sids);
           this.sum();
        }).catch(err => {
          this.$toast.clear();
          
        })

      },

      //删除商品
      removeShopcart(sids) {
         //加载提示
        this.$toast.loading({
          forbidClick: true,
          duration: 0,
          message: '处理中...'
        })
        //获取token字符串
        let tokenString = localStorage.getItem('_t');

        return this.axios({
          method: 'POST',
          url: '/deleteShopcart',
          data: {
            appkey: this.appkey,
            tokenString,
            sids
          },
          transformRequest: utils.transformRequest
        })
      },

      //计算订单总价
      sum() {
        
        let total = 0;
        this.shopcartData.forEach(v => {
          if (v.isChecked) {
            total += v.price * v.count * 100;
          }
        })

        this.$store.commit('shopcartModule/changeData', {key: 'total', value: total});
      },

      //提交订单 
      commit() {
        // 获取勾选商品的购物车的sid
        let sids = []
        this.shopcartData.forEach(v => {
          if (v.isChecked) {
            sids.push(v.sid);
          }
        })

        this.$router.push({name: 'Pay', query: {sids: sids.join('-')}});
      }

    }
  };
</script>

<style lang="less" scoped>

.shopcart {
  padding-top: 46px;
  padding-bottom: 110px;
  background-color: #FFFF99;
  
  .not-shopcart{
      font-size: 18px;
      margin-top: 50px;
      color: #e0e0e0;
      text-align: center;
    }
    .not-shopcart-icon{
      font-size: 64px;
    }

    .login-text{
      color: #444;
    }
  .shopcart-box {
    background-color: #FFFF99;
  }
  .v-submit{
    .van-checkbox{
      margin-right: auto;
    }
  }
  .content-item {
    height: 80px;
    display: flex;
    padding: 10px;
    background-color:#FFCC00 ;
    border-bottom: 1px solid #66CC00;
  }
  .pro-img {
    width: 80px;
  }
  .pro-desc {
    width: calc(~"100% - 80px - 10px - 26px");
    margin-left: 10px;
  }

  .pro-name {
    height: 56px;
  }
  .pro-price {
    height: 24px;
    font-size: 15px;
    line-height: 24px;
    color: #FFFF99;
  }
  .ch-name {
    font-size: 16px;
    color: #444;
  }

  .rule{
    font-size: 14px;
    color: #c2c2c2;
    margin-left: 10px;
    line-height: 24px;
  }
  .en-name {
    font-size: 12px;
    color: #888;
  }

  .icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-position: center center;
    background-size: cover;
    background-repeat: no-repeat;
    &.left {
      background-image: url("../assets/decrease.png");
    }
    &.right {
      background-image: url("../assets/increase.png");
    }
  }
  .pro-count {
    height: 24px;
    width: 30px;
    margin: 0 5px;
    text-align: center;
  }
  .shopcart-checkbox {
    margin-top: 30.5px;
    margin-right: 10px;
  }
  .v-btn{
    height: 100%;
  }
  .van-submit-bar__price{
    color: #FFFF99;
  }
  .van-submit-bar{
    bottom: 49.98px;
  }
  /deep/.van-submit-bar__bar{
    background-color: #FFCC00;
  }
  /deep/.van-nav-bar--fixed{
    background-color: #66CC00;
  }
  /deep/input{
    color: #FFFF99;
    background-color: #FFCC00;
  }
  /deep/.van-nav-bar__text{
    color:#FFCC00 ;
  }
  /deep/.van-checkbox__icon--checked .van-icon{
    background-color: #66cc00;
    border-color: #66cc00
  }
  /deep/.van-button--info,.shopcart .v-btn[data-v-2055fb60]{
    background-color: #66CC00;
  }
  .van-button--info{
    color: #ffcc00;
  }
}
</style>