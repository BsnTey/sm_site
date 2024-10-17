<script setup lang="ts">
import {RouterView} from 'vue-router'
import Sidebar from "./components/sidebar.vue";
</script>

<template>
  <div class="main-view">
    <Sidebar/>
    <div class="pages">
      <RouterView/>
    </div>
  </div>

</template>

<style scoped>
.main-view {
  display: flex;
}

.pages {
  margin-left: 50px;
  margin-top: 10px;
}
</style>
