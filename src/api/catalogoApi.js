import api from '@/lib/axios';

export default {
    // TODOS LOS USUARIOS
    findMaterias() {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get('/catalogo/materias', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    createMateria(data) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.post('/catalogo/materias', data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    updateMateria(data) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.put(`/catalogo/materias/${data.materia_id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    deleteMateria(materia_id) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.delete(`/catalogo/materias/${materia_id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    findCarreras() {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get('/catalogo/carreras', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    createCarrera(data) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.post('/catalogo/carreras', data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    updateCarrera(data) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.put(`/catalogo/carreras/${data.carrera_id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    deleteCarrera(carrera_id) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.delete(`/catalogo/carreras/${carrera_id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
};
