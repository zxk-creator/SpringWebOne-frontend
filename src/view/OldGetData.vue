<template>
  <div style="padding: 20px;">
    <h2>用户列表数据</h2>
    
    <el-button type="primary" @click="fetchUserData" style="margin-bottom: 20px;">
      获取最新数据
    </el-button>

    <el-table :data="userList" border style="width: 100%" v-loading="loading">
      <el-table-column prop="ID" label="ID" width="80" />
      <el-table-column prop="UserName" label="用户名" />
      <el-table-column prop="Password" label="密码" />
      <el-table-column prop="TrueName" label="姓名" />
      <el-table-column prop="Age" label="年龄" width="100" />
      <el-table-column prop="CreateTime" label="更新时间" />
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

// 1. 定义数据源，默认为空
const userList = ref([])
// 转圈圈动画
const loading = ref(false)

// 2. 编写请求后端的方法
const fetchUserData = async () => {
  loading.value = true
  try {
    // 这里的 URL 对应你后端 @RestController 暴露的接口地址
    const response = await axios.get('http://localhost:8080/list')
    // 将后端返回的 JSON 数组赋值给响应式变量
    userList.value = response.data
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    loading.value = false
  }
}
</script>