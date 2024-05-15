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
    altaCursos(dataCurso) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.post('/seminario/altaCurso', dataCurso, {
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
    }
};
