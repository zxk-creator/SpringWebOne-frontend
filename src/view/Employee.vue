<template>
  <div class="app-container">
    <el-card class="filter-container">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="姓名">
          <el-input v-model="queryParams.name" placeholder="请输入员工姓名" />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="queryParams.gender" placeholder="请选择" style="width: 120px">
            <el-option label="男" value="1" />
            <el-option label="女" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="入职时间">
          <el-date-picker
            v-model="queryParams.dateRange"
            value-format="YYYY-MM-DD"
            type="daterange"
            range-separator="到"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="performQuery">查询</el-button>
          <el-button @click="clearInput">清空</el-button>
          <el-button type="primary" @click="getAllData">获取所有数据</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="action-bar">
      <el-button type="primary"  @click="handleAdd">＋ 新增员工</el-button>
      <el-button type="danger" plain @click="handleBatchDelete">× 批量删除</el-button>
    </div>

    <el-table v-loading="loading" :data="employeeList" border style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="name" label="姓名" width="100" />
      <el-table-column prop="userName" label="用户名" width="120" />
      <el-table-column prop="phone" label="手机号" width="120" />
      <el-table-column prop="gender" label="性别" width="80" align="center" />
      <el-table-column label="头像" width="100" align="center">
        <template #default="scope">
          <el-image 
            style="width: 40px; height: 40px; border-radius: 4px" 
            :src="scope.row.avatar" 
            fit="cover"
          />
        </template>
      </el-table-column>
      <el-table-column prop="department" label="所属部门" />
      <el-table-column prop="jobTitle" label="职位" />
      <el-table-column prop="entryDate" label="入职日期" width="120" />
      <el-table-column prop="lastUpdateTime" label="最后操作时间" width="180" />
      
      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dialogVisible" title="新增员工" width="500px">
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
        <el-radio label="1">男</el-radio>
        <el-radio label="2">女</el-radio>
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
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="confirmAdd">确定</el-button>
    </span>
  </template>
</el-dialog>
  </div>
</template>

<script setup lang="ts">
// 请求发送
import axios from 'axios'
import 'element-plus/dist/index.css'
// 响应式布局核心
import { ref, reactive } from 'vue'
// 提示组件
import { ElMessage } from 'element-plus'
// 这样才能正确导入模块
import { EmployeeForm } from '@/scripts/employeeInterface'

// 查询参数，reactive是创建响应式对象，确保数据变了其他地方也能变
const queryParams = reactive({
  name: '',
  gender: '',
  dateRange: []
})

// 模拟数据（对应插入 SQL 的数据）
const employeeList = ref([]);
// 加载动画
const loading = ref(false);
const dialogVisible = ref(false)

const performQuery = async () => { 
    console.log("开始查询");
    loading.value = true;

    // 构建符合后端EmployeeQuery结构的DTO对象
    const queryDto = {
      name: queryParams.name || null,
      gender: queryParams.gender ? parseInt(queryParams.gender) : null, 
      startDate: (queryParams.dateRange && queryParams.dateRange.length > 0) ? queryParams.dateRange[0] : null
    }

    try {
      let response = await axios.post("http://localhost:8080/api/employees/search",queryDto);
      // await完成后才会执行下面的赋值指令
      employeeList.value = response.data;
      loading.value = false;
    }
    catch (error)
    {
        console.log("查询失败");
    }
    finally{
      loading.value = false;
    }
 }

// 新增页面的表单数据模型
const form = reactive<EmployeeForm>({
  name: '',
  userName: '',
  phone: '',
  gender: '',
  avatarUrl: '',
  department: '',
  jobTitle: '',
  entryDate: ''
});

const clearInput = () => { 
  queryParams.name = '';
  queryParams.gender = '';
  queryParams.dateRange = [];
}
const handleAdd = () => {
  // 重置表单，这样做是为了避免失去响应性特征
  Object.assign(form, {
    name: '', userName: '', phone: '', gender: '1',
    avatar: '', department: '', jobTitle: '', entryDate: ''
  })
  // 弹出新增的页面
  dialogVisible.value = true
}
const handleBatchDelete = () => { /* 批量删除逻辑 */ }
const handleEdit = (row) => { console.log('编辑行:', row) }
const handleDelete = (row) => { console.log('删除行:', row) }
const handleSelectionChange = (selection) => { /* 多选逻辑 */ }
const getAllData = async() => {
  console.log("获取所有数据");
  loading.value = true;
  try{
    const response = await axios.post("http://localhost:8080/api/employees/getAll")
    employeeList.value = response.data;
  }
  catch (error)
  {
    console.error("获取数据失败",error);
  }
  finally
  {
    loading.value = false;
  }
}

// 提交新增数据
const confirmAdd = async () => {
  console.log("提交的数据:", form)
  try {
    // 假设后端接口为 /api/employees/add
    const response = await axios.post("http://localhost:8080/api/employees/add", form)
    
    ElMessage.success('新增成功！')
    dialogVisible.value = false // 关闭弹窗
    getAllData() // 刷新列表数据
  } catch (error) {
    console.error("新增失败", error)
    // 最上面的一个带动画的提示
    ElMessage.error('新增失败，请稍后再试')
  }
}

</script>

<style scoped>
.app-container { padding: 20px; background-color: #f5f7fa; min-height: 100vh; }
.filter-container { margin-bottom: 20px; }
.action-bar { margin-bottom: 15px; }
:deep(.el-table__header) { background-color: #f8f9fa; }
</style>