<script setup>
import { ref, onMounted, inject, watch } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import timeGridDay from '@fullcalendar/timegrid';
import timeGridWeek from '@fullcalendar/timegrid';

const toast = inject('toast');
const showInfo = ref(false);

import AuthAPI from '../../api/AuthAPI.js';

const correos = ref([
    { name: 'hugo.rosales98@unach.mx', code: '1' },
    { name: 'carlos.martinez96@unach.mx', code: '2' }
]);

const handleEventClick = (info) => {
    showInfo.value = true;
    selectedEvent.value = {
        id: info.event.id,
        title: info.event.title,
        start: info.event.start,
        end: info.event.end,
        description: info.event.extendedProps.description,
        attendees: info.event.extendedProps.attendees,
        meetLink: info.event.extendedProps.meetLink
    };
};

const calendarOptions = ref({
    plugins: [dayGridPlugin, interactionPlugin, timeGridDay, timeGridWeek],
    initialView: 'dayGridMonth',
    locale: esLocale,
    headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: [],
    eventClick: handleEventClick
});

const selectedEvent = ref();

import googleApi from '../../api/googleApi.js';
const isGoogleAuthenticated = ref(false);
const newEvent = ref({
    summary: '',
    description: '',
    location: '',
    start: '',
    end: '',
    attendees: [],
    meetLink: ''
});

const loginWithGoogle = async () => {
    try {
        const data = await await AuthAPI.auth();
        const usuario_id = data.data.usuario_id;
        await googleApi.googleLogin(usuario_id);
    } catch {
        isGoogleAuthenticated.value = false;
    }
};

const formatStartDate = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const eventDate = new Date(date);
    const eventDay = eventDate.getDate();
    const eventMonth = eventDate.getMonth() + 1;
    const eventYear = eventDate.getFullYear();

    if (eventDate.toDateString() === today.toDateString()) {
        return `Hoy, ${eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (eventDate.toDateString() === tomorrow.toDateString()) {
        return `Mañana, ${eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
        return `${eventDay}-${eventMonth}-${eventYear} , ${eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
};

const getEventTime = (event) => {
    const eventDate = new Date(event);
    const eventTime = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return eventTime;
};

const fetchEvents = async () => {
    try {
        const response = await googleApi.getEvents();

        const googleEvents = response.data.map((event) => ({
            id: event.id,
            title: event.summary,
            start: event.start.dateTime || event.start.date,
            end: event.end.dateTime || event.end.date,
            extendedProps: {
                description: event.description || '',
                lugar: event.location || '',
                organizador: event.organizer.email || '',
                meetLink: event.conferenceData?.entryPoints[0]?.uri || '',
                attendees: event.attendees || []
            }
        }));
        calendarOptions.value.events = googleEvents;
        isGoogleAuthenticated.value = true;
    } catch {
        isGoogleAuthenticated.value = false;
    }
};

const createNewEvent = async () => {
    try {
        const response = await googleApi.createEvent(newEvent.value);

        toast.open({
            message: response.data.msg,
            type: 'success'
        });
        await fetchEvents();
        limpiarEventos();
    } catch (error) {
        toast.open({
            message: error.response.data.msg,
            type: 'error'
        });
    }
};
onMounted(fetchEvents);

const limpiarEventos = () => {
    newEvent.value = {
        summary: '',
        description: '',
        location: '',
        start: '',
        end: '',
        attendees: [],
        meetLink: ''
    };
};

watch(
    () => newEvent.value.start,
    (newStart) => {
        if (newStart) {
            newEvent.value.end = '';
        }
    }
);

const deleteEvent = async (eventId) => {
    try {
        const response = await googleApi.deleteEvent(eventId);
        toast.open({
            message: response.data.msg,
            type: 'success'
        });
        await fetchEvents();
        showInfo.value = false;
    } catch (error) {
        toast.open({
            message: error.response.data.msg,
            type: 'error'
        });
    }
};

const openlink = (link) => {
    window.open(link, '_blank');
};
</script>

<template>
    <Card>
        <template #content>
            <div class="grid">
                <div class="col-12 lg:col-6">
                    <div v-if="!isGoogleAuthenticated">
                        <Button severity="contrast" outlined class="border-1" @click="loginWithGoogle">
                            <svg width="25px" height="25px" viewBox="-3 0 262 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
                                <path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4" />
                                <path
                                    d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                                    fill="#34A853"
                                />
                                <path
                                    d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
                                    fill="#FBBC05"
                                />
                                <path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335" />
                            </svg>
                            <span class="ml-2 font-bold">Iniciar Sesión con Google </span>
                        </Button>
                    </div>
                    <div v-else>
                        <Card>
                            <template #title> Crear Asesoria </template>

                            <template #content>
                                <div class="p-fluid">
                                    <div class="field">
                                        <label for="titulo">Título</label>
                                        <InputText v-model="newEvent.summary" placeholder="Título del evento" required />
                                    </div>
                                    <div class="field">
                                        <label for="descripcion">Descripción</label>
                                        <Textarea v-model="newEvent.description" placeholder="Descripción" required />
                                    </div>
                                    <div class="field">
                                        <label for="inicio">Inicio</label>
                                        <Calendar v-model="newEvent.start" showTime hourFormat="12" required :minDate="new Date()" />
                                    </div>
                                    <div class="field">
                                        <label for="final">Final</label>
                                        <Calendar v-model="newEvent.end" showTime hourFormat="12" required :minDate="new Date(newEvent.start)" />
                                    </div>
                                    <div class="field">
                                        <label for="correos">Correos</label>
                                        <MultiSelect v-model="newEvent.attendees" :options="correos" optionLabel="name" placeholder="Selecciona participantes" :maxSelectedLabels="2" />
                                    </div>
                                    <div class="field">
                                        <label for="meetlink">
                                            Código de enlace a la reunión de Google Meet
                                            <small class="text-red-700">(opcional)</small>
                                        </label>
                                        <InputMask id="basic" v-model="newEvent.meetLink" mask="***-***-***" placeholder="abc-dfg-hij" />
                                    </div>
                                </div>
                            </template>
                            <template #footer>
                                <Button label="Limpiar" icon="pi pi-times" text="" @click="limpiarEventos" />
                                <Button label="Guardar" icon="pi pi-check" text="" @click="createNewEvent" />
                            </template>
                        </Card>
                    </div>
                </div>
                <div class="col-12 lg:col-6">
                    <FullCalendar :options="calendarOptions" />
                </div>
            </div>
        </template>
    </Card>

    <Dialog v-model:visible="showInfo" modal :header="selectedEvent?.title" class="w-full md:w-3" position="top">
        <template #header>
            <div class="inline-flex align-items-center justify-content-center gap-2">
                <i class="pi pi-calendar text-surface-0" style="font-size: 2.2rem"></i>
                <span class="font-bold text-2xl text-surface-0">{{ selectedEvent?.title }}</span>
            </div>
        </template>
        <div class="inline-flex align-items-center gap-2 text-500">
            <i class="pi pi-clock" style="font-size: 1.5rem"></i>
            <span class="font-medium text-base">{{ formatStartDate(selectedEvent?.start) }} - {{ getEventTime(selectedEvent?.end) }}</span>
        </div>
        <div class="flex flex-column row-gap-3 mt-5 text-500">
            <div class="inline-flex align-items-center justify-content-between gap-2">
                <div class="inline-flex align-items-center justify-content-center column-gap-2">
                    <i class="pi pi-globe" style="font-size: 1.5rem"></i>
                    <span class="font-medium text-base"> Link de la reunión: </span>
                </div>
                <Button label="Unirse a Meet" severity="secondary" icon="pi pi-video" :disabled="!selectedEvent.meetLink" @click="openlink(selectedEvent.meetLink)" />
            </div>
            <p>{{ selectedEvent?.description }}</p>
            <div class="inline-flex align-items-center justify-content-between gap-2">
                <div class="inline-flex align-items-center justify-content-center column-gap-2">
                    <i class="pi pi-users" style="font-size: 1.5rem"></i>
                    <span class="font-medium text-base">Asistentes del Evento </span>
                </div>
            </div>
            <div v-for="(attendee, index) in selectedEvent?.attendees" :key="index" class="ml-2">
                <div class="inline-flex align-items-center gap-2">
                    <Avatar icon="pi pi-user" shape="circle" />
                    <span class="font-bold">{{ attendee.email }}</span>
                </div>
            </div>
        </div>
        <template #footer>
            <Button label="Eliminar" severity="danger" outlined @click="deleteEvent(selectedEvent.id)" />
        </template>
    </Dialog>
</template>
