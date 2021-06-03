<template>
  <div>
    <el-card>
      <!--搜索与添加区域-->
      <el-row :gutter = "20">
        <el-col :span = "2">
          <el-input clearable @clear = "getGoodsList" @keydown.enter.native = "queryGoodsList" placeholder = "请输入商品名称"
                    v-model = "queryInfo.title">
          </el-input>
        </el-col>
        <el-col :span = "2">
          <el-input clearable @clear = "getGoodsList" @keydown.enter.native = "queryGoodsList" placeholder = "请输入商品卖点"
                    v-model = "queryInfo.sellPoint">
          </el-input>
        </el-col>
        <el-col :span = "2">
          <el-input clearable @clear = "getGoodsList" @keydown.enter.native = "queryGoodsList" placeholder = "请输入商品起始价钱"
                    v-model = "queryInfo.beginPrice">
          </el-input>
        </el-col>
        <el-col :span = "2">
          <el-input clearable @clear = "getGoodsList" @keydown.enter.native = "queryGoodsList" placeholder = "请输入商品结束价钱"
                    v-model = "queryInfo.endPrice">
          </el-input>
        </el-col>
        <el-col :span = "2">
          <el-input clearable @clear = "getGoodsList" @keydown.enter.native = "queryGoodsList" placeholder = "请输入商品分类"
                    v-model = "queryInfo.catalog">
          </el-input>
        </el-col>
        <el-col :span = "2">
          <el-input clearable @clear = "getGoodsList" @keydown.enter.native = "queryGoodsList" placeholder = "请输入商品描述"
                    v-model = "queryInfo.itemDesc">
          </el-input>
        </el-col>
        <el-col :span = "1.5">
          <el-button @click = "queryGoodsList" type = "primary">查询商品</el-button>
        </el-col>
        <el-col :span = "1">
          <el-button @click = "goAddPage" type = "primary">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 商品列表区域 -->
      <el-table :data = "goodslist" border stripe max-height = "500">
        <el-table-column type = "index" label = "#"></el-table-column>
        <el-table-column label = "商品名称" prop = "title"></el-table-column>
        <el-table-column label = "商品卖点" prop = "sellPoint"></el-table-column>
        <el-table-column label = "价格（元）" prop = "price" width = "90px"></el-table-column>
        <el-table-column label = "商品数量" prop = "num" width = "70px"></el-table-column>
        <el-table-column label = "限购数量" prop = "limitNum" width = "70px"></el-table-column>
        <el-table-column label = "商品分类" prop = "catalog" width = "70px"></el-table-column>
        <!-- <el-table-column label = "商品描述" prop = "itemDesc" width = "70px"></el-table-column> -->
        <el-table-column label="商品图片">
          <template slot-scope="scope">
            <img v-for="item in scope.row.image" v-bind:key="item" :src="item" width="40" height="40" class="head_pic"/>
          </template>
        </el-table-column>
        <el-table-column property="menusstate" label="是否上架">
          <template scope="scope">
            <el-switch
                :active-value = "1"
                :inactive-value = "0"
                v-model="scope.row.status"
                @change=change(scope.$index,scope.row)>
            </el-switch>
          </template>
        </el-table-column>
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
        :current-page = "queryInfo.pageIndex"
        :page-sizes = "[4, 6, 8, 10]"
        :page-size = "queryInfo.pageSize"
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
        itemDesc: '',
        catalog: '',
        sellPoint: '',
        beginPrice: null,
        endPrice: null,
        title: '',
        // 当前页码
        pageIndex: 1,
        // 当前每页显示多少条数据
        pageSize: 10
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
      var that = this
      const { data: res } = await this.$http.post('/item/list', that.queryInfo)
      // console.log(res)
      debugger
      if (res.status !== '200') {
        return this.$message.error('获取商品列表数据失败')
      } else {
        this.goodslist = res.result
        this.total = res.count
      }
    },
    queryGoodsList() {
      this.queryInfo.pageIndex = 1
      this.getGoodsList()
      this.queryInfo.title = ''
      this.queryInfo.sellPoint = ''
      this.queryInfo.catalog = ''
      this.queryInfo.itemDesc = ''
      this.queryInfo.beginPrice = null
      this.queryInfo.endPrice = null
    },
    // 监听pageSize的参数对象
    handleSizeChange(newSize) {
      // console.log(newSize)
      this.queryInfo.pageSize = newSize
      this.getGoodsList()
    },
    // 监听 页码值 的改变
    handleCurrentChange(newPage) {
      // console.log(newPage)
      this.queryInfo.pageIndex = newPage
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
