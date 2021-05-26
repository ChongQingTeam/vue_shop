<template>
  <div>
    <el-card>
      <el-alert
        class = "alert"
        title = "注意：只允许为第三级分类设置相关参数！"
        type = "warning"
        :closable = "false"
        show-icon>
      </el-alert>
      <el-row class = "cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
            v-model = "selectKeys"
            :options = "cateList"
            :props = "{ expandTrigger: 'hover',value:'cat_id',label:'cat_name', children:'children'}"
            @change = "cateChanged"
            clearable
            style = "width: 300px">
          </el-cascader>
        </el-col>
      </el-row>
      <!-- Tabs 标签页 -->
      <el-tabs v-model = "activeName" @tab-click = "handleTabClick">
        <el-tab-pane label = "动态参数" name = "many">
          <el-button @click = "addDialogVisible=true" type = "primary" size = "mini" :disabled = "isBtnDisabled">添加参数
          </el-button>
          <!--动态参数表格-->
          <el-table :data = "manyTableData" border stripe>
            <el-table-column type = "expand" v-slot="scope">
              <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable @close="handleClose(index,scope.row)">
                {{item}}
              </el-tag>
              <!--输入的文本框-->
              <el-input
                class="input-new-tag"
                v-if="scope.row.inputVisible"
                v-model="scope.row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(scope.row)"
                @blur="handleInputConfirm(scope.row)"
              >
              </el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
            </el-table-column>
            <el-table-column type = "index" label = "#"></el-table-column>
            <el-table-column label = "参数名称" prop = "attr_name"></el-table-column>
            <el-table-column label = "操作" v-slot = "scope">
              <el-button @click = "showEditDialog(scope.row.attr_id)" type = "primary" icon = "el-icon-edit"
                         size = "mini">编辑
              </el-button>
              <el-button @click="removeParams(scope.row.attr_id)" type = "danger" icon = "el-icon-delete" size = "mini">删除</el-button>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label = "静态属性" name = "only">
          <el-button @click = "addDialogVisible=true" type = "primary" size = "mini" :disabled = "isBtnDisabled">添加属性
          </el-button>
          <!--静态属性表格-->
          <el-table :data = "onlyTableData" border stripe>
            <el-table-column type = "expand" v-slot="scope">
              <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable @close="handleClose(index,scope.row)">
                {{item}}
              </el-tag>
              <!--输入的文本框-->
              <el-input
                class="input-new-tag"
                v-if="scope.row.inputVisible"
                v-model="scope.row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(scope.row)"
                @blur="handleInputConfirm(scope.row)"
              >
              </el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
            </el-table-column>
            <el-table-column type = "index" label = "#"></el-table-column>
            <el-table-column label = "属性名称" prop = "attr_name"></el-table-column>
            <el-table-column label = "操作" v-slot = "scope">
              <el-button @click = "showEditDialog(scope.row.attr_id)" type = "primary" icon = "el-icon-edit"
                         size = "mini">编辑
              </el-button>
              <el-button @click="removeParams(scope.row.attr_id)" type = "danger" icon = "el-icon-delete" size = "mini">删除</el-button>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!--添加参数的对话框-->
    <el-dialog
      :title = "'添加' + titleText"
      :visible.sync = "addDialogVisible"
      width = "50%"
      @close = "addDialogClosed">
      <!--添加参数的对话框-->
      <el-form :model = "addForm" :rules = "addFormRules" ref = "addFormRef" label-width = "100px">
        <el-form-item :label = "titleText" prop = "attr_name">
          <el-input v-model = "addForm.attr_name" @keydown.native.enter="addParams"></el-input>
        </el-form-item>
      </el-form>
      <span slot = "footer" class = "dialog-footer">
        <el-button @click = "addDialogVisible = false">取 消</el-button>
        <el-button type = "primary" @click = "addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!--修改参数的对话框-->
    <el-dialog
      :title = "'修改' + titleText"
      :visible.sync = "editDialogVisible"
      width = "50%"
      @close = "editDialogClosed">
      <!--修改 参数的对话框-->
      <el-form :model = "editForm" :rules = "editFormRules" ref = "editFormRef" label-width = "100px">
        <el-form-item :label = "titleText" prop = "attr_name">
          <el-input v-model = "editForm.attr_name" @keydown.native.enter="editParams"></el-input>
        </el-form-item>
      </el-form>
      <span slot = "footer" class = "dialog-footer">
        <el-button @click = "editDialogVisible = false">取 消</el-button>
        <el-button type = "primary" @click = "editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Params',
  data() {
    return {
      // 商品分类的数据列表
      cateList: [],
      // 父级分类列表
      parentCateList: [],
      // 级联选择器中选中的父级分类id数组
      selectKeys: [],
      // 被激活标签页名称
      activeName: 'many',
      // 动态参数的数据
      manyTableData: [],
      // 静态数的数据
      onlyTableData: [],
      // 控制添加对话框的显示与隐藏
      addDialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {
        attr_name: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 控制编辑对话框的显示与隐藏
      editDialogVisible: false,
      // 编辑参数的表单数据对象
      editForm: {
        attr_name: ''
      },
      // 编辑表单的验证规则对象
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      // console.log(res.data)
      // 把数据列表赋值
      this.cateList = res.data
    },
    // 选择项发生变化触发的函数
    cateChanged() {
      // console.log(this.selectKeys)
      // 根据所选分类的Id，和当前所处的 Tab 标签页面板，获取对应的参数
      this.getParamsData()
    },
    // Tab 标签页的的处理函数
    handleTabClick() {
      // console.log(this.activeName)
      this.getParamsData()
    },
    async getParamsData() {
      // 根据所选分类的Id，和当前所处的 Tab 标签页面板，获取对应的参数
      if (this.selectKeys.length === 3) {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`,
          { params: { sel: this.activeName } })
        if (res.meta.status !== 200) {
          return this.$message.error(`获取${this.titleText}失败`)
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
          //  控制文本框的显示与隐藏
          item.inputVisible = false
          // 文本框中输入的值
          item.inputValue = ''
        })
        // console.log(res.data)
        if (this.activeName === 'many') {
          this.manyTableData = res.data
        } else {
          this.onlyTableData = res.data
        }
        return
      }
      // 清空selectKeys重置
      this.selectKeys = []
      this.manyTableData = []
      this.onlyTableData = []
      this.$message.warning('请选择第三级分类')
    },
    // 监听对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮，添加参数
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          })
        if (res.meta.status !== 201) {
          return this.$message.error(`添加${this.titleText}失败！`)
        }
        this.$message.success(`添加${this.titleText}成功！`)
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    // 点击按钮，展示修改的对话框
    async showEditDialog(attrId) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`,
        { params: { attr_sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error(`查询该${this.titleText}失败！`)
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 监听对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 点击按钮，添加参数
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          })
        if (res.meta.status !== 200) {
          return this.$message.error(`编辑该${this.titleText}失败！`)
        }
        this.$message.success(`编辑该${this.titleText}成功！`)
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    // 根据 ID 删除对应的参数项
    async removeParams(attrId) {
      const confirmResult = await this.$confirm(`此操作将删除该${this.titleText}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => {
        return err
      })
      if (confirmResult !== 'confirm') {
        return this.$message.info(`取消了删除该${this.titleText}操作`)
      }
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
      if (res.meta.status !== 200) {
        return this.$message.error(`删除该${this.titleText}失败`)
      } else {
        // 此处后台如果直接返回的数据为最新的参数列表最好，可以不用再次请求数据
        // 此时列表可以不用再次刷新
        this.getParamsData()
        this.$message.success(`删除该${this.titleText}成功`)
      }
    },
    // 文本框失去焦点，或按下 enter 键，都会触发
    async handleInputConfirm(row) {
      // console.log('ok')
      row.inputValue = row.inputValue.trim()
      if (row.inputValue.length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果可以运行到此处，说明输入的内容合法
      row.attr_vals.push(row.inputValue)
      row.inputValue = ''
      row.inputVisible = false
      // 需要发起请求，保存这次操作
      this.saveAttrVals(row)
    },
    // 将对 attr_vals 的操作，保存到数据库
    async saveAttrVals(row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: this.activeName,
          attr_vals: row.attr_vals.join(' ')
        })
      if (res.meta.status !== 200) {
        return this.$message.error('修改该标签失败！')
      }
      // this.getParamsData()  // 单人操作，暂且注释，提升体验效果
      this.$message.success('修改该标签成功！')
    },
    // 点击按钮，展示文本输入框
    showInput(row) {
      row.inputVisible = true
      // 让文本自动获得焦点
      // $nextTick 当页面上的元素被重新渲染完毕之后（Input框出现后），才会执行回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除对应的参数可选项
    handleClose(index, row) {
      row.attr_vals.splice(index, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    // 如果需要被禁用，返回true 否则返回 false
    isBtnDisabled() {
      if (this.selectKeys.length !== 3) {
        return true
      }
      return false
    },
    //  当前选中的最后一级分类的 ID
    cateId() {
      if (this.selectKeys.length === 3) {
        return this.selectKeys[2]
      }
      return null
    },
    //  动态计算当前标题文本
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang = "less" scoped>
.alert {
  width: 50%;
}

.cat_opt {
  margin: 15px 0;
}
.el-tag{
  margin-right: 10px;
  margin-bottom: 15px;
}

.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 120px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
