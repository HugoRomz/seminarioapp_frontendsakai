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
    deleteActividad(actividad_id) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.delete(`/evidencias/actividad/${actividad_id}`, {
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
    },
    deleteEvidencia(evidencia_id) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.delete(`/evidencias/evidencia/${evidencia_id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    createEvidencia(formData) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.post('/evidencias/evidencia', formData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
};
