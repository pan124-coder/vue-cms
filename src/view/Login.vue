<template>
  <div class="login-container">
    <div class="login-form-card">
      <h2 class="title">CMS 管理系统</h2>

      <!-- 纯原生表单 -->
      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label class="form-label">用户名</label>
          <input
              v-model="form.username"
              type="text"
              class="form-input"
              placeholder="请输入用户名"
          />
          <!-- 错误提示 -->
          <span v-if="errors.username" class="error-tip">{{ errors.username }}</span>
        </div>

        <div class="form-group">
          <label class="form-label">密码</label>
          <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="请输入密码"
          />
          <!-- 显示密码开关 -->
          <button type="button" class="pwd-toggle" @click="showPassword = !showPassword">
            {{ showPassword ? '隐藏' : '显示' }}
          </button>
          <span v-if="errors.password" class="error-tip">{{ errors.password }}</span>
        </div>

        <div class="form-group">
          <button
              type="submit"
              class="login-btn"
              :disabled="loading"
          >
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { login } from "@/http/login.ts"
import router from '@/router/index'
import { useUserStore } from "@/stores/user.ts"
import { ElMessage } from 'element-plus'

// 表单数据
const form = ref({
  username: 'pan',
  password: '123456'
})

// 错误信息
const errors = reactive({
  username: '',
  password: ''
})

// 加载状态 / 显示密码
const loading = ref(false)
const showPassword = ref(false)

// 表单验证
const validate = () => {
  let valid = true
  errors.username = ''
  errors.password = ''

  if (!form.value.username) {
    errors.username = '请输入用户名'
    valid = false
  }
  if (!form.value.password) {
    errors.password = '请输入密码'
    valid = false
  } else if (form.value.password.length < 6) {
    errors.password = '密码不能少于6位'
    valid = false
  }
  return valid
}

// 登录提交
const handleSubmit = () => {
  const valid = validate()
  if (!valid) return

  loading.value = true
  login(form.value).then((data: any) => {
    if (data.code == 200) {
      const userStore = useUserStore()
      userStore.setToken(data.data.token)
      userStore.setUserInfo(data.data)
      router.push('/dashboard').catch(() => {})
    }
  }).catch((error) => {
    console.error('登录失败:', error)
    // 优先展示后端返回的业务错误信息
    const msg = error?.message || error?.data?.message || (typeof error === 'string' ? error : '登录失败，请稍后重试')
    ElMessage.error(msg)
  }).finally(() => {
    loading.value = false
  })
}
</script>

<style scoped>
/* 整体布局 */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

/* 卡片样式 */
.login-form-card {
  width: 400px;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: #fff;
}

/* 标题 */
.title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
}

/* 表单样式 */
.login-form {
  width: 100%;
}

.form-group {
  margin-bottom: 20px;
  position: relative;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-size: 14px;
}

.form-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #dcdcdc;
  border-radius: 4px;
  outline: none;
  font-size: 14px;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #409eff;
}

/* 错误提示 */
.error-tip {
  display: block;
  margin-top: 4px;
  color: #f56c6c;
  font-size: 12px;
}

/* 密码显示隐藏 */
.pwd-toggle {
  position: absolute;
  right: 10px;
  top: 38px;
  border: none;
  background: none;
  color: #999;
  font-size: 12px;
  cursor: pointer;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 42px;
  background-color: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.login-btn:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}
</style>