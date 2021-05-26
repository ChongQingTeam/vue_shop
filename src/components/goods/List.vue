<template>
  <div>
    <el-card>
      <!--搜索与添加区域-->
      <el-row :gutter = "20">
        <el-col :span = "8">
          <el-input clearable @clear = "getGoodsList" @keydown.enter.native = "queryGoodsList" placeholder = "请输入内容"
                    v-model = "queryInfo.query">
            <el-button @click = "queryGoodsList" slot = "append" icon = "el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span = "4">
          <el-button @click = "goAddPage" type = "primary">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 商品列表区域 -->
      <el-table :data = "goodslist" border stripe max-height = "500">
        <el-table-column type = "index" label = "#"></el-table-column>
        <el-table-column label = "商品名称" prop = "goods_name"></el-table-column>
        <el-table-column label = "价格（元）" prop = "goods_price" width = "90px"></el-table-column>
        <el-table-column label = "商品数量" prop = "goods_number" width = "70px"></el-table-column>
        <el-table-column label = "商品重量" prop = "goods_weight" width = "70px"></el-table-column>
        <el-table-column label = "创建时间" width = "150px" v-slot = "scope">
          {{ scope.row.add_time | dateFormat }}
        </el-table-column>
        <!--独占默认插槽，直接用在组件上-->
        <!--<el-table-column label = "状态" v-slot = "scope">
          &lt;!&ndash;{{scope.row}} 每一行均为一个商品对象&ndash;&gt;
          &lt;!&ndash;从数据库中取回的 goodslist 中的  &ndash;&gt;
          <el-tag type="danger" v-if="scope.row.goods_state==='0'">未通过</el-tag>
          <el-tag type="primary" v-else-if="scope.row.goods_state==='1'">审核中</el-tag>
          <el-tag type="success" v-else-if="scope.row.goods_state==='2'">已审核</el-tag>
          <el-tag type="warning" else>状态未知</el-tag>
        </el-table-column>-->
        <el-table-column label = "操作" class = "" v-slot = "scope" width = "120px">
          <el-button @click = "goEditPage(scope.row.goods_id)" type = "primary" icon = "el-icon-edit"
                     size = "mini"></el-button>
          <el-button @click = "removeGoodsById(scope.row.goods_id)" type = "danger" icon = "el-icon-delete"
                     size = "mini"></el-button>
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
        :total = "total"
        background>
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'List',
  data() {
    return {
      // 获取商品列表的参数对象
      queryInfo: {
        query: '',
        // 当前页码
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 8
      },
      total: 0,
      goodslist: []
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表数据失败')
      } else {
        this.goodslist = res.data.goods
        this.total = res.data.total
      }
    },
    queryGoodsList() {
      this.queryInfo.pagenum = 1
      this.getGoodsList()
      this.queryInfo.query = ''
    },
    // 监听pageSize的参数对象
    handleSizeChange(newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 监听 页码值 的改变
    handleCurrentChange(newPage) {
      // console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // 根据商品ID删除对应的商品信息
    async removeGoodsById(id) {
      // 弹框询问商品是否删除数据
      const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => {
        return err
      })
      // 如果商品确认删除，则返回值为字符串 confirm
      // 如果商品取消删除，则返回值为字符串 cancle（需要用catch捕获）
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('goods/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除商品失败')
      } else {
        this.$message.success('删除商品成功')
        // 重新获取列表数据
        this.getGoodsList()
      }
    },
    // 前往添加商品页面
    goAddPage() {
      this.$router.push('/goods/add')
    },
    // 前往编辑商品页面
    goEditPage(goodsId) {
      // 编程式导航携带参数到 /goods/edit
      // router.js 动态路由配置传参为 props: true
      this.$router.push({ path: `/goods/edit/${goodsId}` })
      // console.log(goodsId)
    }
  }
}
</script>

<style scoped>

</style>
