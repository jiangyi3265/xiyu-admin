<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
         <el-form-item label="优惠券标题" prop="title">
            <el-input
               v-model="queryParams.title"
               placeholder="请输入优惠券标题"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="类型" prop="cat">
            <el-select v-model="queryParams.cat" placeholder="优惠券类型" clearable style="width: 200px">
               <el-option
                  v-for="dict in lwf_coupon_cat"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="优惠券状态" clearable style="width: 200px">
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
               v-hasPermi="['hotel:coupon:add']"
            >新增</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="success"
               plain
               icon="Edit"
               :disabled="single"
               @click="handleUpdate"
               v-hasPermi="['hotel:coupon:edit']"
            >修改</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['hotel:coupon:remove']"
            >删除</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['hotel:coupon:export']"
            >导出</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="couponList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="优惠券编号" align="center" prop="couponId" />
         <el-table-column label="优惠券标题" align="center" prop="title" :show-overflow-tooltip="true" />
         <el-table-column label="类型" align="center" prop="cat">
            <template #default="scope">
               <dict-tag :options="lwf_coupon_cat" :value="scope.row.cat" />
            </template>
         </el-table-column>
         <el-table-column label="面额" align="center" prop="amount" />
         <el-table-column label="满减门槛" align="center" prop="condAmount" />
         <el-table-column label="有效期至" align="center" prop="validTime" width="180">
            <template #default="scope">
               <span>{{ parseTime(scope.row.validTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="状态" align="center" prop="status">
            <template #default="scope">
               <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
            </template>
         </el-table-column>
         <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['hotel:coupon:edit']">修改</el-button>
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['hotel:coupon:remove']">删除</el-button>
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

      <!-- 添加或修改优惠券对话框 -->
      <el-dialog :title="title" v-model="open" width="500px" append-to-body>
         <el-form ref="couponRef" :model="form" :rules="rules" label-width="90px">
            <el-form-item label="优惠券标题" prop="title">
               <el-input v-model="form.title" placeholder="请输入优惠券标题" />
            </el-form-item>
            <el-form-item label="类型" prop="cat">
               <el-select v-model="form.cat" placeholder="请选择优惠券类型">
                  <el-option
                     v-for="dict in lwf_coupon_cat"
                     :key="dict.value"
                     :label="dict.label"
                     :value="dict.value"
                  />
               </el-select>
            </el-form-item>
            <el-form-item label="面额" prop="amount">
               <el-input-number v-model="form.amount" controls-position="right" :min="0" :precision="2" />
            </el-form-item>
            <el-form-item label="满减门槛" prop="condAmount">
               <el-input-number v-model="form.condAmount" controls-position="right" :min="0" :precision="2" />
            </el-form-item>
            <el-form-item label="说明" prop="descr">
               <el-input v-model="form.descr" placeholder="请输入说明" />
            </el-form-item>
            <el-form-item label="有效期至" prop="validTime">
               <el-date-picker
                  v-model="form.validTime"
                  type="datetime"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  placeholder="请选择有效期"
               />
            </el-form-item>
            <el-form-item label="发放总量" prop="totalQty">
               <el-input-number v-model="form.totalQty" controls-position="right" :min="-1" />
               <span style="margin-left: 8px; color: #909399;">-1 表示不限</span>
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

<script setup name="Coupon">
import { listCoupon, getCoupon, delCoupon, addCoupon, updateCoupon } from "@/api/hotel/coupon"

const { proxy } = getCurrentInstance()
const { lwf_coupon_cat, sys_normal_disable } = proxy.useDict("lwf_coupon_cat", "sys_normal_disable")

const couponList = ref([])
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
    cat: undefined,
    status: undefined
  },
  rules: {
    title: [{ required: true, message: "优惠券标题不能为空", trigger: "blur" }],
    amount: [{ required: true, message: "面额不能为空", trigger: "blur" }]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询优惠券列表 */
function getList() {
  loading.value = true
  listCoupon(queryParams.value).then(response => {
    couponList.value = response.rows
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
    couponId: undefined,
    title: undefined,
    cat: "0",
    amount: undefined,
    condAmount: 0,
    descr: undefined,
    validTime: undefined,
    totalQty: -1,
    status: "0",
    remark: undefined
  }
  proxy.resetForm("couponRef")
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
  ids.value = selection.map(item => item.couponId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加优惠券"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const couponId = row.couponId || ids.value
  getCoupon(couponId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改优惠券"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["couponRef"].validate(valid => {
    if (valid) {
      if (form.value.couponId != undefined) {
        updateCoupon(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addCoupon(form.value).then(() => {
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
  const couponIds = row.couponId || ids.value
  proxy.$modal.confirm('是否确认删除优惠券编号为"' + couponIds + '"的数据项？').then(function () {
    return delCoupon(couponIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download("hotel/coupon/export", {
    ...queryParams.value
  }, `coupon_${new Date().getTime()}.xlsx`)
}

getList()
</script>
