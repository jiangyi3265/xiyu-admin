<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
         <el-form-item label="会员" prop="memberName">
            <el-input v-model="queryParams.memberName" placeholder="请输入会员姓名" clearable @keyup.enter="handleQuery" />
         </el-form-item>
         <el-form-item label="评分" prop="rating">
            <el-select v-model="queryParams.rating" placeholder="评分" clearable style="width: 120px">
               <el-option v-for="n in 5" :key="n" :label="n + ' 星'" :value="n" />
            </el-select>
         </el-form-item>
         <el-form-item label="内容" prop="content">
            <el-input v-model="queryParams.content" placeholder="评价内容关键词" clearable @keyup.enter="handleQuery" />
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['hotel:review:remove']">删除</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['hotel:review:export']">导出</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="reviewList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="评价ID" align="center" prop="reviewId" width="80" />
         <el-table-column label="会员" align="center" prop="memberName" width="120" />
         <el-table-column label="订单标题" align="center" prop="orderTitle" :show-overflow-tooltip="true" />
         <el-table-column label="评分" align="center" prop="rating" width="100">
            <template #default="scope">
               <el-rate :model-value="scope.row.rating" disabled />
            </template>
         </el-table-column>
         <el-table-column label="评价内容" align="center" prop="content" :show-overflow-tooltip="true" />
         <el-table-column label="评价时间" align="center" prop="createTime" width="160" />
         <el-table-column label="操作" align="center" width="120" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="View" @click="handleView(scope.row)" v-hasPermi="['hotel:review:query']">查看</el-button>
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['hotel:review:remove']">删除</el-button>
            </template>
         </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

      <!-- 评价详情 -->
      <el-dialog title="评价详情" v-model="open" width="500px" append-to-body>
         <el-descriptions :column="1" border>
            <el-descriptions-item label="会员">{{ form.memberName }}</el-descriptions-item>
            <el-descriptions-item label="订单标题">{{ form.orderTitle }}</el-descriptions-item>
            <el-descriptions-item label="评分"><el-rate :model-value="form.rating" disabled /></el-descriptions-item>
            <el-descriptions-item label="评价内容">{{ form.content }}</el-descriptions-item>
            <el-descriptions-item label="评价时间">{{ form.createTime }}</el-descriptions-item>
         </el-descriptions>
         <template #footer>
            <el-button @click="open = false">关 闭</el-button>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="Review">
import { listReview, getReview, delReview } from "@/api/hotel/review"

const { proxy } = getCurrentInstance()

const reviewList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const multiple = ref(true)
const total = ref(0)
const form = ref({})

const queryParams = ref({
   pageNum: 1,
   pageSize: 10,
   memberName: undefined,
   rating: undefined,
   content: undefined
})

function getList() {
   loading.value = true
   listReview(queryParams.value).then(response => {
      reviewList.value = response.rows
      total.value = response.total
      loading.value = false
   })
}

function handleQuery() {
   queryParams.value.pageNum = 1
   getList()
}

function resetQuery() {
   proxy.resetForm("queryRef")
   handleQuery()
}

function handleSelectionChange(selection) {
   ids.value = selection.map(item => item.reviewId)
   multiple.value = !selection.length
}

function handleView(row) {
   getReview(row.reviewId).then(response => {
      form.value = response.data
      open.value = true
   })
}

function handleDelete(row) {
   const reviewIds = row.reviewId || ids.value
   proxy.$modal.confirm('是否确认删除选中的评价？').then(function () {
      return delReview(reviewIds)
   }).then(() => {
      getList()
      proxy.$modal.msgSuccess("删除成功")
   }).catch(() => { })
}

function handleExport() {
   proxy.download('hotel/review/export', { ...queryParams.value }, `review_${new Date().getTime()}.xlsx`)
}

getList()
</script>
