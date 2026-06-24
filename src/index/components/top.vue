<script setup lang="ts">
import { useUserStore } from '@/stores/user.ts'
import router from '@/router/index'

const userStore = useUserStore()

const handleLogout = () => {
  userStore.logout()
  router.push('/')
}
</script>

<template>
  <div class="top">
    <div class="top-content">
      <div class="title">CMS 管理系统</div>
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </div>
  </div>
</template>

<style scoped>
.top {
  width: 100%;
  height: 10%;
  border-bottom: 1px solid #e5e6eb;
  background-color: #fff;
}

.top-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.logout-btn {
  padding: 8px 16px;
  background-color: #f56c6c;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background-color: #f78989;
}
</style>