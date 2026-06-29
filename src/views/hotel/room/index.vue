<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
         <el-form-item label="名称" prop="name">
            <el-input
               v-model="queryParams.name"
               placeholder="请输入客房名称"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="客房状态" clearable style="width: 240px">
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
               v-hasPermi="['hotel:room:add']"
            >新增</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="success"
               plain
               icon="Edit"
               :disabled="single"
               @click="handleUpdate"
               v-hasPermi="['hotel:room:edit']"
            >修改</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['hotel:room:remove']"
            >删除</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['hotel:room:export']"
            >导出</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="roomList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="主键" align="center" prop="roomId" />
         <el-table-column label="名称" align="center" prop="name" :show-overflow-tooltip="true" />
         <el-table-column label="面积" align="center" prop="area" />
         <el-table-column label="床型" align="center" prop="bed" />
         <el-table-column label="价格" align="center" prop="price" />
         <el-table-column label="每日库存" align="center" prop="stock" />
         <el-table-column label="场景" align="center" prop="scene" />
         <el-table-column label="排序" align="center" prop="sort" />
         <el-table-column label="状态" align="center" prop="status">
            <template #default="scope">
               <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
            </template>
         </el-table-column>
         <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['hotel:room:edit']">修改</el-button>
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['hotel:room:remove']">删除</el-button>
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

      <!-- 添加或修改客房对话框 -->
      <el-dialog :title="title" v-model="open" width="600px" append-to-body>
         <el-form ref="roomRef" :model="form" :rules="rules" label-width="90px">
            <el-form-item label="名称" prop="name">
               <el-input v-model="form.name" placeholder="请输入客房名称" />
            </el-form-item>
            <el-form-item label="面积" prop="area">
               <el-input-number v-model="form.area" :min="0" controls-position="right" />
            </el-form-item>
            <el-form-item label="床型" prop="bed">
               <el-input v-model="form.bed" placeholder="请输入床型" />
            </el-form-item>
            <el-form-item label="窗景" prop="win">
               <el-input v-model="form.win" placeholder="请输入窗景" />
            </el-form-item>
            <el-form-item label="价格" prop="price">
               <el-input-number v-model="form.price" :min="0" :precision="2" controls-position="right" />
            </el-form-item>
            <el-form-item label="每日库存" prop="stock">
               <el-input-number v-model="form.stock" :min="0" controls-position="right" />
            </el-form-item>
            <el-form-item label="场景" prop="scene">
               <el-input v-model="form.scene" placeholder="请输入场景（0-3）" />
            </el-form-item>
            <el-form-item label="标签" prop="tags">
               <el-input v-model="form.tags" placeholder="多个标签用逗号分隔" />
            </el-form-item>
            <el-form-item label="特色" prop="feature">
               <el-input v-model="form.feature" type="textarea" placeholder="请输入特色介绍" />
            </el-form-item>
            <el-form-item label="取消规则" prop="cancelRule">
               <el-input v-model="form.cancelRule" placeholder="请输入取消规则" />
            </el-form-item>
            <el-form-item label="设施" prop="facilities">
               <el-input v-model="form.facilities" placeholder="多个设施用逗号分隔" />
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

<script setup name="Room">
import { listRoom, getRoom, delRoom, addRoom, updateRoom } from "@/api/hotel/room"

const { proxy } = getCurrentInstance()
const { sys_normal_disable } = proxy.useDict("sys_normal_disable")

const roomList = ref([])
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
    name: undefined,
    status: undefined
  },
  rules: {
    name: [{ required: true, message: "客房名称不能为空", trigger: "blur" }],
    price: [{ required: true, message: "价格不能为空", trigger: "blur" }]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询客房列表 */
function getList() {
  loading.value = true
  listRoom(queryParams.value).then(response => {
    roomList.value = response.rows
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
    roomId: undefined,
    name: undefined,
    area: undefined,
    bed: undefined,
    win: undefined,
    price: undefined,
    stock: 10,
    scene: undefined,
    tags: undefined,
    feature: undefined,
    cancelRule: undefined,
    facilities: undefined,
    sort: 0,
    status: "0",
    remark: undefined
  }
  proxy.resetForm("roomRef")
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
  ids.value = selection.map(item => item.roomId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加客房"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const roomId = row.roomId || ids.value
  getRoom(roomId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改客房"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["roomRef"].validate(valid => {
    if (valid) {
      if (form.value.roomId != undefined) {
        updateRoom(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addRoom(form.value).then(response => {
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
  const roomIds = row.roomId || ids.value
  proxy.$modal.confirm('是否确认删除客房编号为"' + roomIds + '"的数据项？').then(function () {
    return delRoom(roomIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download("hotel/room/export", {
    ...queryParams.value
  }, `room_${new Date().getTime()}.xlsx`)
}

getList()
</script>
