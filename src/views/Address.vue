<template>
  <div class="address" style="background-color: #ffff99">
    <van-nav-bar
      title="地址管理"
      left-text="返回"
      left-arrow
      :fixed="true"
      @click-left="back"
    />

    <div class="address-box">

      <van-address-list
        class="animated flash"
        v-model="chosenAddressId"
        :list="list"
        default-tag-text="默认"
        @add="increaseAddress"
        @edit="editAddress"
        :switchable="false"
      >
      </van-address-list>
    </div>

  </div>
</template>

<script>

  import {mapState} from 'vuex'

  import {utils} from '../utils/utils'

  export default {
    name: 'Address',

    data() {
      return {
        chosenAddressId: '0'
      };
    },

    computed: {
      ...mapState('addressModule', ['list'])
    },

    created() {

      let tokenString = localStorage.getItem('_t');

      this.$toast.loading({
        forbidClick: true,
        duration: 0,
        message: "加载中..."
      });

      this.axios({
        method: 'GET',
        url: '/findAddress',
        params: {
          appkey: this.appkey,
          tokenString
        }
      }).then(result => {
        this.$toast.clear();
        

        let list = [];
        result.data.result.forEach((v, i) => {
          let o = {
            id: i + '',
            aid: v.aid,
            name: v.name,
            tel: v.tel,
            isDefault: Boolean(v.isDefault),
            address: v.province + v.city + v.county + v.addressDetail
          }

          if (o.isDefault) {
            this.chosenAddressId = o.id;
          }

          list.push(o);

          //修改vuex list
          this.$store.commit('addressModule/changeData', {key: 'list', value: list});
        })

        this.$
      }).catch(err => {
        this.$toast.clear();
        
      })

    },

    methods: {
      //返回上一级
      back() {
        this.$router.go(-1);
      },

      increaseAddress() {
        // 
        //isAdd: 1 ==> 新增地址，0 ==> 编辑地址
        this.$router.push({name: 'NewAddress', query: {isAdd: 1}});
      },

      editAddress(item, index) {
        this.$router.push({name: 'NewAddress', query: {isAdd: 0, aid: item.aid}});
      }
    }
  }
</script>

<style lang="less" scoped>
  .address{
    padding-top: 46px;
     background-color: #FFFF99;
     .address-box{
       background-color: #FFFF99;
     }
    /deep/ .van-address-item .van-radio__icon--checked .van-icon{
      background-color: #1989fa;
      border-color: #1989fa;
    }

    /deep/ .van-button--danger{
           background-color: #66cc00;
    border-color: #66cc00;
    }

    /deep/ .van-tag--danger{
      background-color: #1989fa;
      
    }
     /deep/.van-nav-bar--fixed{
    background-color: #66CC00;
  }
  /deep/.van-address-item ,.van-cell{
    background-color:#FFCC00 ;
  }
  /deep/.van-address-list__bottom{
     background-color: #FFFF99;
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
  /deep/.van-button--danger{
    color: #ffcc00;
  }
  }
</style>