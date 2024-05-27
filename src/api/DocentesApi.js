import api from '@/lib/axios';

export default {
    getModulos(id) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get(`/docentes/modulos/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
};
