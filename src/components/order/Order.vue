<template>
  <div>
    <el-card>
      <!--搜索区域-->
      <el-row :gutter = "20">
        <el-col :span = "8">
          <el-input clearable @clear = "getOrderList" @keydown.enter.native = "queryOrderList" placeholder = "请输入内容"
                    v-model = "queryInfo.query">
            <el-button @click = "queryOrderList" slot = "append" icon = "el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单列表区域 -->
      <el-table :data = "orderList" border stripe max-height = "500">
        <el-table-column type = "index" label = "#"></el-table-column>
        <el-table-column label = "订单编号" prop = "order_number"></el-table-column>
        <el-table-column label = "订单价格" prop = "order_price"></el-table-column>
        <el-table-column label = "是否付款" v-slot="scope">
          <el-tag type="danger" v-if="scope.row.pay_status==='0'">未付款</el-tag>
          <el-tag type="success" v-else>已付款</el-tag>
        </el-table-column>
        <el-table-column label = "是否发货" prop = "is_send"></el-table-column>
        <el-table-column label = "下单时间" prop = "create_time"></el-table-column>
        <el-table-column label = "操作" >
          <el-tooltip effect = "dark" content = "修改订单地址" placement = "top" :enterable = "false">
            <el-button @click = "showEditDialog" type = "primary" icon = "el-icon-edit"
                       size = "mini"></el-button>
          </el-tooltip>
          <el-tooltip effect = "dark" content = "物流信息" placement = "top" :enterable = "false">
            <el-button @click="showProgressBox" type = "success" icon = "el-icon-location-outline" size = "mini"></el-button>
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
    <!--修改订单地址的对话框-->
    <el-dialog
      title = "修改订单地址"
      :visible.sync = "addressVisable"
      width = "50%"
      @close = "editDialogClosed">
      <el-form :model = "editForm" :rules = "editFormRules" ref = "editFormRef" label-width = "70px">
        <el-form-item label = "省市区/县" prop = "address1" label-width="100px">
          <el-cascader :options="cityData" v-model="editForm.address1"
                       :props="{ expandTrigger: 'hover' }"></el-cascader>
        </el-form-item>
        <el-form-item label = "详细地址" prop = "address2" label-width="100px">
          <el-input v-model = "editForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot = "footer" class = "dialog-footer">
        <el-button @click = "addressVisable = false">取 消</el-button>
        <el-button type = "primary" @click = "editOrderInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!--展示物流进度的对话框-->
    <el-dialog
      title = "物流进度"
      :visible.sync = "progressVisable"
      width = "50%">
      <!--时间线-->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in wuLiu"
          :key="index"
          :color="activity.color"
          :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from '@/components/order/citydata'
import wuLiu from '@/components/order/wuLiu'
export default {
  name: 'Order',
  data() {
    return {
      orderList: [],
      // 获取订单的参数对象
      queryInfo: {
        query: '',
        // 当前页码
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 8
      },
      total: 0,
      // 控制修改订单地址对话框的显示与隐藏
      addressVisable: false,
      // 查询到的订单地址数据对象
      editForm: {
        address1: [],
        address2: ''
      },
      editFormRules: {
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      cityData,
      wuLiu,
      progressVisable: false,
      // 物流信息
      progressInfo: []
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单数据失败')
      } else {
        this.orderList = res.data.goods
        this.total = res.data.total
      }
    },
    // 查询订单
    queryOrderList() {
      this.queryInfo.pagenum = 1
      this.getOrderList()
      this.queryInfo.query = ''
    },
    // 监听pageSize的参数对象
    handleSizeChange(newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    // 监听 页码值 的改变
    handleCurrentChange(newPage) {
      // console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    // 展示编辑订单地址的对话框
    async showEditDialog() {
      // 未进行实际请求
      // 展示的是省 市区/县联动效果 - 结合ElementUI的 el-cascader 组件
      this.addressVisable = true
      // console.log(id)
    },
    // 监听修改订单地址对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改订单地址并提交
    editOrderInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          this.$message.error('请将表单补充完整')
          return
        }
        // 未进行实际请求修改
        // 展示的是省市区/县联动效果 - 结合ElementUI的 el-cascader 组件
        this.$message.success('未进行实际请求修改操作，仅做展示 省市区/县联动效果')
        // 关闭对话框
        this.editDialogVisable = false
      })
    },
    async showProgressBox() {
      this.progressVisable = true
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader{
  width: 100%;
}
</style>
