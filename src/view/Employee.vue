<template>
  <div class="app-container">
    <el-card class="filter-container">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="姓名">
          <el-input v-model="queryParams.name" placeholder="请输入员工姓名" />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="queryParams.gender" placeholder="不选" style="width: 120px">
            <el-option label="男" value="1" />
            <el-option label="女" value="2" />
            <!-- “:”是关键，表示这是JS类型null -->
            <el-option label="不选" :value=null />
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
          <el-button type="primary" @click="getAllData(true)">获取所有数据</el-button>
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
      <el-table-column prop="gender" label="性别" width="80" align="center">
        <template #default="scope">
        {{ scope.row.gender === 1 ? '男' : (scope.row.gender === 2 ? '女' : '未知') }}
        </template>
      </el-table-column>
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
  </div>

  <div class="container">
    <EmployeeDialog
      v-model="dialogVisible" 
      :initialData="currentData"
      :title="dialogTitle"
      :is-add-employ="isAddEmploy"
      @success="getAllData" 
    />
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
import { EmployeeForm, QueryParam } from '@/interface/employeeInterface'
import EmployeeDialog from './dialog/AddEmployeeDialog.vue'

// 查询参数，reactive是创建响应式对象，确保数据变了其他地方也能变
const queryParams = reactive<QueryParam>({
  name: '',
  gender: null,
  // 形如['2023-01-01', '2023-12-31']这样的数组
  dateRange: []
})
// 新增员工页面的表单数据模型
const form = reactive<EmployeeForm>({
  userName: '',
  name: '',
  phone: '',
  gender: null,
  avatarUrl: '',
  department: '',
  jobTitle: '',
  entryDate: ''
});

// 用户已经选择的id列表
const selectedEmployees = ref<any[]>([])

// SQL插入数据
const employeeList = ref([]);
// 加载动画
const loading = ref(false);
// 那个增加员工的对话框
const dialogVisible = ref(false);
const editData = ref({});
const dialogTitle = ref("我是标题");
const currentData = ref({});
const isAddEmploy = ref(false);

const performQuery = async () => { 
    console.log("开始查询");
    loading.value = true;

    // 构建符合后端EmployeeQuery结构的DTO对象
    const queryDto = {
      name: queryParams.name || null,
      gender: queryParams.gender, 
      startDate: (queryParams.dateRange && queryParams.dateRange.length > 0) ? queryParams.dateRange[0] : null,
      endDate: (queryParams.dateRange && queryParams.dateRange.length > 1) ? queryParams.dateRange[1] : null
    }

    try {
      let response = await axios.post("http://localhost:8080/api/employees/search",queryDto);
      // await完成后才会执行下面的赋值指令
      employeeList.value = response.data.data;
      let result = response.data;
      if (result.code === 1){
        ElMessage("查询成功");
      }
      loading.value = false;
    }
    catch (error){
        console.log("查询失败");
    }
    finally{
      loading.value = false;
    }
 }

const clearInput = () => { 
  queryParams.name = '';
  queryParams.gender = null;
  queryParams.dateRange = [];
}
const handleAdd = () => {
  // 重置表单
  currentData.value = {name: '',
    userName: '',
    phone: '',
    gender: 1, // 建议用数字，和数据库对齐
    avatarUrl: '',
    department: '',
    jobTitle: '',
    entryDate: ''
    };
  // 弹出新增的页面
  dialogVisible.value = true;
  dialogTitle.value = "新增员工";
  isAddEmploy.value = true;
}
const handleBatchDelete = async () => {
  if (selectedEmployees.value.length === 0){
    ElMessage.warning("请至少勾选一个员工！");
    return;
  }

  const selectedArray = selectedEmployees.value.map(row => row.id);
  // 不使用for循环了，防止网络拥堵
  try{
    loading.value = true;
    let response = await axios.post("http://localhost:8080/api/employees/batchDelete",selectedArray);
    let result = response.data;
    if (result.code === 1){
      ElMessage.success("批量删除成功。");
      getAllData(false);
    }
  }
  catch (e){
    console.log("删除失败，原因",e);
    ElMessage.error("删除失败！");
  }
  finally{
    loading.value = false
  }
}
const handleEdit = (row:any) => {
  isAddEmploy.value = false;
  // 指针指向改变，因此我们需要在Dialog里面浅拷贝，使用浅拷贝的数据，否则就会出现显示的数据也变了的情况
  currentData.value = row;
  dialogVisible.value = true;
  dialogTitle.value = "编辑员工...";
}
const handleDelete = async (row:any) => { 
  // row就是那个JS对象，我们需要拿到他的id
  // 由于后端加了@RequestBody，我们还是需要构造一个JSON
  try{
    let response = await axios.post("http://localhost:8080/api/employees/deleteById",row.id,{headers:{'Content-Type':'application/json'}});
    // 或await axios.post("http://localhost:8080/api/employees/deleteById",{row.id});
    let result = response.data;
    if (result.code === 1){
      ElMessage.success("删除成功");
      getAllData(false);
   }
  }
  catch(e){
    console.log("删除失败",e);
  }
 }

const handleSelectionChange = (selection:any) => {
  console.log("勾选了：",selection);
  selectedEmployees.value = selection
}
const getAllData = async(showSuccessDialog:boolean) => {
  console.log("获取所有数据");
  loading.value = true;
  try{
    const response = await axios.post("http://localhost:8080/api/employees/getAll")
    // 第一层data是Result对象，第二层是真正的数据
    employeeList.value = response.data.data;
    const result = response.data;
    if (result.code === 1 && showSuccessDialog == true)
    {
      ElMessage.success("获取成功");
    }
  }
  catch (error)
  {
    console.error("获取数据失败",error);
  }
  // finally不能省，否则这里的代码如果出问题就不会执行
  finally
  {
    loading.value = false;
  }
}

// 提交新增数据
const confirmAdd = async () => {
  console.log("提交的数据:", form)
  try {
    // 后端接口为 /api/employees/add
    const response = await axios.post("http://localhost:8080/api/employees/add", form)
    
    ElMessage.success('新增成功！')
    dialogVisible.value = false // 关闭弹窗
    getAllData(false) // 刷新列表数据
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