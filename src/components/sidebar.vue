<template>
  <el-menu
      :default-active="routeName"
      class="el-menu-vertical-custom"
  >

    <RouterLink to="/panel">
      <el-menu-item index="/panel">
        <el-icon>
          <icon-menu/>
        </el-icon>
        <template #title>Панель</template>
      </el-menu-item>
    </RouterLink>


    <RouterLink to="/applications">
      <el-menu-item index="/applications">
        <el-icon>
          <setting/>
        </el-icon>
        <template #title>Платежи</template>
      </el-menu-item>
    </RouterLink>


  </el-menu>
</template>

<script lang="ts" setup>
import {
  Menu as IconMenu,
  Setting,
} from '@element-plus/icons-vue'

import {
  ElMenu,
  ElMenuItem,
  ElIcon,
} from 'element-plus';
import {RouterLink, useRoute} from 'vue-router'
import {computed} from "vue";

const route = useRoute();

const routeName = computed(() => {
  return route.fullPath;
});

</script>

<style>
.el-menu-vertical-custom {
  height: 100vh;
  width: 200px;
}
</style>