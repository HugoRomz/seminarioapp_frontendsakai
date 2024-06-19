import api from '@/lib/axios';

export default {
    reporteError(data) {
        const token = localStorage.getItem('AUTH_TOKEN');
        return api.post('/config/reporteError', data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
};
