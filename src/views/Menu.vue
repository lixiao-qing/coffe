<template>

    <div class="menu" style="background-color: #ffff99">

      <!-- 轮播 -->
      <van-swipe :autoplay="3000" indicator-color="#FFCC00" >
        <van-swipe-item v-for="(item, index) in bannerData" :key="index">
          <img class="auto-img" :src="item.bannerImg" alt="">
        </van-swipe-item>
      </van-swipe>

      <!-- 菜单分类 -->
      <div class="menu-data">
        <div class="aside animated bounceIn">
          <div class="aside-item" :class="{active: item.isActive}" v-for="(item, index) in typeData" :key="index" @click="toggleType(item, index, $event)">{{item.typeDesc}}</div>
          <div class="line" :style="{top: top + 'px'}"></div>
        </div>
        <div class="content ">
          <div class="content-item animated bounceIn slower " v-for="(item, index) in currentProduct" :key="index" @click="goDetail(item.pid)">
            <div class="pro-img">
              <img class="auto-img" :src="item.smallImg" alt="">
            </div>
            <div class="pro-desc">
              <div class="pro-name">
                <div class="ch-name">{{item.name}}</div>
                <div class="en-name">{{item.enname}}</div>
              </div>
              <div class="pro-price">￥{{item.price}}</div>
            </div>
          </div>
          
        </div>
      </div>

    </div>

</template>

<script>
  import {mapState} from 'vuex'

  export default {
    name: 'Menu',

    created() {
      if (this.menuIsLoaded) {
        //如果请求过，不再请求
        return;
      }
      
      //加载提示
      this.$toast.loading({
        forbidClick: true,
        duration: 0,
        message: "加载中..."
      });
      //初始化页面数据
      //获取banner图数据
      this.getBanner();

      //获取商品类型数据
      this.getType();

      this.$store.commit('changeData', {key: 'menuIsLoaded', value: true})
    },

    computed: {
      //菜单页面是否加载过
      menuIsLoaded() {
        return this.$store.state.menuIsLoaded;
      },

      //banner图数据
      // bannerData

      //商品类型数据
      // typeData

      //线条移动的距离
      // top

      //当前类型商品数据
      // currentProduct

      ...mapState('menuModule', ['bannerData', 'typeData', 'top', 'currentProduct'])
    },

    methods: {
      //获取banner图
      getBanner() {
        this.axios({
          method: 'GET',
          url: '/banner',

          //get请求携带的参数
          params: {
            appkey: this.appkey
          }
        }).then(result => {
          // 
          
          if (result.data.code == 300) {
            this.$store.commit('menuModule/changeData', {key: 'bannerData', value: result.data.result});
          }
          
          // 

        }).catch(err => {
          
        })
      },

      //获取商品类型
      getType() {
        this.axios({
          method: 'GET',
          url: '/type',

          //get请求携带的参数
          params: {
            appkey: this.appkey
          }
        }).then(result => {
          

          let types = result.data.result;

          //添加一个isActive, 用于判断激活标签
          types.forEach(v => {
            v.isActive = false;
          })

          types.unshift({
            type: 'isHot',
            typeDesc: '最新推荐',
            isActive: true
          })

          if (result.data.code == 400) {

            this.$store.commit('menuModule/changeData', {key: 'typeData', value: types});

            //获取最新推荐商品数据
            this.getTypeProduct(this.typeData[0]);
          }

          // 
        }).catch(err => {
          
        })
      },

      //切换商品类型
      toggleType(item, index, e) {
        if (item.isActive) {
          return;
        }

        let types = this.typeData.concat();
        for (let i = 0; i < types.length; i++) {
          if (types[i].isActive) {
            types[i].isActive = false;
            break;
          }
        }

        //将当前激活
        types[index].isActive = true;

         this.$store.commit('menuModule/changeData', {key: 'typeData', value: types});

         this.$store.commit('menuModule/changeData', {key: 'top', value: index * e.target.clientHeight});

        //加载提示
      this.$toast.loading({
        forbidClick: true,
        duration: 0,
        message: "加载中..."
      });
        this.getTypeProduct(item);

      },

      //获取商品类型的商品数据
      getTypeProduct(item) {
        // 
        //请求参数
        let params = {
          appkey: this.appkey
        };

        if (item.type == 'isHot') {
          params.value = 1;
          params.key = 'isHot';
        } else {
          params.value = item.type;
          params.key = 'type';
        }

        this.axios({
          method: 'GET',
          url: '/typeProducts',
          params
        }).then(result => {
           //关闭加载提示
          this.$toast.clear();
          // 
          if (result.data.code == 500) {
            this.$store.commit('menuModule/changeData', {key: 'currentProduct', value: result.data.result});

            
          }
        }).catch(err => {
          
           //关闭加载提示
          this.$toast.clear();
        })
      },

      //携带商品pid跳转详情页
      goDetail(pid) {
        this.$router.push({name: 'Detail', params: {pid}});
      }

    }
  }
</script>

<style lang="less" scoped>
  .menu{
   
    .menu-data{
      background-color: #FFFF99;
      display: flex;
      position: fixed;
      top: 163.03px;
      bottom: 49.98px;
      left: 0;
      right: 0;
      .aside{
        width: 100px;
        // background-color: #F7F7F7;
        position: relative;
        font-size: 14px;
        .line{
          position: absolute;
          top: 0;
          left: 0;
          width: 2px;
          height: 44px;
          background-color: #FFCC00;
          transition: top .2s;
        }
      }
      .content{
        width: calc(~"100% - 100px");
        background-color: #FFFF99;
        height: 100%;
        overflow-y: auto;
      }
    }
    .aside-item{
      text-align: center;
      line-height: 44px;
       &.active{
          background-color: #66CC00;
          color: #FFCC00;
        }
    }

    .content-item{
      height: 80px;
      display: flex;
      padding: 10px;
      border-bottom: 1px solid #66CC00;
    }
    .pro-img{
      width: 80px;
    }
    .pro-desc{
      width: calc(~"100% - 80px - 10px");
      margin-left: 10px;
    }

    .pro-name{
      height: 60px;
    }
    .pro-price{
      height: 20px;
      font-size: 15px;
      line-height: 20px;
      color: #FFCC00;
    }
    .ch-name{
      font-size: 16px;
      color: #444;
    }
    .en-name{
      font-size: 12px;
      color: #C2C2C2;
      margin-top: 6px
    }
    
  }
</style>