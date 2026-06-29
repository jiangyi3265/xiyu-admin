<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
         <el-form-item label="会员编号" prop="memberId">
            <el-input
               v-model="queryParams.memberId"
               placeholder="请输入会员编号"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="类型" prop="type">
            <el-select v-model="queryParams.type" placeholder="积分类型" clearable style="width: 200px">
               <el-option
                  v-for="dict in lwf_point_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['hotel:pointlog:export']"
            >导出</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="pointlogList">
         <el-table-column label="记录编号" align="center" prop="logId" />
         <el-table-column label="会员编号" align="center" prop="memberId" />
         <el-table-column label="类型" align="center" prop="type">
            <template #default="scope">
               <dict-tag :options="lwf_point_type" :value="scope.row.type" />
            </template>
         </el-table-column>
         <el-table-column label="标题" align="center" prop="title" :show-overflow-tooltip="true" />
         <el-table-column label="积分" align="center" prop="points" />
         <el-table-column label="创建时间" align="center" prop="createTime" width="180">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
      </el-table>

      <pagination
         v-show="total > 0"
         :total="total"
         v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize"
         @pagination="getList"
      />
   </div>
</template>

<script setup name="Pointlog">
import { listPointlog } from "@/api/hotel/pointlog"

const { proxy } = getCurrentInstance()
const { lwf_point_type } = proxy.useDict("lwf_point_type")

const pointlogList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    memberId: undefined,
    type: undefined
  }
})

const { queryParams } = toRefs(data)

/** 查询积分记录列表 */
function getList() {
  loading.value = true
  listPointlog(queryParams.value).then(response => {
    pointlogList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download("hotel/pointlog/export", {
    ...queryParams.value
  }, `pointlog_${new Date().getTime()}.xlsx`)
}

getList()
</script>
