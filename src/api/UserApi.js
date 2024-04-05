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
    },
    delete(userId) {
        const token = localStorage.getItem('AUTH_TOKEN');
        // Asegúrate de que el `id` del usuario se incluye correctamente en la URL
        return api.delete(`/user/preregister/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
};
