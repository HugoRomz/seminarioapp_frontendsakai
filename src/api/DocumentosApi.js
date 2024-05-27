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
    allUserDocentes() {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get('/documentos/docentes', {
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
    agregarComentario(dataComentario) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.put(`/documentos/comentarios/${dataComentario.alumno_estado_id}`, dataComentario, {
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
    },
    updateDocumentoStatus(data) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.put(`/documentos/actualizarEstado/${data.alumno_estado_id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    aceptarDocUsuario(data) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.post(`/documentos/aceptarDocUsuario/${data.alumno_estado_id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    subirDocumentos(formData) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.post('/documentos/subir', formData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    agregarComentariosDocente(dataComentario) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.put(`/documentos/comentariosDocente/${dataComentario.docente_estado_id}`, dataComentario, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    updateDocumentoStatusDocente(data) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.put(`/documentos/actualizarEstadoDocente/${data.docente_estado_id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    aceptarDocUsuarioDocente(data) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.post(`/documentos/aceptarDocUsuarioDocente/${data.docente_estado_id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    getCursoDocumentosDocente(userId) {
        const token = localStorage.getItem('AUTH_TOKEN');
        if (!token) {
            return Promise.reject('No authenticated');
        }
        return api.get(`/documentos/cursoDocumentoDocente/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    subirDocumentosDocente(formData) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.post('/documentos/subirDocDocente', formData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
};
