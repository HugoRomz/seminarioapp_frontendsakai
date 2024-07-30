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
    },

    // Roles
    findRoles() {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get('/catalogo/roles', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    createRol(data) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.post('/catalogo/roles', data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    updateRol(data) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.put(`/catalogo/roles/${data.rol_id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    deleteRol(rol_id) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.delete(`/catalogo/roles/${rol_id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    // Periodos
    findPeriodos() {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get('/catalogo/periodos', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    createPeriodo(data) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.post('/catalogo/periodos', data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    updatePeriodo(data) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.put(`/catalogo/periodos/${data.periodo_id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    deletePeriodo(periodo_id) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.delete(`/catalogo/periodos/${periodo_id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    // Documentos
    findDocumentos() {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get('/catalogo/documentos', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    createDocumento(data) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.post('/catalogo/documentos', data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    updateDocumento(data) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.put(`/catalogo/documentos/${data.documento_id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    deleteDocumento(documento_id) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.delete(`/catalogo/documentos/${documento_id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    // TIPO EVIDENCIAS
    findTipoEvidencias() {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get('/catalogo/tipoEvidencias', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    createTipoEvidencia(data) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.post('/catalogo/tipoEvidencias', data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    updateTipoEvidencia(data) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.put(`/catalogo/tipoEvidencias/${data.tipo_evidencia_id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    deleteTipoEvidencia(tipo_evidencia_id) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.delete(`/catalogo/tipoEvidencias/${tipo_evidencia_id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    // Cursos
    findCursos() {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get('/catalogo/cursos', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    createCurso(data) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.post('/catalogo/cursos', data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    updateCurso(data) {
        const token = localStorage.getItem('AUTH_TOKEN');
        console.log(data.curso_id);
        return api.put(`/catalogo/cursos/${data.curso_id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    asignarDocumentos(data) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.post('/catalogo/asginarDocumentos', data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    // Usuarios
    findUsuarios() {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get('/catalogo/usuarios', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    createUsuario(data) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.post('/catalogo/usuarios', data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    updateUsuario(data) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.put(`/catalogo/usuarios/${data.usuario_id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    deleteUsuario(usuario_id) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.delete(`/catalogo/usuarios/${usuario_id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
};
