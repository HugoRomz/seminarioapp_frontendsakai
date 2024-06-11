import api from '@/lib/axios';

export default {
    getModulos(id) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get(`/alumnos/modulos/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
};
