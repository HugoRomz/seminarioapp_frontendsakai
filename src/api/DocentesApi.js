import api from '@/lib/axios';

export default {
    getModulos(id) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get(`/docentes/modulos/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    updateCalificacion(id, data) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.put(`/docentes/calificaciones/${id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
};
