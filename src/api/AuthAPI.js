import api from '@/lib/axios';

export default {
    register(data) {
        return api.post('/auth/preregistro', data);
    },
    login(data) {
        return api.post('/auth/login', data);
    },
    auth() {
        const token = localStorage.getItem('AUTH_TOKEN');
        if (!token) {
            return Promise.reject('No authenticated');
        }
        return api.get('/auth/user', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
};
