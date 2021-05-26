<template>
  <el-container class = "home-container">
    <!--侧边栏-->
    <!--<el-aside :class="[isCollpase===false?'hidden-md-and-down':'']" :width="isCollpase?'64px':'217px'">-->
    <el-aside :width="isCollpase?'64px':'217px'">
      <el-header>
        <img src = "../assets/logo-v.png" alt = "">
        <span v-show = "!isCollpase">后台管理系统</span>
      </el-header>
      <!--侧边栏菜单区域-->
      <el-menu
        background-color = "#304156"
        text-color = "#fff"
        active-text-color = "#409EFF"
        :unique-opened = "true"
        :collapse = isCollpase
        :collapse-transition = "false"
        :router = "true"
        :default-active = "activePath">
        <el-submenu :index = "index+''" v-for = "(item,index) in menulist" :key = "index">
          <!-- 一级菜单的模板区域 -->
          <template slot = "title">
            <!--图标-->
            <i :class = "iconObj[item.id]"></i>
            <!--文本-->
            <span>{{ item.authName }}</span>
          </template>
          <el-menu-item @click = "saveNavState('/'+subItem.path,item,subItem)" :index = "'/'+subItem.path"
                        v-for = "(subItem,subIndex) in item.children" :key = "subIndex">
            <template slot = "title">
              <!--图标-->
              <i class = "el-icon-menu"></i>
              <!--文本-->
              <span>{{ subItem.authName }}</span>
            </template>
          </el-menu-item>
        </el-submenu>
      </el-menu>
    </el-aside>
    <!--右侧区域-->
    <el-container>
      <!--头部区域-->
      <el-header>
        <div class = "el-icon-s-unfold toggle-button" @click = "toggleCollpase"></div>
        <el-breadcrumb separator-class = "el-icon-arrow-right">
          <el-breadcrumb-item :to = "{ path: '/home' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-show="breadcrumbItem">{{ breadcrumbItem }}</el-breadcrumb-item>
          <el-breadcrumb-item v-show="breadcrumbSubItem">{{ breadcrumbSubItem }}</el-breadcrumb-item>
        </el-breadcrumb>
        <el-button type = "danger" @click = "logout">退出</el-button>
      </el-header>
      <!--右侧内容主体区域-->
      <el-main>
        <!--路由占位符-->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      // 左侧菜单数据
      menulist: [],
      iconObj: {
        125: 'iconfont icon-users',
        103: 'iconfont icon-header-22',
        101: 'iconfont icon-shangpingouwudai2',
        102: 'iconfont icon-danju-tianchong',
        145: 'iconfont icon-areachart'
      },
      isCollpase: false,
      // 被激活的链接地址
      activePath: '',
      // 面包屑文字
      breadcrumbItem: '',
      breadcrumbSubItem: ''
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取左侧所有的菜单
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      } else {
        this.menulist = res.data
      }
      // console.log('获取左侧所有的菜单------')
      // console.log(res)
    },
    // 点击按钮，切换菜单的折叠与展开
    toggleCollpase() {
      this.isCollpase = !this.isCollpase
    },
    // 保存链接的激活状态
    saveNavState(activePath, item, subItem) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
      // 更新面包屑导航文字
      this.breadcrumbItem = item.authName
      this.breadcrumbSubItem = subItem.authName
    }
  }
}
</script>

<style lang = "less" scoped>
.home-container {
  height: 100%;
}

.el-header {
  background-color: #ffffff;
  display: flex;
  align-items: center;
  font-size: 20px;

  .el-breadcrumb {
    margin-left: 20px;
  }

  .el-button {
    position: absolute;
    right: 20px;
  }
}

.el-aside {
  background-color: #304156;
  transition: all 0.3s;
  img {
    width: 32px;
    height: 32px;
  }

  .el-header {
    background-color: #304156;
    color: white;
    font-size: 16px;
    justify-content: flex-start;

    span {
      margin-left: 45px;
      position: absolute;
    }
  }
}

.el-main {
  background-color: #F0F2F5;
}

.el-menu {
  border-right: none;
}

.iconfont {
  margin-right: 10px;
}

.toggle-button {
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
</style>
