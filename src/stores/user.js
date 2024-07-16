import { defineStore } from 'pinia';

import { useRouter } from 'vue-router';

import { ref } from 'vue';

export const useUser = defineStore('user', () => {
    const router = useRouter();

    const user = ref({});

    function logout() {
        localStorage.removeItem('AUTH_TOKEN');
        localStorage.removeItem('gapi_token');
        user.value = {};
        router.push({ name: 'Login' });
    }

    return {
        user,
        logout
    };
});
