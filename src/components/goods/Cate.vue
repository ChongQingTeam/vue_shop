<template>
  <div>
    <el-card class = "box-card">
      <!--搜索与添加区域-->
      <el-row :gutter = "20">
        <el-col :span = "4">
          <el-button @click="showAddDialog" type = "primary">添加分类</el-button>
        </el-col>
      </el-row>
      <tree-table
        class="tree-table"
        :data = "cateList"
        :columns = "columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border>
        <!--是否有效-->
        <template v-slot:isok="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color: lightgreen"></i>
          <i class="el-icon-error" style="color: red" v-else></i>
        </template>
        <!--分级-->
        <template v-slot:order="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag size="mini" v-else-if="scope.row.cat_level===1" type="success">二级</el-tag>
          <el-tag size="mini" v-else type="warning">三级</el-tag>
        </template>
        <!--操作-->
        <template v-slot:opt="scope">
          <el-button @click="showEditCate(scope.row.cat_id)" type="primary" size="mini" icon = "el-icon-edit">编辑</el-button>
          <el-button @click="deleteCateById(scope.row.cat_id)" type="danger" size="mini" icon = "el-icon-delete">删除</el-button>
        </template>
      </tree-table>
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
    <!--添加分类的对话框 -->
    <el-dialog
      title = "添加分类"
      :visible.sync = "addDialogVisible"
      width = "50%"
      @close = "addDialogClosed">
      <!--内容主体区-->
      <el-form :model = "addForm" :rules = "addFormRules" ref = "addFormRef" label-width = "80px"
               @keydown.enter.native = "addCate">
        <el-form-item label = "分类名称" prop = "cat_name">
          <el-input v-model = "addForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label = "父级分类">
          <el-cascader
            v-model="selectKeys"
            :options="parentCateList"
            :props="{ expandTrigger: 'hover',value:'cat_id',label:'cat_name', children:'children' ,checkStrictly:true}"
            @change="parentCateChanged"
            clearable>
          </el-cascader>
        </el-form-item>
      </el-form>
      <!--底部按钮区域-->
      <span slot = "footer" class = "dialog-footer">
        <el-button @click = "addDialogVisible = false">取 消</el-button>
        <el-button type = "primary" @click = "addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!--编辑分类对话框-->
    <el-dialog
      title = "修改分类"
      :visible.sync = "editDialogVisible"
      width = "50%"
      @close = "editDialogClosed">
      <!--内容主体区-->
      <el-form :model = "editCateForm" :rules = "addFormRules" ref = "editFormRef" label-width = "80px"
               @keydown.enter.native = "editCate">
        <el-form-item label = "分类名称" prop = "cat_name">
          <el-input v-model = "editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <!--底部按钮区域-->
      <span slot = "footer" class = "dialog-footer">
        <el-button @click = "editDialogVisible = false">取 消</el-button>
        <el-button type = "primary" @click = "editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Cate',
  data() {
    return {
      queryInfo: {
        // 表示显示 3 层分类列表
        type: 3,
        pagenum: 1,
        pagesize: 6
      },
      // 商品分类的数据列表
      cateList: [],
      // 总数据条数
      total: 0,
      row_id: [],
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 将当前列定义为模板列
          type: 'template',
          template: 'isok'
        },
        {
          label: '分级',
          // 将当前列定义为模板列
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          // 将当前列定义为模板列
          type: 'template',
          template: 'opt'
        }
      ],
      addDialogVisible: false,
      addForm: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0
      },
      addFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类列表
      parentCateList: [],
      // 级联选择器中选中的父级分类id数组
      selectKeys: [],
      // 编辑分类名称对话框数据
      editCateForm: [],
      // 编辑分类名称对话框的显示与隐藏
      editDialogVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      // console.log(res.data)
      // 把数据列表赋值
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 监听pageSize的参数对象
    handleSizeChange(newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听 页码值 的改变
    handleCurrentChange(newPage) {
      // console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 点击按钮，展示添加分类的对话框
    showAddDialog() {
      this.addDialogVisible = true
      // 获取父级分类数据列表
      this.addParentCateList()
    },
    // 监听添加分类对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
      this.selectKeys = []
      this.addForm.cat_pid = 0
      this.addForm.cat_level = 0
    },
    // 点击按钮，获取添加分类弹框
    async addParentCateList() {
      // 可以发起添加分类的网络请求
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败')
      }
      this.parentCateList = res.data
      // console.log(this.parentCateList)
    },
    // 选择项发生变化触发的函数
    parentCateChanged() {
      // console.log(this.selectKeys)
    // 如果selectKeys数组的 length > 0
      if (this.selectKeys.length > 0) {
        // 父级分类的 ID
        this.addForm.cat_pid = this.selectKeys[this.selectKeys.length - 1]
        // 为当前分类的等级赋值
        this.addForm.cat_level = this.selectKeys.length
      } else {
        this.addForm.cat_pid = 0
        this.addForm.cat_level = 0
      }
    },
    // 点击确定按钮，添加新的分类
    async addCate() {
      this.$refs.addFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addDialogVisible = false
      })
    },
    // 显示编辑分类名称弹框
    async showEditCate(id) {
      // console.log(id)
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取该分类失败')
      }
      this.editCateForm = res.data
      this.editDialogVisible = true
    },
    // 关闭编辑分类名称弹框事件
    editDialogClosed() {
      this.editDialogVisible = false
    },
    // 提交编辑分类数据
    async editCate() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) { return }
        const { data: res } = await this.$http.put('categories/' + this.editCateForm.cat_id,
          { cat_name: this.editCateForm.cat_name })
        if (res.meta.status !== 200) {
          return this.$message.error('编辑该分类失败')
        }
        this.$message.success('编辑该分类成功')
        this.getCateList()
        this.editDialogVisible = false
      })
    },
    // 弹框提示是否删除
    async deleteCateById(id) {
      const confirmResult = await this.$confirm('此操作将删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => {
        return err
      })
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除该分类操作')
      }
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除该分类失败')
      } else {
        // 此处后台如果直接返回的数据为最新的分类列表最好，可以不用再次请求数据
        // 此时列表可以不用再次刷新
        this.getCateList()
        this.$message.success('删除该分类成功')
      }
    }
  }
}
</script>

<style lang = "less" scoped>
.tree-table{
  margin-top: 15px;
}
</style>
