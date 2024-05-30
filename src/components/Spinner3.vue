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
    <div>
        <div class="spinner-overlay" v-if="loading">
            <span class="loader"></span>
        </div>
        <router-view />
    </div>
</template>

<style scoped>
.spinner-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.7);
    z-index: 9999;
}

.loader {
    width: 64px;
    height: 64px;
    position: relative;
    background-image: linear-gradient(#d4b012 16px, transparent 0), linear-gradient(#00294f 16px, transparent 0), linear-gradient(#00294f 16px, transparent 0), linear-gradient(#d4b012 16px, transparent 0);
    background-repeat: no-repeat;
    background-size: 16px 16px;
    background-position: left top, left bottom, right top, right bottom;
    animation: rotate 1s linear infinite;
}

@keyframes rotate {
    0% {
        width: 64px;
        height: 64px;
        transform: rotate(0deg);
    }
    50% {
        width: 30px;
        height: 30px;
        transform: rotate(180deg);
    }
    100% {
        width: 64px;
        height: 64px;
        transform: rotate(360deg);
    }
}
</style>
