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
    },
    allUserAlumnos() {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get('/user/alumnos', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    deleteAlumno(userId) {
        const token = localStorage.getItem('AUTH_TOKEN');
        // Asegúrate de que el `id` del usuario se incluye correctamente en la URL
        return api.delete(`/user/alumnos/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    createAlumno(data) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.post('/user/alumnos', data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    updateAlumno(data) {
        const token = localStorage.getItem('AUTH_TOKEN');
        // Asume que `data` contiene un campo `usuario_id` que es el identificador del alumno
        // y que el endpoint del servidor para actualizar un alumno espera ese `usuario_id` en la URL.
        return api.put(`/user/alumnos/${data.usuario_id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
};
