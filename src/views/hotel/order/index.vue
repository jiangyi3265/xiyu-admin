<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
         <el-form-item label="订单号" prop="orderNo">
            <el-input
               v-model="queryParams.orderNo"
               placeholder="请输入订单号"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="会员姓名" prop="memberName">
            <el-input
               v-model="queryParams.memberName"
               placeholder="请输入会员姓名"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="订单状态" clearable style="width: 200px">
               <el-option
                  v-for="dict in lwf_order_status"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item label="种类" prop="kind">
            <el-input
               v-model="queryParams.kind"
               placeholder="请输入种类"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['hotel:order:remove']"
            >删除</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['hotel:order:export']"
            >导出</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="orderList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="订单编号" align="center" prop="orderId" />
         <el-table-column label="订单号" align="center" prop="orderNo" :show-overflow-tooltip="true" />
         <el-table-column label="会员姓名" align="center" prop="memberName" />
         <el-table-column label="标题" align="center" prop="title" :show-overflow-tooltip="true" />
         <el-table-column label="种类" align="center" prop="kind" />
         <el-table-column label="场景" align="center" prop="scene" />
         <el-table-column label="支付金额" align="center" prop="payAmount" />
         <el-table-column label="状态" align="center" prop="status">
            <template #default="scope">
               <dict-tag :options="lwf_order_status" :value="scope.row.status" />
            </template>
         </el-table-column>
         <el-table-column label="创建时间" align="center" prop="createTime" width="180">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="操作" align="center" width="220" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button
                  v-if="scope.row.status === 'refund_apply'"
                  link
                  type="success"
                  icon="CircleCheck"
                  @click="handleApproveRefund(scope.row)"
                  v-hasPermi="['hotel:order:edit']"
               >同意退款</el-button>
               <el-button
                  v-if="scope.row.status === 'refund_apply'"
                  link
                  type="warning"
                  icon="CircleClose"
                  @click="handleRejectRefund(scope.row)"
                  v-hasPermi="['hotel:order:edit']"
               >驳回</el-button>
               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['hotel:order:edit']">修改</el-button>
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['hotel:order:remove']">删除</el-button>
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

      <!-- 修改订单对话框 -->
      <el-dialog :title="title" v-model="open" width="500px" append-to-body>
         <el-form ref="orderRef" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="订单号" prop="orderNo">
               <el-input v-model="form.orderNo" placeholder="请输入订单号" disabled />
            </el-form-item>
            <el-form-item label="会员姓名" prop="memberName">
               <el-input v-model="form.memberName" placeholder="请输入会员姓名" disabled />
            </el-form-item>
            <el-form-item label="标题" prop="title">
               <el-input v-model="form.title" placeholder="请输入标题" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
               <el-select v-model="form.status" placeholder="请选择订单状态">
                  <el-option
                     v-for="dict in lwf_order_status"
                     :key="dict.value"
                     :label="dict.label"
                     :value="dict.value"
                  />
               </el-select>
            </el-form-item>
            <el-form-item label="支付金额" prop="payAmount">
               <el-input-number v-model="form.payAmount" controls-position="right" :min="0" :precision="2" />
            </el-form-item>
            <el-form-item label="关联订单" prop="refId">
               <el-input v-model="form.refId" placeholder="储值退款关联的原充值订单ID" disabled />
            </el-form-item>
            <el-form-item label="标签文本" prop="tagText">
               <el-input v-model="form.tagText" placeholder="请输入标签文本" />
            </el-form-item>
            <el-form-item label="备注" prop="remark">
               <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
            </el-form-item>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">确 定</el-button>
               <el-button @click="cancel">取 消</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="Order">
import { ElMessageBox } from "element-plus"
import { listOrder, getOrder, delOrder, updateOrder, approveRefund, rejectRefund } from "@/api/hotel/order"

const { proxy } = getCurrentInstance()
const { lwf_order_status } = proxy.useDict("lwf_order_status")

const orderList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderNo: undefined,
    memberName: undefined,
    status: undefined,
    kind: undefined
  },
  rules: {
    status: [{ required: true, message: "订单状态不能为空", trigger: "change" }]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询订单列表 */
function getList() {
  loading.value = true
  listOrder(queryParams.value).then(response => {
    orderList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.value = {
    orderId: undefined,
    orderNo: undefined,
    memberName: undefined,
    title: undefined,
    status: undefined,
    payAmount: undefined,
    refId: undefined,
    tagText: undefined,
    remark: undefined
  }
  proxy.resetForm("orderRef")
}

/** 同意退款 */
function handleApproveRefund(row) {
  proxy.$modal.confirm('确认同意订单 "' + row.orderNo + '" 的退款申请？同意后会执行微信退款/扣减储值余额。').then(function () {
    return approveRefund(row.orderId)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("退款已通过")
  }).catch(() => {})
}

/** 驳回退款 */
function handleRejectRefund(row) {
  ElMessageBox.prompt('请输入驳回原因', '驳回退款', {
    confirmButtonText: '确认驳回',
    cancelButtonText: '取消',
    inputPlaceholder: '例如：已超过可退规则'
  }).then(({ value }) => {
    return rejectRefund(row.orderId, value || '')
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("已驳回退款")
  }).catch(() => {})
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

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.orderId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const orderId = row.orderId || ids.value
  getOrder(orderId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改订单"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["orderRef"].validate(valid => {
    if (valid) {
      updateOrder(form.value).then(() => {
        proxy.$modal.msgSuccess("修改成功")
        open.value = false
        getList()
      })
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const orderIds = row.orderId || ids.value
  proxy.$modal.confirm('是否确认删除订单编号为"' + orderIds + '"的数据项？').then(function () {
    return delOrder(orderIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download("hotel/order/export", {
    ...queryParams.value
  }, `order_${new Date().getTime()}.xlsx`)
}

getList()
</script>
