import api from '@/lib/axios';

const BASE_URL = import.meta.env.VITE_API_URL;

export default {
    // Iniciar sesión con Google
    googleLogin(usuario_id) {
        window.location.href = `${BASE_URL}/google/auth/google?usuario_id=${usuario_id}`;
    },

    // Obtener eventos del calendario
    getEvents() {
        return api.get('google/events');
    },

    // Crear un nuevo evento en el calendario
    createEvent(eventData) {
        return api.post('google/create-event', eventData);
    },
    deleteEvent(eventId) {
        return api.delete(`google/delete-event/${eventId}`);
    }
};
