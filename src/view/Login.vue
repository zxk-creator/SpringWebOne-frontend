<template>
  <div class="login-container">
    <el-card class="login-card" v-loading="loading">
      <template #header>
        <div class="login-header">
          <h2>{{ isLogin ? '登录你冯管理系统' : '新用户注册' }}</h2>
        </div>
      </template>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="0">
        <el-form-item prop="username">
          <el-input 
            v-model="form.username" 
            placeholder="请输入用户名" 
            prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码" 
            prefix-icon="Lock" 
            show-password
          />
        </el-form-item>

        <!-- 只有处于注册账号模式下才会显示这个 -->
        <el-form-item v-if="!isLogin" prop="rePassword">
          <el-input 
            v-model="form.rePassword" 
            type="password" 
            placeholder="请再次输入密码" 
            prefix-icon="Check" 
            show-password
          />
        </el-form-item>

        <el-button type="primary" class="login-btn" @click="handleSubmit">
          {{ isLogin ? '登录' : '立即注册' }}
        </el-button>

        <div class="toggle-link">
          <el-link type="info" @click="toggleMode">
            {{ isLogin ? '没有账号？去注册' : '已有账号？去登录' }}
          </el-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Lock, Check } from '@element-plus/icons-vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { verification } from '@/security/Verification'

const router = useRouter()
const isLogin = ref(true) // 切换模式
const formRef = ref(null)
const loading = ref(false);

const form = reactive({
  username: '',
  password: '',
  rePassword: ''
})

// 表单校验规则
const rules = {
  username: [{ required: true, message: '用户名必填', trigger: 'blur' }],
  password: [
    { required: true, message: '密码必填', trigger: 'blur' },
    { min: 5, max: 15, message: '长度在 5 到 15 个字符', trigger: 'blur' }
  ],
  rePassword: [
    { 
      // ElMessage的自定义校验函数
      validator: (rule, value, callback) => {
        if (!isLogin.value && value !== form.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ]
}

const toggleMode = () => {
  isLogin.value = !isLogin.value
  formRef.value.resetFields() // 切换时清空校验报错
}

const handleSubmit = async () => {
  // 预校验
  await formRef.value.validate(async (valid) => {
    if (!valid) return

    // 发送请求
    const url = isLogin.value ? '/api/login' : '/api/register'
    try {
      loading.value = true;
      const res = await axios.post(`http://localhost:8080${url}`, {
        userName: form.username,
        password: form.password
      })

      console.log(res);

      if (verification(res.data.status)){
        ElMessage.success("操作成功");
        router.push('/employee')
      }
    } catch (err) {
      ElMessage.error('服务器连接失败')
    }
    finally{
      loading.value = false;
    }
  })
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); /* 渐变背景 */
}
.login-card {
  width: 400px;
}
.login-header h2 {
  text-align: center;
  margin: 0;
  color: #409EFF;
}
.login-btn {
  width: 100%;
  margin-top: 10px;
}
.toggle-link {
  text-align: right;
  margin-top: 15px;
}
</style>