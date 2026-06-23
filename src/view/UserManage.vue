<script setup lang="ts">

import {onMounted, ref} from "vue";
import {deleteUser, getUserList, saveUser, updateUser} from "@/http/user.ts";
import {getRoleList} from "@/http/role.ts";
import type { Role } from "@/http/role.ts";
import type { UserData, userData } from "@/http/user.ts";

const currentPage = ref(1);
const userList = ref<UserData[]>([]);
const totalNum = ref<number>(0);
const editUserId = ref<number | null>(null);

const getuserdata = async () => {
  const { total, totalPage, data } = await getUserList(currentPage.value, 3);
  totalNum.value = totalPage;
  userList.value = data;
}

const isHide = ref(true);
const isEditMode = ref(false)
const showSuccess = ref(false);

const openAuthDialog = (isEdit=false, row?: UserData) => {
  username.value = ''
  userpassword.value = ''
  userRole.value = ''
  isEditMode.value = isEdit
  if (isEdit && row) {
    editUserId.value = row.id
    username.value = row.username
    userRole.value = row.roleId ? String(row.roleId) : ''
    userpassword.value = row.password
  }
  isHide.value = false
}

const closeAuthDialog = () => {
  isHide.value = true;
}

const username = ref('')
const userpassword = ref('')
const userRole = ref('')
const RoleList = ref<Role[]>([])

const handlesaveuser = async () => {
  const params: userData = {
    username: username.value,
    password: userpassword.value,
  }
  if (userRole.value) {
    params.roleId = Number(userRole.value)
  }
  try {
    if (isEditMode.value && editUserId.value) {
      await updateUser(editUserId.value, params)
    } else {
      await saveUser(params)
    }
    alert("保存成功");
    setTimeout(() => {
      showSuccess.value = false;
      getuserdata()
      closeAuthDialog();
    }, 2000)
  } catch (err) {
    console.error("操作a失败", err)
  }
}

const handledeleteuser = async (id: number) => {
  if(!confirm("确定删除该用户吗")) return
  await deleteUser(id)
  await getuserdata();
}

onMounted(async () => {
  await getuserdata();
  console.log("用户数据", userList.value);
  const { data } = await getRoleList(currentPage.value, 9999);
  RoleList.value = data;
})

const prev = async () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    await getuserdata();
  }
};

const next = async () => {
  if (currentPage.value < totalNum.value) {
    currentPage.value++;
    await getuserdata();
  }
};

const toFirst = () => {
  currentPage.value = 1
  getuserdata()
}

const toLast = () => {
  currentPage.value = totalNum.value
  getuserdata()
}

const formatTime = (timeStr: string | undefined) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};
</script>

<template>
  <div>
    用户管理
    <button @click="openAuthDialog(false)" v-permission="['account:user:add']">新建用户</button>
  </div>
  <div>
    <table>
      <tr>
        <th>用户ID</th>
        <th>用户名称</th>
        <th>角色</th>
        <th>创建时间</th>
        <th>更新时间</th>
        <th>操作</th>
      </tr>
      <tr v-for="user in userList" :key="user.id">
        <td>{{ user.id }}</td>
        <td>{{ user.username }}</td>
        <td>{{user.roleName||"未分配"}}</td>
        <td>{{formatTime(user.createTime)}}</td>
        <td>{{formatTime(user.updateTime)}}</td>
        <td>
          <button @click="openAuthDialog(true,user)" v-permission="['account:user:edit']">编辑</button>
          <button @click="handledeleteuser(user.id)" v-permission="['account:user:delete']">删除</button>
        </td>
      </tr>
    </table>
    <div style="float: right;position: relative;margin-top: 200px">
      共{{totalNum}}页
      <button @click="toFirst">首页</button>
      <button @click="prev" :disabled="currentPage==1">上一页</button>
      <button @click="next" :disabled="currentPage==totalNum">下一页</button>
      <button @click="toLast">尾页</button>
    </div>
  </div>
  <!-- 遮罩层（初始隐藏） -->
  <div id="rbacModal" class="rbac-modal-overlay" :class="{modelHide: isHide}" @click.self="closeAuthDialog">
    <div class="rbac-modal-content" id="modalContent">
      <span class="rbac-modal-close" id="closeModal" @click="closeAuthDialog">&times;</span>
      <!-- 这里放你的授权表单或内容 -->
      <!--      <div style="padding: 20px; height: 100%; box-sizing: border-box;"@click.stop>-->
      <div style="padding: 20px; height: 100%; box-sizing: border-box;">
        <h2>{{ isEditMode ? '编辑用户' : '新增用户' }}</h2>
        <div>
          用户名 <input type="text" v-model="username"><br>
          密码 <input type="password" v-model="userpassword"><br>
          角色 <select v-model="userRole">
          <option value="">请选择角色</option>
          <option v-for="role in RoleList" :key="role.id" :value="role.id">
            {{role.name}}
          </option>
        </select>
          <br>
        </div>
        <button @click="closeAuthDialog">取消</button>
        <button @click="handlesaveuser">保存</button>
      </div>
  </div>
  </div>

</template>

<style scoped>
table, tr, th, td {
  border: 1px solid black;
  border-collapse: collapse;
}
/* 遮罩层容器 */
.rbac-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5); /* 半透明黑色 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

/* 遮罩内容区 */
.rbac-modal-content {
  width: 300px;
  height: 400px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

/* 关闭按钮示例（可选） */
.rbac-modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  cursor: pointer;
  font-size: 20px;
  color: #999;
}

.modelHide {
  display: none;
}


</style>