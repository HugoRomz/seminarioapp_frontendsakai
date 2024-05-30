<script setup>
import { useRouter } from 'vue-router';
import { ref } from 'vue';

const loading = ref(false);
const router = useRouter();

router.beforeEach(() => {
  loading.value = true;
});

router.afterEach(() => {
  loading.value = false;
});
</script>

<template>
  <div class="loading-overlay" v-if="loading"></div>
  <router-view />
</template>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Fondo negro transparente */
  z-index: 9999;
}
</style>
