import api from '@/lib/axios';

export default {
    // TODOS LOS USUARIOS
    findSeminarioActivo() {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get('/seminario/seminarioActivo', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    rechazarCurso(dataCurso) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.put(`/seminario/rechazarCurso/${dataCurso.curso_periodo_id}`, dataCurso, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    loadPeriodos() {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get('/seminario/periodo', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    createPeriodo(dataPeriodo) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.post('/seminario/periodo', dataPeriodo, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    loadCursos() {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get('/seminario/cursos', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    loadModulos(perido_id) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get(`/seminario/modulos/${perido_id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    altaCursos(dataCurso) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.post('/seminario/altaCurso', dataCurso, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    getEvidencias(actividad_id) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get(`/seminario/evidencias/${actividad_id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    getCursoById(id) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get(`/seminario/curso/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    getMateriasCurso(id) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get(`/seminario/materiasCurso/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    getDocentes() {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get('/seminario/docentes', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    aceptarCurso(dataCurso) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.post('/seminario/aceptarCurso', dataCurso, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    loadAlumnos(cursoId) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get(`/seminario/alumnos/${cursoId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    asignarAlumnos(cursoId, alumnos) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.post(`/seminario/asignarAlumnos/${cursoId}`, alumnos, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    editModulo(modulo_id, dataModulo) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.put(`/seminario/modulo/${modulo_id}`, dataModulo, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    generarCalificaciones(modulo_id) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get(`/seminario/generarCalificaciones/${modulo_id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    obtenerAlumnosCurso(cursoId) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get(`/seminario/obtenerAlumnosCurso/${cursoId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    obtenerAlumnosConstancias(cursoId) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get(`/seminario/obtenerAlumnosConstancias/${cursoId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    obtenerTesinasyProyectos(cursoId) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get(`/seminario/obtenerTesinasyProyectos/${cursoId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    cerrarCurso(cursoId, data) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.put(`/seminario/cerrarCurso/${cursoId}`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
};
