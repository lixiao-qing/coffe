<template>
  <div class="main" style="background-color: #ffff99">

    <!-- 二级路由插座 -->
    <router-view></router-view>

    <!-- 底部导航 -->
    <van-tabbar v-model="tabbarName">
      <van-tabbar-item :name="item.name" :icon="item.icon" v-for="(item, index) in tabbarData" :key="index" @click.native="goPage(item)">{{item.text}}</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
  export default {
    name: 'Main',

    data() {
      return {
        //底部导航索引
        tabbarName: 'menu'
      };
    },

    computed: {

      tabbarData() {
        return this.$store.state.mainModule.tabbarData;
      }
    },

    methods: {
      //跳转
      goPage(item) {

        this.$router.push({name: item.routeName});
      }
    }
  }
</script>

<style lang="less" scoped>
/deep/.van-tabbar--fixed{
  background-color: #66CC00;
}
/deep/.van-tabbar-item--active {
      color: #FFCC00;
    }
</style>