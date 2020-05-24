<template>
  <div class="order" style="background-color: #ffff99">

      <van-tabs class="animated fadeInRightBig" v-model="activeName" color="#FFCC00" title-active-color="#FFCC00" title-inactive-color="#444" line-height="2px" sticky @change="toggleTab">
        <van-tab :title="item.title" :name="item.name" v-for="(item, index) in tabData" :key="index">

          <template v-if="orderData.length > 0">
            <!-- 订单内容 -->
            <div class="order-content">

              <!-- 每一个订单 -->
              <div class="order-item animated zoomInRight " v-for="(item1, index1) in orderData" :key="index1">
                  <div class="item">
                    <div class="order-title clearfix">
                      <span class="fl order-no">{{item1.oid}}</span>
                      <span class="fr order-text clearfix">
                        <template v-if="item1.status == 1">
                          <span class="fl" @click="confirmReceive(item1.oid, index1)">确认收货</span>
                        </template>
                        <template v-else>
                          <span class="fl">已完成</span>
                          <span class="fl delete-icon" @click="removeOrder(item1.oid, index1)">
                            <van-icon name="delete" />
                          </span>
                        </template>
                      </span>
                    </div>

                    <!-- 订单的每一个商品数据 -->
                    <div class="clearfix pro-item" v-for="(item2, index2) in item1.data" :key="index2">
                      <div class="pro-img fl">
                        <img class="auto-img" :src="item2.smallImg" alt="" />
                      </div>
                      <div class="pro-desc fl">
                        <div class="pro-name">
                          <div class="ch-name">{{item2.name}}</div>
                          <div class="en-name">{{item2.enname}}</div>
                        </div>
                        <div class="pro-rule">{{item2.rule}}</div>
                      </div>
                      <div class="pro-info fr">
                        <div class="pro-price">￥{{item2.price}}</div>
                        <div class="pro-count">x{{item2.count}}</div>
                      </div>
                    </div>

                  </div>
                
                  <div class="item clearfix">
                    <div class="fl order-text order-time">{{item1.orderTime}}</div>
                    <div class="fr clearfix">
                      <span class="fl text">共计 {{item1.count}} 件商品 合计：</span>
                      <span class="fl price">￥{{item1.total}}</span>
                    </div>
                  </div>
                  <div class="item bottom-item"></div>
              </div>

            </div>
          </template>
          <template v-else>
             <div class="not-order">
              <div>
                <div class="not-order-icon">
                  <van-icon name="description" />
                </div>
                <div v-if="isLogin">没有订单，赶紧去逛一逛！</div>
                <div v-else>
                  <span class="login-text" @click="goState">登录，查看订单数据</span>
                </div>
              </div>
            </div>
          </template>


        </van-tab>
      </van-tabs>


     
    
  </div>
</template>

<script>

  import {mapState} from 'vuex'

  import {utils} from '../utils/utils'

  export default {
    name: 'order',
    data() {
      return {
        activeName: '0'
      };
    },


    created() {

      //全部
      this.getOrder(0);

    },

    computed: {
      isLogin() {
        return this.$store.state.isLogin;
      },

      ...mapState('orderModule', ['orderData', 'tabData'])
    },

    methods: {

      goState() {
        this.$router.push({name: 'Login'});
      },

      //获取订单数据
      getOrder(status) {

        let tokenString = localStorage.getItem('_t');

        //加载提示
        this.$toast.loading({
          forbidClick: true,
          duration: 0,
          message: "加载中..."
        });

        this.axios({
          method: 'GET',
          url: '/findOrder',
          params: {
            appkey: this.appkey,
            tokenString,
            status
          }
        }).then(result => {
          this.$toast.clear();
          

          this.$store.commit('changeData', {key: 'isLogin', value: result.data.code != 700});

          if (result.data.code == 700) {
            return;
          }

          //获取所有订单号数据
          let orderData = [];

          //查询订单oid
          let orderNos = [];
          result.data.result.forEach(v => {
            if (orderNos.indexOf(v.oid) === -1) {
              orderNos.push(v.oid);
            }
          })


          orderNos.forEach(v => {

            
            //当前订单数据
            let currentOrderData = {
              oid: v,
              count: 0,
              total: 0,
              //当前订单的所有商品数据
              data: []
            };

            result.data.result.forEach(item => {

              if (item.oid == v) {

                currentOrderData.data.push(item);

                currentOrderData.count += item.count;

                currentOrderData.total += item.count * item.price;
              }

            })


            //订单时间
            currentOrderData.orderTime = utils.formatDate(new Date(currentOrderData.data[0].createdAt), 'yyyy-MM-dd hh:mm:ss');

            currentOrderData.status = currentOrderData.data[0].status;

            orderData.push(currentOrderData);

          })


          orderData.sort((a, b) => {
            return new Date(b.orderTime) - new Date(a.orderTime);
          })


          this.$store.commit('orderModule/changeData', {key: 'orderData', value: orderData})

          

        }).catch(err => {
          this.$toast.clear();
          
        })

      },

      //确认收货
      confirmReceive(oid, index) {

        let tokenString = localStorage.getItem('_t');

        //加载提示
        this.$toast.loading({
          forbidClick: true,
          duration: 0,
          message: "加载中..."
        });

        this.axios({
          method: 'POST',
          url: '/receive',
          data: {
            appkey: this.appkey,
            tokenString,
            oid
          },
          transformRequest: utils.transformRequest
        }).then(result => {
          this.$toast.clear();
          

          this.orderData[index].status = 2;

          if (this.activeName == 1) {
            //删除orderData数组的元素
            this.$store.commit('orderModule/removeOrderData', index);
          }

        }).catch(err => {
          this.$toast.clear();
          
        })

      },

      //切换标签
      toggleTab(status) {
        
        this.getOrder(status);
      },

      //删除订单
      removeOrder(oid, index) {

        let tokenString = localStorage.getItem('_t');

        //加载提示
        this.$toast.loading({
          forbidClick: true,
          duration: 0,
          message: "加载中..."
        });

        this.axios({
          method: 'POST',
          url: '/removeOrder',
          data: {
            appkey: this.appkey,
            tokenString,
            oid
          },
          transformRequest: utils.transformRequest
        }).then(result => {
          this.$toast.clear();
          
          //删除orderData数组的元素
          this.$store.commit('orderModule/removeOrderData', index);
        }).catch(err => {
          this.$toast.clear();
          
        })
      }

    }
  }
</script>

<style lang="less" scoped>
  .order{
    padding-bottom: 49.98px;
    background-color:#FFFF99;
    .not-order{
      font-size: 18px;
      margin-top: 96px;
      color: #e0e0e0;
      text-align: center;
    }
    .not-order-icon{
      font-size: 64px;
    }
    .login-text{
      color: #444;
    }
    .delete-icon{
      font-size: 16px;
      position: relative;
      top: 2px;
      margin-left: 10px;
    }
    .order-content{
      padding: 10px;
    }
    .order-title{
      padding-bottom: 10px;
      border-bottom: 1px solid #e8e8e8;
      line-height: 21px;
    }
    .pro-item{
      margin-top: 10px;
    }

    .order-time{
      line-height: 21px;
    }
    .order-no{
      font-size: 12px;
      color: #444;
    }
    .order-text{
      font: 16px;
      color: #a8a8a8;
    }
    .order-item{
      border-radius: 5px;
      overflow: hidden;
      margin-bottom: 10px;
      // background-color: #FFCC00;
    }
    .item{
      background-color: #FFCC00;
      padding: 10px;
    }
    .pro-img{
      width: 60px;
    }
    .pro-desc{
      margin-left: 10px;
    }
    .pro-name{
      height: 44px;
    }
    .ch-name{
      font-size: 16px;
    }
    .en-name{
      font-size: 12px;
      color: #a8a8a8;
    }
    .pro-rule{
      height: 16px;
      line-height: 16px;
      font-size: 12px;
      color: #a8a8a8;
    }
    .pro-price{
      height: 44px;
      color: #444;
      font-size: 12px;
      line-height: 21px;
    }
    .pro-count{
      font-size: 10px;
      color: #a8a8a8;
      height: 16px;
      line-height: 16px;
      text-align: right;
    }
    .text{
      color: #999;
      font-size: 10px;
      line-height: 21px;
    }
    .price{
      font-size: 16px;
      font-weight: bold;
      color: #FFFF99;
    }
    .bottom-item{
      // margin: -5px 5px 0;
      padding: 0;
      height: 10px;
      position: relative;
      z-index: -1;
      border-bottom-left-radius: 5px;
      border-bottom-right-radius: 5px;
      // background-color: #FFCC00;
    }
    
    /deep/.van-tabs__nav--line{
      background-color: #66CC00;
    }
  }
</style>