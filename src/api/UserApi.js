import api from '@/lib/axios';

export default {
    all() {
        return api.get('/user/preregister');
    },
    create(data) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.post('/user/preregister', data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
};
