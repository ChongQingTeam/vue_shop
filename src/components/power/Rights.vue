<template>
  <el-card>
    <el-table :data = "rightsList" border stripe>
      <el-table-column type = "index" label = "#"></el-table-column>
      <el-table-column label = "权限名称" prop = "authName"></el-table-column>
      <el-table-column label = "路径" prop = "path"></el-table-column>
      <el-table-column label = "权限等级" prop = "level" v-slot = "scope">
        <el-tag v-if = "scope.row.level==='0'">一级</el-tag>
        <el-tag v-else-if = "scope.row.level==='1'" type = "success">二级</el-tag>
        <el-tag v-else-if = "scope.row.level==='2'" type = "warning">三级</el-tag>
        <el-tag v-else type = "danger">四级</el-tag>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script>
export default {
  name: 'Rights',
  data() {
    return {
      // 权限列表
      rightsList: []
    }
  },
  created() {
    // 获取权限列表
    this.getRightsList()
  },
  methods: {
    async getRightsList() {
      // 获取权限列表
      const { data: res } = await this.$http.get('rights/list')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.rightsList = res.data
      // console.log(this.rightsList)
    }
  }
}
</script>

<style scoped>

</style>
