<template>
  <div>
    <!--卡片视图-->
    <el-card class = "box-card">
      <!--搜索与添加区域-->
      <el-row :gutter = "20">
        <el-col :span = "8">
          <el-input clearable @clear = "getUserList" @keydown.enter.native = "queryUserList" placeholder = "请输入内容"
                    v-model = "queryInfo.query">
            <el-button @click = "queryUserList" slot = "append" icon = "el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span = "4">
          <el-button @click = "addDialogVisible=true" type = "primary">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data = "userlist" border stripe max-height = "500">
        <el-table-column type = "index" label = "#"></el-table-column>
        <el-table-column label = "姓名" prop = "username"></el-table-column>
        <el-table-column label = "邮箱" prop = "email"></el-table-column>
        <el-table-column label = "电话" prop = "mobile"></el-table-column>
        <el-table-column label = "角色" prop = "role_name"></el-table-column>
        <!--独占默认插槽，直接用在组件上-->
        <el-table-column label = "状态" v-slot = "scope">
          <!--{{scope.row}} 每一行均为一个用户对象-->
          <!--从数据库中取回的 userlist 中的  -->
          <el-switch
            v-model = "scope.row.mg_state" @change = "userStateChange(scope.row)">
          </el-switch>
        </el-table-column>
        <el-table-column label = "操作" class = "" v-slot = "scope">
          <el-tooltip effect = "dark" content = "编辑用户" placement = "top" :enterable = "false">
            <el-button @click = "showEditDialog(scope.row.id)" type = "primary" icon = "el-icon-edit"
                       size = "mini"></el-button>
          </el-tooltip>
          <el-tooltip effect = "dark" content = "更改用户权限" placement = "top" :enterable = "false">
            <el-button @click="setRole(scope.row)" type = "warning" icon = "el-icon-setting" size = "mini"></el-button>
          </el-tooltip>
          <el-tooltip effect = "dark" content = "删除用户" placement = "top" :enterable = "false">
            <el-button @click="removeUserById(scope.row.id)" type = "danger" icon = "el-icon-delete" size = "mini"></el-button>
          </el-tooltip>
        </el-table-column>
      </el-table>
      <!--  分页区域-->
      <el-pagination
        @size-change = "handleSizeChange"
        @current-change = "handleCurrentChange"
        :current-page = "queryInfo.pagenum"
        :page-sizes = "[4, 6, 8, 10]"
        :page-size = "queryInfo.pagesize"
        layout = "sizes,total,prev, pager, next, jumper"
        :total = "total">
      </el-pagination>
    </el-card>
    <!--  添加用户的对话框-->
    <el-dialog
      title = "添加用户"
      :visible.sync = "addDialogVisible"
      width = "50%"
      @close = "addDialogClosed">
      <!--内容主体区-->
      <el-form :model = "addForm" :rules = "addFormRules" ref = "addFormRef" label-width = "70px"
               @keydown.enter.native = "addUser">
        <el-form-item label = "用户名" prop = "username">
          <el-input v-model = "addForm.username"></el-input>
        </el-form-item>
        <el-form-item label = "密码" prop = "password">
          <el-input type = "password" v-model = "addForm.password"></el-input>
        </el-form-item>
        <el-form-item label = "邮箱" prop = "email">
          <el-input v-model = "addForm.email"></el-input>
        </el-form-item>
        <el-form-item label = "手机" prop = "mobile">
          <el-input v-model = "addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!--底部按钮区域-->
      <span slot = "footer" class = "dialog-footer">
        <el-button @click = "addDialogVisible = false">取 消</el-button>
        <el-button type = "primary" @click = "addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!--修改用户的对话框-->
    <el-dialog
      title = "修改用户"
      :visible.sync = "editDialogVisable"
      width = "50%"
      @close = "editDialogClosed">
      <el-form :model = "editForm" :rules = "editFormRules" ref = "editFormRef" label-width = "70px">
        <el-form-item label = "用户名" prop = "username">
          <el-input v-model = "editForm.username" :disabled = "true"></el-input>
        </el-form-item>
        <el-form-item label = "邮箱" prop = "email">
          <el-input v-model = "editForm.email"></el-input>
        </el-form-item>
        <el-form-item label = "手机" prop = "mobile">
          <el-input v-model = "editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot = "footer" class = "dialog-footer">
        <el-button @click = "editDialogVisable = false">取 消</el-button>
        <el-button type = "primary" @click = "editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!--修改用户角色对话框-->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%" @close="setRoleDialogClosed">
      <div>
        <p>当前的用户: {{userInfo.username}}</p>
        <p>当前的角色: {{userInfo.role_name}}</p>
        <p>分配角色:
          <el-select v-model="selectRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Users',
  data() {
    // 验证邮箱的校验规则
    var checkEmail = (rule, value, callback) => {
      // 验证邮箱的正则表达式
      const regEmail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
      if (regEmail.test(value)) {
        // 合法邮箱
        return callback()
      }
      callback(new Error('请输入合法的邮箱'))
    }
    // 验证手机号的校验规则
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^(13[0-9]|14[01456879]|15[0-3,5-9]|16[2567]|17[0-8]|18[0-9]|19[0-3,5-9])\d{8}$/
      if (regMobile.test(value)) {
        // 合法邮箱
        return callback()
      }
      callback(new Error('请输入合法的手机号'))
    }
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        // 当前页码
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 8
      },
      userlist: [],
      total: 0,
      // 控制添加用户的对话框的显示与隐藏
      addDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名长度在 3 到 10 个字符之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '密码长度在 6 到 15 个字符之间', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 控制修改用户对话框的显示与隐藏
      editDialogVisable: false,
      // 查询到的用户数据对象
      editForm: {},
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      setRoleDialogVisible: false,
      // 将要分配角色的信息
      userInfo: {},
      // 所有角色用户列表
      rolesList: [],
      // 选中的角色Id值
      selectRoleId: ''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表数据失败')
      } else {
        this.userlist = res.data.users
        this.total = res.data.total
      }
    },
    // 监听pageSize的参数对象
    handleSizeChange(newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听 页码值 的改变
    handleCurrentChange(newPage) {
      // console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听 switch 开关状态的改变
    async userStateChange(userInfo) {
      // console.log(userInfo)
      // 修改数据库内用户状态
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新用户状态失败')
      } else {
        this.$message.success('更新用户状态成功')
      }
    },
    //
    queryUserList() {
      this.queryInfo.pagenum = 1
      this.getUserList()
      this.queryInfo.query = ''
    },
    // 监听添加用户对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮，添加新用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return
        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败')
        } else {
          this.$message.success('添加用户成功')
          // 隐藏添加用户对话框
          this.addDialogVisible = false
          // 重新获取列表数据
          this.getUserList()
        }
      })
    },
    // 展示编辑用户的对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }
      this.editForm = res.data
      this.editDialogVisable = true
      // console.log(id)
    },
    // 监听修改用户对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息并提交
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return
        }

        // 发起修改用户的请求
        const { data: res } = await this.$http.put('users/' + this.editForm.id,
          { email: this.editForm.email, mobile: this.editForm.mobile })
        if (res.meta.status !== 200) {
          return this.$message.error('修改用户信息失败')
        }
        // 关闭对话框
        this.editDialogVisable = false
        // 重新获取数据列表
        this.getUserList()
        // 修改用户信息成功
        this.$message.success('修改用户信息成功')
      })
    },
    // 根据用户ID删除对应的用户信息
    async removeUserById(id) {
      // 弹框询问用户是否删除数据
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => {
        return err
      })
      // 如果用户确认删除，则返回值为字符串 confirm
      // 如果用户取消删除，则返回值为字符串 cancle（需要用catch捕获）
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败')
      } else {
        this.$message.success('删除用户成功')
        // 重新获取列表数据
        this.getUserList()
      }
    },
    // 展示分配角色对话框
    async setRole(userInfo) {
      this.userInfo = userInfo
      // 在展示对话框之前获取所有的角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.rolesList = res.data
      this.setRoleDialogVisible = true
    },
    async saveRoleInfo() {
      if (!this.selectRoleId) {
        return this.$message.error('请选择要分配的角色！')
      }
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`,
        { rid: this.selectRoleId })
      if (res.meta.status !== 200) {
        return this.$message.error('更新角色失败')
      }
      this.$message.success('获取用户列表成功')
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    // 监听分配角色对话框的关闭事件
    setRoleDialogClosed() {
      this.selectRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>

<style lang = "less" scoped>
.el-pagination {
  margin-top: 15px;
}

/deep/ .el-card__body {
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

/deep/ .el-pagination__sizes {
  margin-right: 10px;
}
</style>
