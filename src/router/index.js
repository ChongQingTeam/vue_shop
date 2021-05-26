import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '@/components/Login'
// import Home from '@/components/Home'
// import Welcome from '@/components/Welcome'

// import Users from '@/components/user/Users'
// import Rights from '@/components/power/Rights'
// import Roles from '@/components/power/Roles'

// import Cate from '@/components/goods/Cate'
// import Params from '@/components/goods/Params'

// import List from '@/components/goods/List'
// import AddGoods from '@/components/goods/AddGoods'
// import EditGoods from '@/components/goods/EditGoods'

// import Order from '@/components/order/Order'
// import Report from '@/components/report/Report'

const Login = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '@/components/Login')
const Home = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '@/components/Home')
const Welcome = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '@/components/Welcome')

const Users = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '@/components/user/Users')
const Rights = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '@/components/power/Rights')
const Roles = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '@/components/power/Roles')

const Cate = () => import(/* webpackChunkName: "Cate_Params" */ '@/components/goods/Cate')
const Params = () => import(/* webpackChunkName: "Cate_Params" */ '@/components/goods/Params')

const List = () => import(/* webpackChunkName: "GoodsList_AddGoods_EditGoods" */ '@/components/goods/List')
const AddGoods = () => import(/* webpackChunkName: "GoodsList_AddGoods_EditGoods" */ '@/components/goods/AddGoods')
const EditGoods = () => import(/* webpackChunkName: "GoodsList_AddGoods_EditGoods" */ '@/components/goods/EditGoods')

const Order = () => import(/* webpackChunkName: "Order_Report" */ '@/components/order/Order')
const Report = () => import(/* webpackChunkName: "Order_Report" */ '@/components/report/Report')

Vue.use(VueRouter)

const routes = [
  // 重定向
  { path: '/', redirect: '/login' },
  // 别名
  // { path: '/', component: Login, alias: '/login' },
  { path: '/login', component: Login },
  {
    path: '/Home',
    component: Home,
    redirect: 'welcome',
    children: [
      { path: '/welcome', name: 'welcome', component: Welcome /* alias: '/home' */ },
      { path: '/users', name: 'users', component: Users },
      { path: '/rights', name: 'rights', component: Rights },
      { path: '/roles', name: 'roles', component: Roles },
      { path: '/categories', name: 'categories', component: Cate },
      { path: '/params', name: 'params', component: Params },
      { path: '/goods', name: 'goods', component: List },
      { path: '/goods/add', name: 'add', component: AddGoods },
      { path: '/goods/edit/:goodsId', name: 'edit', component: EditGoods, props: true },
      { path: '/orders', name: 'orders', component: Order },
      { path: '/reports', name: 'reports', component: Report }
    ]
  }
]

const router = new VueRouter({
  routes
})
// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    return next()
  } else {
    // 获取 token
    const tokenStr = window.sessionStorage.getItem('token')
    if (!tokenStr) {
      return next('/login')
    } else {
      next()
    }
  }
})
export default router
