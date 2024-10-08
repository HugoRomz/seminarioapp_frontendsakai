import api from '@/lib/axios';

export default {
    createInvitation(data) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.post('/tesina/invitaciones', data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    createTesina(data) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.post('/tesina/tesinas', data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    getUserInvitations(userId) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get(`/tesina/invitaciones/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    getInvitationsForUser(userId) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get(`/tesina/invitaciones/invitado/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    acceptInvitation(invitacionId) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.put(
            `/tesina/invitaciones/aceptar/${invitacionId}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
    },
    rejectInvitation(invitacionId) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.put(
            `/tesina/invitaciones/rechazar/${invitacionId}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
    },
    getTesinasByUser(userId) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get(`/tesina/tesinas/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    saveUrlTesina(data) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.put(`/tesina/saveURL/${data.id_tesina}`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    saveProyecto(data) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.post(`/tesina/saveProyecto`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    getAllTesinas(perido_id) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get(`/tesina/tesinasall/${perido_id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    acceptTesinasByName(tesinaId, docenteId) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.put(`/tesina/aceptar/${tesinaId}`, { docenteId }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    acceptTesinaUrl(tesinaId) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.put(`/tesina/aceptarurl/${tesinaId}`, {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    rejectTesinasByName(tesinaId, motivo) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.delete(`/tesina/rechazar/registro/${tesinaId}/${motivo}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    rejectTesinaDocumento(tesinaId, motivo) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.put(`/tesina/rechazar/documento/${tesinaId}/${motivo}`, {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    getDocentesConTesinasAsignadas(perido_id) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get(`/tesina/docentes-asignados/${perido_id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    loadPeriodos() {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get('/tesina/periodo', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    getDocentes() {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.get('/tesina/docentes', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
};

