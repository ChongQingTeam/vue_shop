import Vue from 'vue'
import App from './App.vue'
import router from './router'

// import 'element-ui/lib/theme-chalk/display.css'
import TreeTable from 'vue-table-with-tree-grid'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 引入 animate.css 动画库
// import animated from 'animate.css'
import axios from 'axios'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'

// 导入 NProgress
import NProgress from 'nprogress'

// 配置请求的根路径
// 服务器使用Nginx配置
// # 后端 shop_api 接口袋里
//      location ^~/api/ {
//         proxy_pass http://localhost:xxxx;
//         proxy_set_header Host $host:$server_port;
//     }
// 实际接口地址：https://aerowang.cn:xxxx/api/private/v1/
axios.defaults.baseURL = 'https://aerowang.cn/api/private/v1/'
// 在 request 拦截器中，展示进度条 NProgress.start()
axios.interceptors.request.use(config => {
  // console.log(config)
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 在 response 拦截器中，隐藏进度条 NProgress.done()
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})
Vue.prototype.$http = axios
// 将富文本编辑器注册为全局可用
Vue.use(VueQuillEditor)

Vue.config.productionTip = false
// Vue.use(animated)
Vue.component('tree-table', TreeTable)
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal * 1000)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDay() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
