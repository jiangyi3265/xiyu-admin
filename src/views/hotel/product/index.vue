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
         <el-form-item label="类型" prop="type">
            <el-select v-model="queryParams.type" placeholder="套餐类型" clearable style="width: 240px">
               <el-option
                  v-for="dict in lwf_product_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="套餐状态" clearable style="width: 240px">
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
               v-hasPermi="['hotel:product:add']"
            >新增</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="success"
               plain
               icon="Edit"
               :disabled="single"
               @click="handleUpdate"
               v-hasPermi="['hotel:product:edit']"
            >修改</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['hotel:product:remove']"
            >删除</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['hotel:product:export']"
            >导出</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="productList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="主键" align="center" prop="productId" />
         <el-table-column label="类型" align="center" prop="type">
            <template #default="scope">
               <dict-tag :options="lwf_product_type" :value="scope.row.type" />
            </template>
         </el-table-column>
         <el-table-column label="标题" align="center" prop="title" :show-overflow-tooltip="true" />
         <el-table-column label="价格" align="center" prop="price" />
         <el-table-column label="原价" align="center" prop="oldPrice" />
         <el-table-column label="适用人数" align="center" prop="people" />
         <el-table-column label="排序" align="center" prop="sort" />
         <el-table-column label="状态" align="center" prop="status">
            <template #default="scope">
               <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
            </template>
         </el-table-column>
         <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['hotel:product:edit']">修改</el-button>
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['hotel:product:remove']">删除</el-button>
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

      <!-- 添加或修改套餐对话框 -->
      <el-dialog :title="title" v-model="open" width="600px" append-to-body>
         <el-form ref="productRef" :model="form" :rules="rules" label-width="90px">
            <el-form-item label="类型" prop="type">
               <el-select v-model="form.type" placeholder="请选择类型" style="width: 100%">
                  <el-option
                     v-for="dict in lwf_product_type"
                     :key="dict.value"
                     :label="dict.label"
                     :value="dict.value"
                  />
               </el-select>
            </el-form-item>
            <el-form-item label="标题" prop="title">
               <el-input v-model="form.title" placeholder="请输入标题" />
            </el-form-item>
            <el-form-item label="主标题" prop="main">
               <el-input v-model="form.main" placeholder="请输入主标题" />
            </el-form-item>
            <el-form-item label="副标题" prop="sub">
               <el-input v-model="form.sub" placeholder="请输入副标题" />
            </el-form-item>
            <el-form-item label="主题" prop="theme">
               <el-select v-model="form.theme" placeholder="请选择主题" style="width: 100%">
                  <el-option label="中国红" value="red" />
                  <el-option label="酒红" value="wine" />
               </el-select>
            </el-form-item>
            <el-form-item label="角标" prop="badge">
               <el-input v-model="form.badge" placeholder="请输入角标" />
            </el-form-item>
            <el-form-item label="场景" prop="scene">
               <el-select v-model="form.scene" placeholder="请选择场景" style="width: 100%">
                  <el-option
                     v-for="dict in lwf_scene"
                     :key="dict.value"
                     :label="dict.label"
                     :value="dict.value"
                  />
               </el-select>
            </el-form-item>
            <el-form-item label="价格" prop="price">
               <el-input-number v-model="form.price" :min="0" :precision="2" controls-position="right" />
            </el-form-item>
            <el-form-item label="原价" prop="oldPrice">
               <el-input-number v-model="form.oldPrice" :min="0" :precision="2" controls-position="right" />
            </el-form-item>
            <el-form-item label="适用人数" prop="people">
               <el-input v-model="form.people" placeholder="请输入适用人数" />
            </el-form-item>
            <el-form-item label="条款" prop="terms">
               <el-input v-model="form.terms" type="textarea" placeholder="多个条款用；分隔" />
            </el-form-item>
            <el-form-item label="包含项目" prop="items">
               <el-input v-model="form.items" type="textarea" placeholder="多个项目用逗号分隔" />
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

<script setup name="Product">
import { listProduct, getProduct, delProduct, addProduct, updateProduct } from "@/api/hotel/product"

const { proxy } = getCurrentInstance()
const { lwf_product_type, sys_normal_disable, lwf_scene } = proxy.useDict("lwf_product_type", "sys_normal_disable", "lwf_scene")

const productList = ref([])
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
    type: undefined,
    status: undefined
  },
  rules: {
    title: [{ required: true, message: "标题不能为空", trigger: "blur" }],
    price: [{ required: true, message: "价格不能为空", trigger: "blur" }]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询套餐列表 */
function getList() {
  loading.value = true
  listProduct(queryParams.value).then(response => {
    productList.value = response.rows
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
    productId: undefined,
    type: "dish",
    title: undefined,
    main: undefined,
    sub: undefined,
    theme: undefined,
    badge: undefined,
    scene: undefined,
    price: undefined,
    oldPrice: undefined,
    people: undefined,
    terms: undefined,
    items: undefined,
    sort: 0,
    status: "0",
    remark: undefined
  }
  proxy.resetForm("productRef")
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
  ids.value = selection.map(item => item.productId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加套餐"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const productId = row.productId || ids.value
  getProduct(productId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改套餐"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["productRef"].validate(valid => {
    if (valid) {
      if (form.value.productId != undefined) {
        updateProduct(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addProduct(form.value).then(response => {
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
  const productIds = row.productId || ids.value
  proxy.$modal.confirm('是否确认删除套餐编号为"' + productIds + '"的数据项？').then(function () {
    return delProduct(productIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download("hotel/product/export", {
    ...queryParams.value
  }, `product_${new Date().getTime()}.xlsx`)
}

getList()
</script>
