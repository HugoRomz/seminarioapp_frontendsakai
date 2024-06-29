<script setup>
import { ref } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

const showModal = ref(false);

const calendarOptions = {
    locale: esLocale,
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    events: [
        {
            id: 'evento1',
            title: 'Evento 1',
            start: '2024-07-01T09:00:00',
            end: '2024-07-01T10:30:00',
            backgroundColor: '#3788D8',
            extendedProps: {
                description: 'Descripción detallada del Evento 1',
                lugar: 'Lugar del Evento 1',
                organizador: 'Organizador del Evento 1',
                meetLink: 'https://meet.example.com/event1'
            }
        },
        {
            id: 'evento2',
            title: 'Evento 2',
            start: '2024-07-15T14:00:00',
            end: '2024-07-15T15:30:00',
            backgroundColor: '#FFC107',
            extendedProps: {
                description: 'Descripción detallada del Evento 2',
                lugar: 'Lugar del Evento 2',
                organizador: 'Organizador del Evento 2',
                meetLink: 'https://meet.example.com/event2'
            }
        },
        {
            id: 'evento3',
            title: 'Evento 3',
            start: '2024-07-30T10:00:00',
            end: '2024-07-30T11:30:00',
            backgroundColor: '#28A745',
            extendedProps: {
                description: 'Descripción detallada del Evento 3',
                lugar: 'Lugar del Evento 3',
                organizador: 'Organizador del Evento 3',
                meetLink: 'https://meet.example.com/event3'
            }
        },
        {
            id: 'evento4',
            title: 'Evento 4',
            start: '2024-07-30T10:00:00',
            end: '2024-07-30T11:30:00',
            backgroundColor: '#28A745',
            extendedProps: {
                description: 'Descripción detallada del Evento 3',
                lugar: 'Lugar del Evento 3',
                organizador: 'Organizador del Evento 3',
                meetLink: 'https://meet.example.com/event3'
            }
        }
    ],
    eventClick: handleEventClick
};

const eventDetails = ref({
    title: '',
    start: '',
    end: '',
    description: '',
    lugar: '',
    organizador: '',
    meetLink: ''
});

function handleEventClick(eventInfo) {
    const { title, start, end, extendedProps } = eventInfo.event;
    showModal.value = true;

    eventDetails.value = {
        title,
        start,
        end,
        description: extendedProps.description || '',
        lugar: extendedProps.lugar || '',
        organizador: extendedProps.organizador || '',
        meetLink: extendedProps.meetLink || ''
    };
}
</script>

<template>
    <Card>
        <template #content>
            <div class="grid">
                <div class="col-6"></div>
                <div class="col-6">
                    <FullCalendar :options="calendarOptions" />
                </div>
            </div>
        </template>
    </Card>
    <Dialog v-model:visible="showModal" position="top">
        <div class="card">
            <h3>Detalles del Evento</h3>
            <p>Titulo: {{ eventDetails.title }}</p>
            <p>Inicio: {{ eventDetails.start }}</p>
            <p>Fin: {{ eventDetails.end }}</p>
            <p>Descripción: {{ eventDetails.description }}</p>
            <p>Lugar: {{ eventDetails.lugar }}</p>
            <p>Organizador: {{ eventDetails.organizador }}</p>
            <p v-if="eventDetails.meetLink">
                <a :href="eventDetails.meetLink" target="_blank">Enlace a la reunión</a>
            </p>
        </div>
    </Dialog>
</template>
