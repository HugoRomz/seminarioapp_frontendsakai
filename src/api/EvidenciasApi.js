import api from '@/lib/axios';

export default {
    getModulos(id) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get(`/evidencias/modulos/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    getTipoEvidencias() {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get(`/evidencias/tipos/`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
};
