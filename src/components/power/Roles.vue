<template>
  <div>
    <el-card>
      <el-row>
        <el-col>
          <el-button type = "primary" @click="showAddRole">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data = "rolesList" border stripe max-height = "500">
        <!--展开列-->
        <el-table-column type = "expand" v-slot = "scope">
          <el-row v-for = "(item1,index1) in scope.row.children" :key = "item1.id"
                  :class = "['bd-bottom',index1===0?'bd-top':'','vcenter']">
            <!--渲染一级权限-->
            <el-col :span = "5">
              <el-tag closable @close="removeRightById(scope.row,item1.id)">{{ item1.authName }}</el-tag>
              <i class = "el-icon-caret-right"></i>
            </el-col>
            <!--二级权限-->
            <el-col :span = "19">
              <!--通过 for循环 嵌套渲染二级权限-->
              <el-row v-for = "(item2,index2) in item1.children" :key = "item2.id" :class = "[index2 === 0 ? '' : 'bd-top',
            'vcenter']">
                <el-col :span="6">
                  <el-tag type = "success" closable @close="removeRightById(scope.row,item2.id)">{{ item2.authName }}</el-tag>
                  <i class = "el-icon-caret-right"></i>
                </el-col>
                <el-col :span="18">
                  <el-row v-for = "(item3) in item2.children" :key = "item3.id">
                    <el-tag type="warning" closable @close="removeRightById(scope.row,item3.id)">{{item3.authName}}</el-tag>
                  </el-row>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
          <!--<pre>{{scope.row}}</pre>-->
        </el-table-column>
        <el-table-column type = "index" label = "#"></el-table-column>
        <el-table-column label = "角色名称" prop = "roleName"></el-table-column>
        <el-table-column label = "角色描述" prop = "roleDesc"></el-table-column>
        <el-table-column label = "操作" v-slot = "scope">
          <el-tooltip effect = "dark" content = "编辑" placement = "top" :enterable = "false">
            <el-button @click = "showEditDialog(scope.row.id)" type = "primary" icon = "el-icon-edit"
                       size = "mini">编辑
            </el-button>
          </el-tooltip>
          <el-tooltip effect = "dark" content = "分配角色权限" placement = "top" :enterable = "false">
            <el-button type = "warning" icon = "el-icon-setting" size = "mini"
                       @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </el-tooltip>
          <el-tooltip effect = "dark" content = "删除角色" placement = "top" :enterable = "false">
            <el-button @click = "removeRoleById(scope.row.id)" type = "danger" icon = "el-icon-delete" size = "mini">删除
            </el-button>
          </el-tooltip>
        </el-table-column>
      </el-table>
    </el-card>
    <!--分配权限的对话框-->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%" @close="setRightDialogClosed">
      <!--tree 树形控件-->
      <el-tree ref="treeRef" :data="roleRightsList" :props="treetProps" show-checkbox node-key="id" accordion
               :default-checked-keys="defKeys"></el-tree>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRightDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allowRight">确 定</el-button>
  </span>
    </el-dialog>

    <!--添加角色的对话框-->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisible"
      width="50%" @close="addRoleDialogClosed">
      <!--内容主体区-->
      <el-form :model = "addRoleForm" :rules = "addRoleRules" ref = "addRoleRef" label-width = "100px"
               @keydown.enter.native = "addRole">
        <el-form-item label = "角色名称" prop = "roleName">
          <el-input v-model = "addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label = "角色描述" >
          <el-input v-model = "addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addRole">确 定</el-button>
  </span>
    </el-dialog>
    <!--修改角色信息的对话框-->
    <el-dialog
      title = "修改角色"
      :visible.sync = "editDialogVisable"
      width = "50%"
      @close = "editDialogClosed">
      <el-form :model = "editForm" :rules = "editFormRules" ref = "editFormRef" label-width = "100px">
        <el-form-item label = "角色名称" prop = "roleName">
          <el-input v-model = "editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label = "角色描述" >
          <el-input v-model = "editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot = "footer" class = "dialog-footer">
        <el-button @click = "editDialogVisable = false">取 消</el-button>
        <el-button type = "primary" @click = "editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>

</template>

<script>
export default {
  name: 'Roles',
  data() {
    return {
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加表单的验证规则对象
      addRoleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      },
      // 控制修改角色对话框的显示与隐藏
      editDialogVisable: false,
      // 查询到的用户数据对象
      editForm: {},
      editFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      },
      rolesList: [],
      roleRightsList: [],
      // 控制权限分配对话框的显示与隐藏
      setRightDialogVisible: false,
      deleteRoleDialogVisible: false,
      addRoleDialogVisible: false,
      // 树形控件的属性绑定对象
      treetProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点 Id值 Key
      defKeys: [],
      // 当前即将分配权限的角色ID
      roleId: ''
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    async getRoleList() {
      const { data: res } = await this.$http.get('roles')
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表数据失败')
      } else {
        this.rolesList = res.data
        // console.log(this.rolesList)
      }
    },
    // 添加角色对话框
    showAddRole() {
      this.addRoleDialogVisible = true
    },
    // 添加角色确认
    addRole() {
      this.$refs.addRoleRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return
        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败')
        } else {
          this.$message.success('添加角色成功')
          // 隐藏添加角色对话框
          this.addRoleDialogVisible = false
          // 重新获取列表数据
          this.getRoleList()
        }
      })
    },
    // 添加角色对话框关闭
    addRoleDialogClosed() {
      this.$refs.addRoleRef.resetFields()
    },
    // 展示编辑角色的对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询角色信息失败')
      }
      this.editForm = res.data
      this.editDialogVisable = true
      // console.log(id)
    },
    // 监听修改角色对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改角色信息并提交
    editRoleInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return
        }

        // 发起修改角色的请求
        const { data: res } = await this.$http.put('roles/' + this.editForm.roleId,
          { roleName: this.editForm.roleName, roleDesc: this.editForm.roleDesc })
        if (res.meta.status !== 200) {
          return this.$message.error('修改角色信息失败')
        }
        // 关闭对话框
        this.editDialogVisable = false
        // 重新获取数据列表
        this.getRoleList()
        // 修改角色信息成功
        this.$message.success('修改角色信息成功')
      })
    },
    // 弹框提示是否删除
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm('此操作将删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => {
        return err
      })
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除权限操作')
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      } else {
        // this.getRoleList()
        role.children = res.data
        this.$message.success('删除权限成功')
      }
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      // 获取权限数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.roleRightsList = res.data
      // console.log(this.roleRightsList)
      // console.log(this.roleRightsList[0].id)

      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有三级权限的 ID，并保存到 defKeys 数组中
    getLeafKeys(node, arr) {
      // 如果当前node不包含 children 属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    setRightDialogClosed() {
      this.defKeys = []
      this.setRightDialogVisible = false
    },
    async allowRight() {
      // ... 展开运算符
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // console.log(keys)
      const idStr = keys.join(',')

      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.getRoleList()
      this.setRightDialogVisible = false
    },
    async removeRoleById(id) {
      const confirmResult = await this.$confirm('此操作将删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => {
        return err
      })
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除角色操作')
      }
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败')
      }
      this.$message.success('删除角色成功')
      this.getRoleList()
    }
  }
}
</script>

<style lang = "less" scoped>
.el-tag {
  margin: 7px;
}

.bd-top {
  border-top: 1px solid #eeeeee;
}

.bd-bottom {
  border-bottom: 1px solid #eeeeee;
}
.vcenter{
  display: flex;
  align-items: center;
}
</style>
