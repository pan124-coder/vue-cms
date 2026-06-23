<script setup lang="ts">

import {computed, ref} from "vue";
import type { Permission } from "@/http/role.ts";

const props=defineProps<{
  item: Permission
}>()

const typeNameToChinese=computed(()=>{
  switch(props.item.menuType) {
    case "DIRECTORY":
      return "目录";
    case "MENU":
      return "菜单";
    case "BUTTON":
      return "按钮";
    default:
      return "未知";
  }
})

const typeClass=computed(()=>{
  return `type-${props.item.menuType.toLowerCase()}`
})

const emit=defineEmits<{
  (e: 'node-change', node: Permission, isChecked: boolean): void
}>()

const checkboxRef = ref<HTMLInputElement | null>(null)

const handleChange=(e: Event) =>{
  const target = e.target as HTMLInputElement;
  const isChecked = target.checked;
  emit("node-change", props.item, isChecked);
}

const handleChildChange = (node: Permission, isChecked: boolean)  => {
  emit("node-change", node, isChecked)
}
</script>

<template>
  <div class="menu-content">
    <input type="checkbox"
           :checked="item.checked"
           :indeterminate="item.halfchecked"
           @change="handleChange">
    <span >{{props.item.name}}</span>
    <span class="item-type" :class="typeClass">{{typeNameToChinese}}</span>
    <div class="children" v-if="item.children && item.children.length>0">
      <mytree v-for="subItem in item.children" :key="subItem.id" :item="subItem" @node-change="handleChildChange"/>
    </div>
  </div>

</template>

<style scoped>
.menu-content{
  margin-bottom: 5px;
}
.menu-content.children{
  margin-top: 5px;
}
.children{
  padding-left: 20px;
}
.item-type{
  float: right;
  display: inline-block;
}
.type-directory{
  color: #569EFA;
  background-color: #EEF5FE;
}
.type-menu{
  color: #7ABF4A;
  background-color: #F2F9EC;
}
.type-button{
  color: #DEA44C;
  background-color: #FCF6ED
}
</style>