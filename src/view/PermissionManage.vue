<script setup lang="ts">
import {onMounted, ref} from "vue";
import {getPermissionList, savePermission, deletePermission, updatePermission} from "@/http/permissions.ts";
import {getAllPermission} from "@/http/role.ts";
import type { Permission } from "@/http/permissions.ts";
import type { Permission as RolePermission } from "@/http/role.ts";

const currentPage=ref(1);
const permissionList = ref<Permission[]>([]);
const totalNum=ref(0);
const editPermissionId = ref<number | null>(null);

const getPermissionData = async () => {
  const { total, totalPage, data } = await getPermissionList(currentPage.value, 10);
  totalNum.value = totalPage;
  permissionList.value = data;
}

const isHide = ref(true);
const isEditMode = ref(false);

const openDialog = (isEdit=false, row?: Permission) => {
  permissionName.value = ''
  permissionType.value = ''
  permissionCode.value = ''
  permissionPath.value = ''
  permissionParentId.value = 0
  permissionSort.value = 0
  isEditMode.value = isEdit
  if (isEdit && row) {
    editPermissionId.value = row.id
    permissionName.value = row.name
    permissionType.value = row.menuType
    permissionCode.value = row.code
    permissionPath.value = row.path || ''
    permissionParentId.value = row.parentId || 0
    permissionSort.value = row.sort || 0
  }
  isHide.value = false
}

const closeDialog = () => {
  isHide.value = true;
}

const permissionName = ref('')
const permissionType = ref('')
const permissionCode = ref('')
const permissionPath = ref('')
const permissionParentId = ref(0)
const permissionSort = ref(0)
const parentPermissionList = ref<RolePermission[]>([])

const handleSavePermission = async () => {
  const params = {
    name: permissionName.value,
    type: permissionType.value,
    code: permissionCode.value,
    path: permissionPath.value,
    parentId: permissionParentId.value,
    sort: permissionSort.value
  }
  try {
    if (isEditMode.value && editPermissionId.value) {
      await updatePermission(editPermissionId.value, params)
    } else {
      await savePermission(params)
    }
    alert("保存成功");
    getPermissionData()
    closeDialog();
  } catch (err) {
    console.error("操作失败", err)
  }
}

const handleDeletePermission = async (id: number) => {
  if(!confirm("确定删除该权限吗")) return
  await deletePermission(id)
  await getPermissionData();
}

onMounted(async () => {
  await getPermissionData();
  const allPermissions = await getAllPermission();
  parentPermissionList.value = allPermissions;
})

const prev = async () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    await getPermissionData();
  }
};

const next = async () => {
  if (currentPage.value < totalNum.value) {
    currentPage.value++;
    await getPermissionData();
  }
};

const toFirst = () => {
  currentPage.value = 1
  getPermissionData()
}

const toLast = () => {
  currentPage.value = totalNum.value
  getPermissionData()
}

const formatTime = (timeStr: string) => {
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

const getParentName = (parentId: number) => {
  if (parentId === 0) return '顶级权限';
  const parent = parentPermissionList.value.find(p => p.id === parentId);
  return parent ? parent.name : '';
};
</script>

<template>
  <div>
    权限管理
    <button @click="openDialog(false)" v-permission="['permission:add']">新增权限</button>
  </div>
  <div>
    <table>
      <tr>
        <th>权限ID</th>
        <th>权限名称</th>
        <th>类型</th>
        <th>权限标识</th>
        <th>路由路径</th>
        <th>父级权限</th>
        <th>排序</th>
        <th>创建时间</th>
        <th>操作</th>
      </tr>
      <tr v-for="permission in permissionList" :key="permission.id">
        <td>{{permission.id}}</td>
        <td>{{permission.name}}</td>
        <td>{{permission.menuType === 'DIRECTORY' ? '目录' : permission.menuType === 'MENU' ? '菜单' : '按钮'}}</td>
        <td>{{permission.code}}</td>
        <td>{{permission.path || '-'}}</td>
        <td>{{getParentName(permission.parentId)}}</td>
        <td>{{permission.sort}}</td>
        <td>{{formatTime(String(permission.createTime))}}</td>
        <td>
          <button @click="openDialog(true, permission)" v-permission="['permission:edit']">编辑</button>
          <button @click="handleDeletePermission(permission.id)" v-permission="['permission:delete']">删除</button>
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

  <div id="rbacModal" class="rbac-modal-overlay" :class="{modelHide: isHide}" @click.self="closeDialog">
    <div class="rbac-modal-content" id="modalContent">
      <span class="rbac-modal-close" id="closeModal" @click="closeDialog">&times;</span>
      <div style="padding: 20px; height: 100%; box-sizing: border-box;">
        <h2>{{ isEditMode ? '编辑权限' : '新增权限' }}</h2>
        <div>
          权限名称 <input type="text" v-model="permissionName" placeholder="请输入权限名称" required><br>
          权限类型 <select v-model="permissionType">
            <option value="DIRECTORY">目录</option>
            <option value="MENU">菜单</option>
            <option value="BUTTON">按钮</option>
          </select><br>
          父级权限 <select v-model="permissionParentId">
            <option :value="0">顶级权限</option>
            <option v-for="p in parentPermissionList" :key="p.id" :value="p.id">
              {{p.name}}
            </option>
          </select><br>
          权限标识 <input type="text" v-model="permissionCode" placeholder="例如 role:add"><br>
          路由路径 <input type="text" v-model="permissionPath" placeholder="例如 /permission/list"><br>
          排序 <input type="number" v-model="permissionSort"><br>
        </div>
        <button @click="closeDialog">取消</button>
        <button @click="handleSavePermission">{{ isEditMode ? '更新权限' : '新增权限' }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
table, tr, th, td {
  border: 1px solid black;
  border-collapse: collapse;
}
.rbac-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.rbac-modal-content {
  width: 400px;
  height: 500px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

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