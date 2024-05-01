import api from '@/lib/axios';

export default {
    // TODOS LOS USUARIOS
    findSeminarioActivo() {
        return api.get('/seminario/seminarioActivo');
    }
};
