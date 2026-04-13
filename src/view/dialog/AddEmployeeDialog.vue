<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

// 暴露给父组件的输入
const props = defineProps({
  modelValue: Boolean, // 控制弹窗显示隐藏 (v-model 默认名)
  initialData: Object, // 父组件传进来的员工数据快照
  title: String,        // 弹窗标题
  isAddEmploy: Boolean //是否是添加员工按钮触发的弹窗？
})

// 定义 Emits：相当于“事件分发器”信号
const emit = defineEmits(['update:modelValue', 'success'])

// 内部响应式变量：本地的草稿本
const form = ref({
  id: null,
  name: '',
  userName: '',
  phone: '',
  gender: 1,
  avatarUrl: '',
  department: '',
  jobTitle: '',
  entryDate: ''
})

// 核心逻辑：监视 initialData。只要父组件传的数据变了，就立刻“复印”一份给本地 form
watch(() => props.initialData, (newVal) => {
  if (newVal) {
    // 使用扩展运算符克隆，断开引用
    form.value = { ...newVal }
  }
}, { deep: true, immediate: true })

// 关闭弹窗的信号处理
const handleClose = () => {
  emit('update:modelValue', false)
}

// 如果是“新增员工“选项，那么需要清除内容
function onDialogOpen(){
  // 已经具有响应式，所以直接清空字段即可
  if (props.isAddEmploy){
    Object.assign(form, {
    name: '', userName: '', phone: '', gender: '1',
    avatarUrl: '', department: '', jobTitle: '', entryDate: ''
  })
  }
}
// 提交逻辑：自适应“新增”或“修改”
const confirmSubmit = async () => {
  try {
    // 根据是否有 id 来判断是调 add 还是 update 接口
    const apiPath = form.value.id ? '/api/employees/update' : '/api/employees/add'
    const res = await axios.post(`http://localhost:8080${apiPath}`, form.value)
    
    if (res.data.code === 1) {
      ElMessage.success(form.value.id ? '修改成功' : '新增成功')
      emit('success') // 发送成功信号，让父组件去刷新列表
      handleClose()   // 关闭弹窗
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('系统错误，请检查网络或后端控制台')
  }
}
</script>

<template>
  <el-dialog 
    :model-value="modelValue" 
    :title="title" 
    width="500px"
    @open="onDialogOpen"
    @close="handleClose">
    <el-form :model="form" label-width="100px">
      <el-form-item label="姓名">
        <el-input v-model="form.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="用户名">
        <el-input v-model="form.userName" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="form.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="性别">
        <el-radio-group v-model="form.gender">
          <el-radio :label="1">男</el-radio>
          <el-radio :label="2">女</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="头像链接">
        <el-input v-model="form.avatarUrl" placeholder="请输入图片URL地址" />
      </el-form-item>
      <el-form-item label="所属部门">
        <el-select v-model="form.department" placeholder="请选择部门" style="width: 100%">
          <el-option label="技术部" value="技术部" />
          <el-option label="市场部" value="市场部" />
          <el-option label="人事部" value="人事部" />
        </el-select>
      </el-form-item>
      <el-form-item label="职位">
        <el-input v-model="form.jobTitle" placeholder="请输入职位" />
      </el-form-item>
      <el-form-item label="入职日期">
        <el-date-picker
          v-model="form.entryDate"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="confirmSubmit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>