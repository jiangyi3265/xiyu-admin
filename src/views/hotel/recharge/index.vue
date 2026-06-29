<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
         <el-form-item label="标题" prop="title">
            <el-input
               v-model="queryParams.title"
               placeholder="请输入标题"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="充值套餐状态" clearable style="width: 240px">
               <el-option
                  v-for="dict in sys_normal_disable"
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
               type="primary"
               plain
               icon="Plus"
               @click="handleAdd"
               v-hasPermi="['hotel:recharge:add']"
            >新增</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="success"
               plain
               icon="Edit"
               :disabled="single"
               @click="handleUpdate"
               v-hasPermi="['hotel:recharge:edit']"
            >修改</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['hotel:recharge:remove']"
            >删除</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['hotel:recharge:export']"
            >导出</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="rechargeList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="主键" align="center" prop="rechargeId" />
         <el-table-column label="标题" align="center" prop="title" :show-overflow-tooltip="true" />
         <el-table-column label="充值金额" align="center" prop="amount" />
         <el-table-column label="赠送金额" align="center" prop="give" />
         <el-table-column label="赠送券" align="center" prop="coupon" />
         <el-table-column label="时长" align="center" prop="hours" />
         <el-table-column label="热门" align="center" prop="hot">
            <template #default="scope">
               <span>{{ scope.row.hot == '1' ? '是' : '否' }}</span>
            </template>
         </el-table-column>
         <el-table-column label="排序" align="center" prop="sort" />
         <el-table-column label="状态" align="center" prop="status">
            <template #default="scope">
               <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
            </template>
         </el-table-column>
         <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['hotel:recharge:edit']">修改</el-button>
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['hotel:recharge:remove']">删除</el-button>
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

      <!-- 添加或修改充值套餐对话框 -->
      <el-dialog :title="title" v-model="open" width="500px" append-to-body>
         <el-form ref="rechargeRef" :model="form" :rules="rules" label-width="90px">
            <el-form-item label="标题" prop="title">
               <el-input v-model="form.title" placeholder="请输入标题" />
            </el-form-item>
            <el-form-item label="充值金额" prop="amount">
               <el-input-number v-model="form.amount" :min="0" :precision="2" controls-position="right" />
            </el-form-item>
            <el-form-item label="赠送金额" prop="give">
               <el-input-number v-model="form.give" :min="0" :precision="2" controls-position="right" />
            </el-form-item>
            <el-form-item label="赠送券" prop="coupon">
               <el-input-number v-model="form.coupon" :min="0" controls-position="right" />
            </el-form-item>
            <el-form-item label="时长" prop="hours">
               <el-input-number v-model="form.hours" :min="0" controls-position="right" />
            </el-form-item>
            <el-form-item label="热门" prop="hot">
               <el-radio-group v-model="form.hot">
                  <el-radio value="1">是</el-radio>
                  <el-radio value="0">否</el-radio>
               </el-radio-group>
            </el-form-item>
            <el-form-item label="赠品名称" prop="giftName">
               <el-input v-model="form.giftName" placeholder="请输入赠品名称" />
            </el-form-item>
            <el-form-item label="赠品价值" prop="giftPrice">
               <el-input-number v-model="form.giftPrice" :min="0" :precision="2" controls-position="right" />
            </el-form-item>
            <el-form-item label="赠品数量" prop="giftQty">
               <el-input-number v-model="form.giftQty" :min="0" controls-position="right" />
            </el-form-item>
            <el-form-item label="赠品有效期" prop="giftValid">
               <el-input v-model="form.giftValid" placeholder="请输入赠品有效期" />
            </el-form-item>
            <el-form-item label="排序" prop="sort">
               <el-input-number v-model="form.sort" :min="0" controls-position="right" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
               <el-radio-group v-model="form.status">
                  <el-radio
                     v-for="dict in sys_normal_disable"
                     :key="dict.value"
                     :value="dict.value"
                  >{{ dict.label }}</el-radio>
               </el-radio-group>
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

<script setup name="Recharge">
import { listRecharge, getRecharge, delRecharge, addRecharge, updateRecharge } from "@/api/hotel/recharge"

const { proxy } = getCurrentInstance()
const { sys_normal_disable, sys_yes_no } = proxy.useDict("sys_normal_disable", "sys_yes_no")

const rechargeList = ref([])
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
    title: undefined,
    status: undefined
  },
  rules: {
    title: [{ required: true, message: "标题不能为空", trigger: "blur" }],
    amount: [{ required: true, message: "充值金额不能为空", trigger: "blur" }]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询充值套餐列表 */
function getList() {
  loading.value = true
  listRecharge(queryParams.value).then(response => {
    rechargeList.value = response.rows
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
    rechargeId: undefined,
    title: undefined,
    amount: undefined,
    give: undefined,
    coupon: undefined,
    hours: undefined,
    hot: "0",
    giftName: undefined,
    giftPrice: undefined,
    giftQty: undefined,
    giftValid: undefined,
    sort: 0,
    status: "0",
    remark: undefined
  }
  proxy.resetForm("rechargeRef")
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
  ids.value = selection.map(item => item.rechargeId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加充值套餐"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const rechargeId = row.rechargeId || ids.value
  getRecharge(rechargeId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改充值套餐"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["rechargeRef"].validate(valid => {
    if (valid) {
      if (form.value.rechargeId != undefined) {
        updateRecharge(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addRecharge(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const rechargeIds = row.rechargeId || ids.value
  proxy.$modal.confirm('是否确认删除充值套餐编号为"' + rechargeIds + '"的数据项？').then(function () {
    return delRecharge(rechargeIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download("hotel/recharge/export", {
    ...queryParams.value
  }, `recharge_${new Date().getTime()}.xlsx`)
}

getList()
</script>
