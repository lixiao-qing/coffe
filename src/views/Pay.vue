<template>
  <div class="pay" style="background-color: #ffff99">
    <van-nav-bar class="animated fadeInUp" title="提交订单" left-text="返回" left-arrow :fixed="true" @click-left="back" />

    <div class="pay-content animated bounceInUp"  >
      <!-- 选择收货地址 -->
      <div class="receive" @click="showActionSheet">{{addressData.address}}</div>

      <!-- 订单内容 -->
      <div class="order-content">

        <div class="order-item">
          <div class="item clearfix" v-for="(item, index) in orderData" :key="index">
            <div class="pro-img fl">
              <img class="auto-img" :src="item.small_img" alt="" />
            </div>
            <div class="pro-desc fl">
              <div class="pro-name">
                <div class="ch-name">{{item.name}}</div>
                <div class="en-name">{{item.enname}}</div>
              </div>
              <div class="pro-rule">{{item.rule}}</div>
            </div>
            <div class="pro-info fr">
              <div class="pro-price">￥{{item.price}}</div>
              <div class="pro-count">x{{item.count}}</div>
            </div>
          </div>
         
          <div class="item clearfix">
            <div class="fr clearfix">
              <span class="fl text">共计 {{orderDesc.count}} 件商品 合计：</span>
              <span class="fl price">￥{{orderDesc.total}}</span>
            </div>
          </div>
          <div class="item bottom-item"></div>
        </div>

      </div>

    </div>

    <van-action-sheet v-model="isShow" title="选择收货地址">
         <van-address-list
          v-model="chosenAddressId"
          :list="list"
          default-tag-text="默认"
          :switchable="true"
          @select="selectAddress"
          @add="newAddress"
        >
      </van-address-list>
    </van-action-sheet>

    <van-submit-bar
      :price="orderDesc.total * 100"
      button-text="立即结算"
      button-type="info"
      @submit="pay"
     color="#ffcc00"
    />

  </div>
  
</template>

<script>

  import {utils} from '../utils/utils'

  import {mapState} from 'vuex'

  export default {
    name: 'Pay',

    data() {
      return {
        isShow: false,
        chosenAddressId: '0'
      };
    },

    created() {

      this.$store.commit('payModule/emptyData');

      //截取查询查询参数
      let sids = this.$route.query.sids.split('-');
      

      this.$store.commit('payModule/changeData', {key: 'sids', value: sids});

      this.findBuyProduct(sids);
      this.getAddress();

    },

    computed: {
      ...mapState('payModule', ['orderData', 'orderDesc', 'isSelect', 'list', 'addressData', 'sids'])
    },

    methods: {

      //根据sid查询需要购买的商品
      findBuyProduct(sids) {
        let tokenString = localStorage.getItem('_t');
        //加载提示
        this.$toast.loading({
          forbidClick: true,
          duration: 0,
          message: "加载中..."
        });
        this.axios({
          type: 'GET',
          url: '/commitShopcart',
          params: {
            appkey: this.appkey,
            tokenString,
            sids: JSON.stringify(sids)
          }
        }).then(result => {
          this.$toast.clear();
          

          this.orderDesc.count = 0;
          this.orderDesc.total = 0;

          result.data.result.forEach(v => {
            this.orderDesc.count += v.count;

            this.orderDesc.total += v.count * v.price;
          })

          this.$store.commit('payModule/changeData', {key: 'orderData', value: result.data.result});

        }).catch(err => {
           this.$toast.clear();
          
        })
      },

      //返回上一级
      back() {
        this.$router.go(-1);
      },

      //获取收货地址
      getAddress() {
        let tokenString = localStorage.getItem('_t');
        this.axios({
          method: 'GET',
          url: '/findAddress',
          params: {
            appkey: this.appkey,
            tokenString
          }
        }).then(result => {
          
          let list = [];
          result.data.result.forEach((v, i) => {
            
            let address = {
              id: i + '',
              name: v.name,
              tel: v.tel,
              address: v.province + v.city + v.county + v.addressDetail
            };

            list.push(address);

            if (v.isDefault == 1) {
              this.$store.commit('payModule/changeData', {key: 'isSelect', value: true});
              // this.$store.commit('payModule/changeData', {key: 'address', value: address.address});
              this.addressData.address = address.address;
              this.chosenAddressId = i + '';
            }

          })

          this.$store.commit('payModule/changeData', {key: 'list', value: list});

        }).catch(err => {
          
        })
      },

      //选择地址
      selectAddress(item, index) {

        if (!this.isSelect) {
          this.$store.commit('payModule/changeData', {key: 'isSelect', value: true});
        }
        // this.$store.commit('payModule/changeData', {key: 'address', value: item.address});

        this.addressData.phone = item.tel;
        this.addressData.receiver = item.name;
        this.addressData.address = item.address;

        this.isShow = false;
      },

      //新增地址
      newAddress() {
        this.$router.push({name: 'NewAddress', query: {isAdd: 1}});
      },

      showActionSheet() {
        this.isShow = true;
      },

      //结算
      pay() {
        
        if (!this.isSelect) {
          this.$toast(this.address);
          return;
        }

        let tokenString = localStorage.getItem('_t');

        let sids = this.sids.concat();

        //加载提示
        this.$toast.loading({
          forbidClick: true,
          duration: 0,
          message: "加载中..."
        });

        this.axios({
          method: 'POST',
          url: '/pay',
          data: {
            appkey: this.appkey,
            tokenString,
            sids: JSON.stringify(sids),
            phone: this.addressData.phone,
            receiver: this.addressData.receiver,
            address: this.addressData.address
          },
          transformRequest: utils.transformRequest
        }).then(result => {
          this.$toast.clear();
          
          this.$router.push({name: 'Order'});
        }).catch(err => {
          this.$toast.clear();
          
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .pay{
    padding-top: 46px;
    .content{
      padding: 10px;
    }
    .pay-content{
      padding: 10px;
    }
    .receive{
      background-color: #66cc00;
      font-size: 16px;
      color: #444;
      height: 46px;
      line-height: 46px;
      padding: 0 10px;
      border-radius: 5px;
    }
    .order-content{
      margin-top: 10px;
    }
    .order-item{
      border-radius: 5px;
      overflow: hidden;
    }
    .item{
      background-color: #66cc00;
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
      color: #FFCC00;
    }
    .pro-rule{
      height: 16px;
      line-height: 16px;
      font-size: 12px;
      color: #FFCC00;
    }
    .pro-price{
      height: 44px;
      color: #FFCC00;
      font-size: 12px;
      line-height: 21px;
    }
    .pro-count{
      font-size: 10px;
      color: #FFCC00;
      height: 16px;
      line-height: 16px;
      text-align: right;
    }
    .text{
      color: #FFCC00;
      font-size: 10px;
      line-height: 21px;
    }
    .price{
      font-size: 16px;
      font-weight: bold;
      color: #444;
    }
    .bottom-item{
      margin: -5px 5px 0;
      padding: 0;
      // height: 10px;
      position: relative;
      z-index: -2;
      border-bottom-left-radius: 0px;
      border-bottom-right-radius: 0px;
      background-color: #66cc00;
    }
    .van-submit-bar__price{
      color: #FFCC00;
    }

    /deep/.van-address-item .van-radio__icon--checked .van-icon{
      background-color: #1989fa;
      border-color: #1989fa;
    }

    /deep/.van-button--danger{
      background-color: #1989fa;
      border-color: #1989fa;
    }

    /deep/.van-tag--danger{
      background-color: #1989fa;
    }

    /deep/.van-icon-edit::before{
      content: ''
    }

    /deep/.van-address-item__value{
      padding-right: 0;
    }
    .van-submit-bar__bar{
      background-color:#66cc00;
    }
    .fadeInUp{
      background-color:#66cc00;
      color:#FFCC00;
    }
    .van-nav-bar__text{
      color:#FFCC00;
    }
    .van-nav-bar .van-icon{
      color:#FFCC00;
    }
    .van-nav-bar__title{
      color:#FFCC00;
    }
    .van-submit-bar__button{
      background-color:#FFCC00;
    }
    .pay .van-submit-bar__price[data-v-e8599b44] {
    color: #ffcc00;
}
  }
</style>