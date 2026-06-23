<script setup lang="ts">

import {onMounted, ref} from "vue";
import {
  authorizeRole, deleteRole,
  getAllPermission,
  getPermissionOfCurrentRole,
  getRoleList,
  type Role,
  type RoleAuthorizePayload, saveRole, updateRole,
  type Permission
} from "@/http/role.ts";
import Mytree from "@/view/Mytree.vue";

const roleList = ref<Role[]>([]);
const allPermission = ref<Permission[]>([]);
const currentRoleId = ref<number>(0);
const currentPage = ref(1);
const totalNum = ref<number>(0);

const GetRoleListData = async () => {
  const { total, totalPage, data } = await getRoleList(currentPage.value, 3);
  roleList.value = data;
  totalNum.value = totalPage;
}

onMounted(async () => {
  await GetRoleListData();
  console.log("所有角色数据：", roleList.value);
})

const openAuthDialog = async (roleId: number) => {
  currentRoleId.value = roleId;
  allPermission.value = await getAllPermission();
  const rolepermissionIds = await getPermissionOfCurrentRole(roleId);
  console.log(rolepermissionIds);
  initMenuState(allPermission.value);
  checkPermissions(allPermission.value, rolepermissionIds);
  calulateParent(allPermission.value);
  console.log(allPermission.value);
  isHideAuth.value = false;
}

const calulateParent = (permissions: Permission[]) => {
  permissions.forEach(node => {
    if (node.children && node.children.length > 0) {
      calulateParent(node.children);
      const allchecked = node.children.every(child => child.checked);
      const haschecked = node.children.some(child => child.checked || child.halfchecked);
      node.checked = allchecked;
      node.halfchecked = !allchecked && haschecked;
      if (node.menuGranted) {
        node.checked = false;
        node.halfchecked = true;
      }
    }
  })
}

const checkPermissions = (permissions: Permission[], rolepermissionIds: number[]) => {
  permissions.forEach((item) => {
    if (rolepermissionIds.includes(item.id)) {
      item.checked = true;
      item.menuGranted = true;
    }
    if (item.children && item.children.length > 0) {
      checkPermissions(item.children, rolepermissionIds);
    }
  })
}

const initMenuState = (treeData: Permission[]) => {
  treeData.forEach((menu) => {
    menu.checked = false;
    menu.halfchecked = false;
    if (menu.children) {
      initMenuState(menu.children);
    }
  })
}

const closeAuthDialog = () => {
  isHideAuth.value = true;
}

const isHideAuth = ref(true);

const updateParentState = (permissions: Permission[], childId: number, isChecked: boolean) => {
  for (const node of permissions) {
    if (node.children && node.children.some(child => child.id === childId)) {
      if (isChecked) {
        node.checked = true;
        node.halfchecked = false;
        node.menuGranted = true;
      } else {
        const allUnchecked = node.children.every(child => !child.checked);
        if (allUnchecked) {
          node.menuGranted = false;
        }
      }
      if (node.parentId && node.parentId !== 0) {
        updateParentState(allPermission.value, node.id, isChecked);
      }
      return;
    }
    if (node.children && node.children.length > 0) {
      updateParentState(node.children, childId, isChecked);
    }
  }
}

const onNodeChange = (node: Permission, isChecked: boolean) => {
  updateChildState(node, isChecked);
  if (node.parentId && node.parentId !== 0) {
    updateParentState(allPermission.value, node.id, isChecked);
  }
  calulateParent(allPermission.value);
}

const updateChildState = (node: Permission, isChecked: boolean) => {
  node.checked = isChecked;
  node.halfchecked = false;
  if (!isChecked) {
    node.menuGranted = false;
  }
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => {
      updateChildState(child, isChecked);
    })
  }
}

const collectCheckedPermissionIds = (permissions: Permission[]): number[] => {
  let ids: number[] = [];
  permissions.forEach((item) => {
    if (item.checked && !item.halfchecked) {
      ids.push(item.id);
    }
    if (item.children && item.children.length > 0) {
      ids = [...ids, ...collectCheckedPermissionIds(item.children)];
    }
  });
  return ids;
};

const savePermission = async () => {
  try {
    if (!currentRoleId.value) {
      alert("未选择授权角色，请重新操作");
      return;
    }
    const checkedPermissionIds = collectCheckedPermissionIds(allPermission.value);
    console.log("要保存的权限ID：", checkedPermissionIds);

    const payload: RoleAuthorizePayload = {
      roleId: currentRoleId.value,
      permissionIds: checkedPermissionIds,
    };

    await authorizeRole(payload);
    alert("权限授权成功！");
    closeAuthDialog();
  } catch (error) {
    console.error("保存权限失败：", error);
    alert("权限授权失败，请重试");
  }
};

const rolename = ref<string>('');
const isHideRoleEdit = ref(true);
const editRoleId = ref<number | null>(null);
const isEditMode = ref(false)

const handsaveRole = async () => {
  if (!rolename.value) {
    alert("用户名不能为空");
    return;
  }
  const params = {
    name: rolename.value
  }
  try {
    if (isEditMode.value && editRoleId.value) {
      await updateRole(editRoleId.value, params)
      console.log("正在编辑");
    } else {
      await saveRole(params)
      console.log("新建成功");
    }
    alert("保存成功");
    setTimeout(() => {
      closeRoledit();
      GetRoleListData();
    }, 1500);
  } catch (err) {
    console.error("保存失败", err);
    alert("保存失败，请重试");
  }
}

const openroleedit = async (isEdit=false, row?: Role) => {
  isEditMode.value = isEdit
  isHideRoleEdit.value = false;
  if (isEdit && row) {
    editRoleId.value = row.id;
    rolename.value = row.name;
  } else {
    editRoleId.value = null;
    rolename.value = '';
  }
}

const closeRoledit = async () => {
  isHideRoleEdit.value = true;
}

const handledeleterole = async (id: number) => {
  if (!confirm('确定要删除该角色吗？')) return
  await deleteRole(id)
  await GetRoleListData();
}

const prev = async () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    await GetRoleListData();
  }
};

const next = async () => {
  if (currentPage.value < totalNum.value) {
    currentPage.value++;
    await GetRoleListData();
  }
};

const toFirst = async () => {
  currentPage.value = 1
  await GetRoleListData();
}

const toLast = async () => {
  currentPage.value = totalNum.value
  await GetRoleListData();
}


</script>

<template>
  <p>角色管理</p>
  <button @click="openroleedit(false)" v-permission="['role:add']">新建角色</button>
  <table>
    <tr>
      <th>角色ID</th>
      <th>角色名称</th>
      <th>操作</th>
    </tr>
    <tr v-for="role in roleList" :key="role.id">
      <td>{{ role.id }}</td>
      <td>{{ role.name }}</td>
      <td>
        <button @click="openAuthDialog(role.id)" v-permission="['role:assign-permission']">授权</button>
      <button @click="openroleedit(true,role)" v-permission="['role:edit']">编辑</button>
        <button @click="handledeleterole(role.id)" v-permission="['role:delete']">删除</button>
      </td>
    </tr>
  </table>
  <!-- 遮罩层（初始隐藏） -->
  <div id="rbacModal" class="rbac-modal-overlay" :class="{modelHide: isHideAuth}" @click.self="closeAuthDialog">
    <div class="rbac-modal-content" id="modalContent">
      <span class="rbac-modal-close" id="closeModal" @click="closeAuthDialog">&times;</span>
      <!-- 这里放你的授权表单或内容 -->
      <!--      <div style="padding: 20px; height: 100%; box-sizing: border-box;"@click.stop>-->
      <div style="padding: 20px; height: 100%; box-sizing: border-box;">
        <h2>角色授权</h2>
        <mytree v-for="menu in allPermission"
                :key="menu.id"
                :item="menu"
                @node-change="onNodeChange">
        </mytree>
        <button @click="closeAuthDialog">取消</button>
        <button @click="savePermission">保存</button>
      </div>
    </div>
  </div>
  <div class="rbac-modal-overlay" :class="{modelHide: isHideRoleEdit}" @click.self="closeRoledit">
    <div class="rbac-modal-content" style="width: 450px;height: 260px;" @click.stop>
      <span class="rbac-modal-close" @click="closeRoledit">&times;</span>
      <div style="padding: 30px 20px;">
        <h2 style="text-align:center;margin-bottom:25px">
          {{ isEditMode ? '编辑角色' : '新增角色' }}
        </h2>
        <div style="margin-bottom: 20px;">
          <label style="display:inline-block;width:90px;">角色名称：</label>
          <input v-model="rolename" placeholder="请输入角色名称" style="padding:6px 8px;width:260px"/>
        </div>
        <div style="text-align:center;margin-top:30px;">
          <button @click="closeRoledit">取消</button>
          <button @click="handsaveRole" style="margin-left:12px">保存</button>
        </div>
      </div>
    </div>
  </div>
  <div style="float: right;position: relative;margin-top: 200px">
    共{{totalNum}}页
    <button @click="toFirst">首页</button>
    <button @click="prev" :disabled="currentPage==1">上一页</button>
    <button @click="next" :disabled="currentPage==totalNum">下一页</button>
    <button @click="toLast">尾页</button>
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
  width: 640px;
  height: 860px;
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
