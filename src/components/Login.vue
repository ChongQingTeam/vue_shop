<template>
  <div class = "login_container">
    <div class = "login_box">
      <!--头像区-->
      <div class = "avatar_box">
        <img src = "../assets/logo.png" alt = "">
      </div>
      <!--  登录表单区域-->
      <el-form ref = "loginFormRef" :model = "loginForm" :rules = "loginFormRules"
               label-width = "0" class = "login_form">
        <!--用户名-->
        <el-form-item prop = "username">
          <el-input v-model = "loginForm.username" prefix-icon = "iconfont icon-user"></el-input>
        </el-form-item>
        <!--密码-->
        <el-form-item prop = "password">
          <el-input type = "password" v-model = "loginForm.password" prefix-icon = "iconfont icon-lock"></el-input>
        </el-form-item>
        <!--  按钮区域-->
        <el-form-item class = "btns">
          <el-button type = "primary" @click = "login">登录</el-button>
          <el-button type = "info" @click = "resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { encrptyAES } from '@/libs/util'
export default {
  name: 'Login',
  data () {
    return {
      // 这是登录表单
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 这是表单的验证规则对象
      loginFormRules: {
        // 验证用户名名是否合法
        username: [
          { required: true, message: '请输入登录名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        // 验证密码是狗合法
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 点击重置按钮，重置登录表单
    resetLoginForm () {
      // console.log(this)
      this.$refs.loginFormRef.resetFields()
    },
    login () {
      this.$refs.loginFormRef.validate(async (valid) => {
        // console.log(this.loginForm)
        if (!valid) return
        this.loginForm.password = encrptyAES(this.loginForm.password)
        const { data: res } = await this.$http.post('login/do', this.loginForm)
        // console.log(res)
        if (res.status !== '200') {
          return this.$message.error('登录失败')
        } else {
          this.$message.success('登录成功')
          // console.log(res)
          // 1、保存 token 到 sessionStorage 中
          window.sessionStorage.setItem('token', res.result)
          // 2、编程式导航：页面跳转
          this.$router.push('/home')
        }
      })
    }
  }
}
</script>

<style lang = "less" scoped>
.login_container {
  background-color: #5dbe8a;
  height: 100%;
  /*  display: flex;
    justify-content: center;
    align-items: center;*/
}

.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 5px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.avatar_box {
  height: 130px;
  width: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  padding: 10px;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #eeeeee;
  }
}

.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 35px;
  box-sizing: border-box;
}

.btns {
  display: flex;
  justify-content: flex-end;
}
</style>
