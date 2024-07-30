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
    },
    getAsesorados(id) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get(`/docentes/asesorados/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    aceptarProyecto(id) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.put(`/docentes/aceptarProyecto/${id}`, id, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    rechazarProyecto(data) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.put(`/docentes/rechazarProyecto/${data.proyecto_id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
};
