<template>
  <div class="detail " style="background-color: #ffff99">
    <van-nav-bar class="animated fadeInDown" title="商品详情" left-text="返回" left-arrow :fixed="true" @click-left="back" />

    <div class="product-box animated rubberBand ">
      <div >
        <img class="auto-img" :src="productDetailData.large_img" alt />
      </div>
      <div class="box " >
        <ul class="pro-box ">
          <li class="pro-name">{{productDetailData.name}}</li>
          <li class="pro-like" :class="{active: isLike}" @click="like"></li>
        </ul>

        <!-- 商品规格 -->
        <div class="pro-rule ">
          <div class="rule-item " v-for="(item, index) in rules" :key="index">
            <span class="fl rule-title">{{item.title}}</span>
            <ul class="fl rule-list">
              <li
                v-for="(value, i) in item.rule"
                :key="i"
                :class="{active: value.isActive}"
                @click="toggleRule(value, index)"
              >{{value.text}}</li>
            </ul>
          </div>
        </div>

        <!-- 商品描述 -->
        <div class="pro-desc">
          <div class="desc-title">商品描述</div>
          <div class="desc-info">
            <p v-for="(item, index) in desc" :key="index">{{item}}</p>
          </div>
        </div>

        <!-- 价格数量 -->
        <div class="pro-price-count">
          <div class="price">￥{{productDetailData.price}}</div>
          <div class="count clearfix">
            <span class="icon fl left" @click="decrease"></span>
            <input class="pro-count fl" type="tex" v-model="count" readonly />
            <span class="icon fl right" @click="increase"></span>
          </div>
        </div>
      </div>
    </div>

    <van-goods-action >
      <van-goods-action-icon
        icon="cart-o"
        text="购物车"
        :badge="shopcartTotal == 0 ? '' : shopcartTotal >= 100 ? '99+' : shopcartTotal"
        @click="goPage"
        background-color: #66cc00;
      />
      <van-goods-action-button  color="#FFCC00" type="warning" text="加入购物车" @click="addShopcart" />
      <van-goods-action-button color="#FFCC00" type="danger" text="立即购买" @click="buy" />
    </van-goods-action>
  </div>
</template>

<script>
import { mapState } from "vuex"

import { utils } from "../utils/utils"

export default {
  name: "Detail",

  computed: {
    ...mapState("detailModule", [
      "productDetailData",
      "rules",
      "desc",
      "count",
      "isLike",
      "shopcartTotal"
    ])
  },

  created() {
    //加载提示
    this.$toast.loading({
      forbidClick: true,
      duration: 0,
      message: "加载中..."
    });

    //清空state
    this.$store.commit("detailModule/emptyData");

    //截取路由参数
    let pid = this.$route.params.pid;
    

    //获取商品详情信息
    this.axios({
      method: "GET",
      url: "/productDetail",
      params: {
        appkey: this.appkey,
        pid
      }
    })
      .then(result => {
        
        if (result.data.code == 600) {
          this.$store.commit(
            "detailModule/changeProductDetailData",
            result.data.result[0]
          );

          //查看收藏商品
          this.findlike();

          //获取商品总数量
          this.shopcartRows();


          //关闭加载提示
          this.$toast.clear();
        }
      })
      .catch(err => {
        
        //关闭加载提示
        this.$toast.clear();
      });
  },

  methods: {
    //增加数量
    increase() {
      let count = this.count + 1;
      this.$store.commit("detailModule/changeData", {
        key: "count",
        value: count
      });
    },

    //减少数量
    decrease() {
      if (this.count == 1) {
        return;
      }

      let count = this.count - 1;

      this.$store.commit("detailModule/changeData", {
        key: "count",
        value: count
      });
    },

    //切换商品规格
    toggleRule(item, index) {
      
      if (item.isActive) {
        
        return;
      }

      let cuurentRule = this.rules[index];
      
      for (let i = 0; i < cuurentRule.rule.length; i++) {
        if (cuurentRule.rule[i].isActive) {
          cuurentRule.rule[i].isActive = false;
          break;
        }
      }

      item.isActive = true;
    },

    //查看当前商品是否被收藏
    findlike() {
      let tokenString = localStorage.getItem('_t');
      

      if (tokenString == null) {
        return;
      }

      this.axios({
        method: "GET",
        url: "/findlike",
        params: {
          appkey: this.appkey,
          pid: this.productDetailData.pid,
          tokenString
        }
      })
        .then(result => {
          

         if(result.data.code == 1000) {
            //修改isLike
            this.$store.commit("detailModule/changeData", {
              key: "isLike",
              value: result.data.result.length > 0
            });
          }
        })
        .catch(err => {
          
        });
    },

    //收藏商品, 取消收藏
    like() {
      //加载提示
      this.$toast.loading({
        forbidClick: true,
        duration: 0,
        message: "加载中..."
      });
      let tokenString = localStorage.getItem('_t');

      let url = this.isLike ? "/notlike" : "/like";

      this.axios({
        method: "POST",
        url,
        data: {
          appkey: this.appkey,
          pid: this.productDetailData.pid,
          tokenString
        },

        transformRequest: utils.transformRequest
      })
        .then(result => {
          //关闭加载提示
          this.$toast.clear();

          

          if (result.data.code == 700) {
            this.$router.push({name: 'Login'});
            return;
          }

          //加载提示
          this.$toast({
            message: result.data.msg
          });
          //修改isLike
          this.$store.commit("detailModule/changeData", {
            key: "isLike",
            value: !this.isLike
          });
        })
        .catch(err => {
          
          //关闭加载提示
          this.$toast.clear();
        });
    },

    //加入购物车
    addShopcart(type) {
      //加载提示
      this.$toast.loading({
        forbidClick: true,
        duration: 0,
        message: "加载中..."
      });
      let tokenString = localStorage.getItem('_t');

      //获取商品规格
      

      let ruleData = [];
      this.rules.forEach(v => {
        for (let i = 0; i < v.rule.length; i++) {
          if (v.rule[i].isActive) {
            ruleData.push(v.rule[i].text);
            break;
          }
        }
      });

      

      this.axios({
        method: "POST",
        url: "/addShopcart",
        data: {
          appkey: this.appkey,
          pid: this.productDetailData.pid,
          count: this.count,
          rule: ruleData.join("/"),
          tokenString
        },
        transformRequest: utils.transformRequest
      })
        .then(result => {
          //关闭加载提示
          this.$toast.clear();
          

          //未登录，跳到登录界面
          if (result.data.code == 700) {
            this.$router.push({name: 'Login'});
            return;
          }

          //加载提示
          this.$toast({
            message: result.data.msg
          });

          if (result.data.code == 3000) {

            if (result.data.status == 1) {
              //新增一条数据
              this.$store.commit("detailModule/changeData", {
                key: "shopcartTotal",
                value: this.shopcartTotal + 1
              });
            }

            //如果是立即购买，则跳转到结算页面，携带sid到立即结算页面
            if (type == 'buy') {
              this.$router.push({name: 'Pay', query: {sids: result.data.sid}});
            }
          }
        })
        .catch(err => {
          
          //关闭加载提示
          this.$toast.clear();
        });
    },

    //立即购买
    buy() {
      this.addShopcart('buy');
    },

    //获取购物车总商品数量
    shopcartRows() {
      let tokenString = localStorage.getItem('_t');
      this.axios({
        method: "GET",
        url: "/shopcartRows",
        params: {
          appkey: this.appkey,
          tokenString
        }
      })
        .then(result => {
          
          if (result.data.code == 8000) {
            this.$store.commit("detailModule/changeData", {
              key: "shopcartTotal",
              value: result.data.result
            });
          }
        })
        .catch(err => {
          
        });
    },

    //返回上一级
    back() {
      this.$router.go(-1);
    },

    //跳转
    goPage() {
      this.$router.push({name: 'Shopcart'});
    }
  }
};
</script>

<style lang="less" scoped>

.detail {
  padding-top: 46px;
  padding-bottom: 60px;
  .box {
    padding: 0 10px;
    background-color: #ffff99;
  }
  .product-box {
    background-color: #fff;
  }
  .pro-box {
    display: flex;
    padding-top: 20px;
  }
  .pro-name {
    font-size: 16px;
    color: #444;
    line-height: 24px;
    // color: #1989fa;
  }
  .pro-like {
    margin-left: auto;
    width: 24px;
    height: 24px;
    background: url("../assets/like.png") no-repeat center center;
    background-size: cover;
    &.active {
      background-image: url("../assets/like_active.png");
    }
  }
  .pro-rule {
    margin-top: 20px;
    border-bottom: 1px solid #e9e9e9;
    padding-bottom: 20px;
  }
  .rule-item {
    height: 30px;
    padding: 10px 0;
  }
  .rule-list > li {
    float: left;
    width: 70px;
    height: 30px;
    line-height: 30px;
    color: #666;
    background-color: #FFFF99;
    margin-right: 20px;
    border-radius: 20px;
    text-align: center;
    font-size: 14px;
    &.active {
      background-color: #FFCC00;
      color: #fff;
    }
  }
  .rule-title {
    line-height: 30px;
    width: 60px;
    font-size: 16px;
    color: #444;
  }
  .pro-desc {
    margin-top: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e9e9e9;
  }
  .desc-title {
    color: #444;
    font-size: 16px;
  }
  .desc-info {
    color: #666;
    font-size: 14px;
    > p {
      margin: 10px 0 0;
    }
  }
  .pro-price-count {
    display: flex;
    height: 50px;
  }
  .price {
    color: #ffd01e;
    font-size: 16px;
    line-height: 50px;
  }
  .count {
    margin-top: 13px;
    margin-left: auto;
    font-size: 14px;
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
    background-color: #ffff99;
  }
  /deep/.van-nav-bar--fixed{
    background-color: #66cc00;
  }
   /deep/.van-nav-bar .van-icon, .van-nav-bar__text, .van-nav-bar__title{
    color: #FFCC00;
  }
  /deep/.van-goods-action{
     background-color: #66cc00;
  }
  /deep/.van-goods-action-icon{
    background-color: #66cc00;
  }
  /deep/.van-nav-bar__text{
    color: #FFCC00;
  }
}
</style>