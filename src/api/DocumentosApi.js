import api from '@/lib/axios';

export default {
    // ALUMNOS
    allUserAlumnos() {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get('/documentos/alumnos', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    userCurso() {
        const token = localStorage.getItem('AUTH_TOKEN');
        if (!token) {
            return Promise.reject('No authenticated');
        }
        return api.get('/documentos/user', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    getCursoDocumentos(userId) {
        const token = localStorage.getItem('AUTH_TOKEN');
        if (!token) {
            return Promise.reject('No authenticated');
        }
        return api.get(`/documentos/cursoDocumento/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
};
