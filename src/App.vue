<script setup lang="ts"></script>

<template>
  <router-view></router-view>
</template>

<style>
.permission-disabled {
  background-color: #e0e0e0 !important;
  color: #999 !important;
  cursor: not-allowed !important;
  border-color: #ccc !important;
}
.permission-disabled:hover {
  background-color: #e0e0e0 !important;
}
</style>
