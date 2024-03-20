import { defineStore } from 'pinia';

import { useRouter } from 'vue-router';

import { ref, onMounted, computed } from 'vue';
import AuthAPI from '../api/AuthAPI';

export const useUser = defineStore('user', () => {
    const router = useRouter();

    const user = ref({});

    onMounted(async () => {
        try {
            const { data } = await AuthAPI.auth();
            user.value = data;
        } catch (error) {
            console.log(error);
        }
    });

    function logout() {
        localStorage.removeItem('AUTH_TOKEN');
        user.value = {};
        router.push({ name: 'Login' });
    }

    const getUser = computed(() => {
        return user.value ? user.value : {};
    });
    return {
        user,
        logout,
        getUser
    };
});
