<template>
  <div>
    <el-card>
      <el-alert title = "添加商品信息" type = "info" center show-icon :closable = "false"></el-alert>
      <!--步骤条区域-->
      <el-steps :space = "200" :active = "activeIndex - 0" finish-status = "success" align-center>
        <el-step title = "基本信息"></el-step>
        <el-step title = "商品参数"></el-step>
        <el-step title = "商品属性"></el-step>
        <el-step title = "商品图片"></el-step>
        <el-step title = "商品内容"></el-step>
        <el-step title = "完成"></el-step>
      </el-steps>
      <el-form :model = "addForm" :rules = "addFormRules" ref = "addFormRef" label-width = "100px"
               label-position = "top">
        <el-tabs :tab-position = "'left'" v-model = "activeIndex" :before-leave = "beforeTabLeave"
                 @tab-click = "tabClicked">
          <el-tab-pane label = "基本信息" name = "0">
            <el-form-item label = "商品分类" prop = "goods_cat">
              <el-cascader
                v-model = "addForm.goods_cat"
                :options = "cateList"
                :props = "{ expandTrigger: 'hover',label: 'cat_name',value: 'cat_id',children: 'children'}"
                @change = "handleChange"
                clearable>
              </el-cascader>
            </el-form-item>
            <el-form-item label = "商品名称" prop = "goods_name">
              <el-input v-model = "addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label = "商品价格（元）" prop = "goods_price">
              <el-input v-model = "addForm.goods_price" type = "number"></el-input>
            </el-form-item>
            <el-form-item label = "商品数量" prop = "goods_number">
              <el-input v-model = "addForm.goods_number" type = "number"></el-input>
            </el-form-item>
            <el-form-item label = "商品重量" prop = "goods_weight">
              <el-input v-model = "addForm.goods_weight" type = "number"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label = "商品参数" name = "1">
            <!--渲染表单的Item项-->
            <el-form-item :label = "item.attr_name" v-for = "item in manyTableData" :key = "item.attr_id">
              <el-checkbox-group v-model = "item.attr_vals">
                <el-checkbox :label = "cb" v-for = "(cb,i) in item.attr_vals" :key = "i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label = "商品属性" name = "2">
            <el-form-item :label = "item.attr_name" v-for = "item in onlyTableData" :key = "item.attr_id">
              <el-input v-model = "item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label = "商品图片" name = "3">
            <!--action表示图片要上传到的后台api地址-->
            <el-upload
              class = "upload-demo"
              :action = "uploadURL"
              :headers = "headerObj"
              :on-success = "handleSuccess"
              :on-preview = "handlePictureCardPreview"
              :on-remove = "handleRemove"
              list-type = "picture-card">
              <i class = "el-icon-plus"></i>
            </el-upload>
            <el-dialog :visible.sync = "dialogVisible" width="50%">
              <img width = "100%" :src = "dialogImageUrl" alt = "">
            </el-dialog>
          </el-tab-pane>
          <el-tab-pane label = "商品内容" name = "4">
            <!--富文本编辑器组件-->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!--添加商品按钮-->
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  name: 'AddGoods',
  data() {
    return {
      activeIndex: '0',
      // 添加商品的数据对象
      addForm: {
        goods_name: '',
        goods_price: null,
        goods_number: null,
        goods_weight: null,
        // 商品分类选择的值（数组）
        goods_cat: [],
        // 图片数组
        pics: [],
        //  商品的详情描述
        goods_introduce: '',
        attrs: []
      },
      // 验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 商品分类列表
      cateList: [],
      // 动态参数列表数据
      manyTableData: [],
      // 静态属性数据
      onlyTableData: [],
      uploadURL: '/api/private/v1/upload',
      // 图片上传组件的headers 请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 预览框的显示
      dialogVisible: false,
      dialogImageUrl: '',
      disabled: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败')
      }
      // console.log(res.data)
      // 把数据列表赋值
      this.cateList = res.data
    },
    // 级联选择器选中项发生变化，会触发这个函数
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
      // console.log(this.addForm.goods_cat)
    },
    beforeTabLeave(activeName, oldActiveName) {
      // console.log('即将进入的标签页为：' + activeName)
      // console.log('即将离开的标签页为：' + oldActiveName)
      let flag = false
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          this.$message.error('请填写完整的商品基本信息')
        } else {
          flag = true
        }
      })
      return flag
    },
    async tabClicked() {
      // console.log(this.activeIndex)
      // === 1 证明访问的是动态参数面板
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败')
        }
        console.log(res.data)
        res.data.forEach(item => {
          if (item.attr_vals) {
            // 将返回数据中的字符串 attr_vals 分割得到数组，提供给 多选框组（el-checkbox-group）使用
            item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
          }
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`,
          { params: { sel: 'only' } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性失败')
        }
        console.log(res.data)
        this.onlyTableData = res.data
      }
    },
    // 处理图片预览效果
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    // 处理移除图片的操作
    handleRemove(file) {
      // console.log(file)
      //  1、获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      //  2、从pics数组中，找到这个图片对应的索引值
      const picIndex = this.addForm.pics.findIndex(x =>
        x.pic === filePath
      )
      //  3、调用数组的 splice 方法，把图片信息对象从数组中移除
      this.addForm.pics.splice(picIndex, 1)
      console.log(this.addForm)
    },
    // 监听图片上传成功事件
    handleSuccess(response) {
      console.log(response)
      // 1、拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      //   2、将图片信息对象，push到 pics[]数组中
      this.addForm.pics.push(picInfo)
      console.log(this.addForm)
    },
    // 添加商品
    add() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项')
        }
        // 商品分类级联选择器要求goods_cat为数组，而发起请求的数据goods_cat为字符串，
        // 深拷贝addForm对象处理此问题
        // lodash  cloneDeep(obj)
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals.join(' ') }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        // console.log(form)
        //  发起请求
        //  商品的名称，必须是唯一的
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败！')
        }
        this.$message.success('添加商品成功！')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang = "less" scoped>
.el-checkbox {
  margin: 0 10px 10px 0 !important;
}
.btnAdd{
  margin-top: 15px;
}
</style>
