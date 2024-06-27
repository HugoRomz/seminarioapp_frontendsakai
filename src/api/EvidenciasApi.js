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
        return api.get(`/evidencias/tipos`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    createActividad(data) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.post(`/evidencias/actividad`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    updateActividad(data) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.put(`/evidencias/actividad`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    getEvidencias(actividad_id) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get(`/evidencias/${actividad_id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
};
