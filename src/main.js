import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import 'lib-flexible'

import axios from 'axios'
import VueAxios from 'vue-axios'


import animated from 'animate.css'


//导入操作cookies模块
import VueCookies from 'vue-cookies'


//导入vant的组件
import {
  Form,
  Field,
  Button,
  Toast,
  Tabbar,
  TabbarItem,
  Swipe,
  SwipeItem,
  NavBar,
  GoodsAction,
  GoodsActionIcon,
  GoodsActionButton,
  Checkbox,
  SwipeCell,
  SubmitBar,
  List,
  CellGroup,
  Cell,
  Icon,
  Tag,
  AddressList,
  AddressEdit,
  ActionSheet,
  Tab,
  Tabs,
  Uploader,
  Dialog
} from 'vant'
Vue.use(animated)

Vue.use(VueAxios, axios)

Vue.use(VueCookies)

Vue
  .use(Form)
  .use(Field)
  .use(Button)
  .use(Toast)
  .use(Tabbar)
  .use(TabbarItem)
  .use(Swipe)
  .use(SwipeItem)
  .use(NavBar)
  .use(GoodsAction)
  .use(GoodsActionIcon)
  .use(GoodsActionButton)
  .use(Checkbox)
  .use(SwipeCell)
  .use(SubmitBar)
  .use(List)
  .use(CellGroup)
  .use(Cell)
  .use(Icon)
  .use(Tag)
  .use(AddressList)
  .use(AddressEdit)
  .use(ActionSheet)
  .use(Tab)
  .use(Tabs)
  .use(Uploader)
  .use(Dialog)

Vue.config.productionTip = false

//设置基础请求路径
axios.defaults.baseURL = 'http://www.kangliuyong.com:10002'

//配置post请求头
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8'

//为vue原型添加一个属性
Vue.prototype.appkey = 'U2FsdGVkX1/EDumWmIzzYvZRoS441UVDcmWjka/rBMI='

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
