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
    createPeriodo(dataPeriodo) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.post('/seminario/periodo', dataPeriodo, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
};
