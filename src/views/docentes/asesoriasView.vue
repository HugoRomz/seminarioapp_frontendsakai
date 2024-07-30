<script setup>
import { ref, onMounted, inject, watch } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import timeGridDay from '@fullcalendar/timegrid';
import timeGridWeek from '@fullcalendar/timegrid';

const correos = ref([
    { name: 'hugo.rosales98@unach.mx', code: '1' },
    { name: 'carlos.martinez96@unach.mx', code: '2' }
]);

import Spinner from '../../components/Spinner.vue';
const loading = ref(false);
import DocenteApi from '../../api/DocentesApi.js';
import AuthAPI from '../../api/AuthAPI.js';
const asesorados = ref([]);

const toast = inject('toast');

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_API_KEY;

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

const authorizeButton = ref(null);
const signoutButton = ref(null);
let tokenClient;
let gapiInited = false;
let gisInited = false;

const showRechazo = ref(false);
const proyectoRechazo = ref({
    proyecto_id: '',
    comentario: ''
});

const selectedEvent = ref();
const showInfo = ref(false);
const isGoogleAuthenticated = ref(false);
const newEvent = ref({
    summary: '',
    description: '',
    start: '',
    end: '',
    attendees: [],
    meetLink: ''
});

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

const handleAuthClick = async () => {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw resp;
        }
        // Save token to localStorage
        localStorage.setItem('gapi_token', JSON.stringify(gapi.client.getToken()));
        if (signoutButton.value) signoutButton.value.style.visibility = 'visible';
        if (authorizeButton.value) authorizeButton.value.innerText = 'Refresh';
        await listUpcomingEvents();
        isGoogleAuthenticated.value = true;
    };

    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        tokenClient.requestAccessToken({ prompt: '' });
    }
};

const handleSignoutClick = () => {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token, () => {
            gapi.client.setToken('');
            // Remove token from localStorage
            localStorage.removeItem('gapi_token');

            isGoogleAuthenticated.value = false;
        });
    }
};

const listUpcomingEvents = async () => {
    let response;
    try {
        const request = {
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            showDeleted: false,
            singleEvents: true,
            maxResults: 10,
            orderBy: 'startTime'
        };
        response = await gapi.client.calendar.events.list(request);
        if (response) {
            const events = response.result.items.map((event) => ({
                id: event.id,
                title: event.summary,
                start: event.start.dateTime || event.start.date,
                end: event.end.dateTime || event.end.date,
                extendedProps: {
                    description: event.description || '',
                    location: event.location || '',
                    meetLink: event.hangoutLink || '',
                    attendees: event.attendees || []
                }
            }));
            calendarOptions.value.events = events;
        }
    } catch (err) {
        console.log('Error listing events: ', err);
        return;
    }
};

const initializeGapiClient = async () => {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC]
    });
    gapiInited = true;
    maybeEnableButtons();
};

const maybeEnableButtons = () => {
    if (gapiInited && gisInited) {
        const storedToken = localStorage.getItem('gapi_token');
        if (storedToken) {
            gapi.client.setToken(JSON.parse(storedToken));
            listUpcomingEvents();
            isGoogleAuthenticated.value = true;
        }
    }
};

const gapiLoaded = () => {
    gapi.load('client', initializeGapiClient);
};

const gisLoaded = () => {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '' // defined later
    });
    gisInited = true;
    maybeEnableButtons();
};

const loadScript = (src, onload) => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            onload();
            resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

const formatStartDate = (date) => {
    const eventDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (eventDate.toDateString() === today.toDateString()) {
        return `Hoy, ${eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (eventDate.toDateString() === tomorrow.toDateString()) {
        return `Mañana, ${eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
        return `${eventDate.getDate()}-${eventDate.getMonth() + 1}-${eventDate.getFullYear()} , ${eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
};

const getEventTime = (event) => {
    const eventDate = new Date(event);
    return eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const openlink = (link) => {
    window.open(link, '_blank');
};

const createNewEvent = async () => {
    const event = {
        summary: newEvent.value.summary,
        description: newEvent.value.description,
        start: {
            dateTime: newEvent.value.start.toISOString(),
            timeZone: 'America/Mexico_City'
        },
        end: {
            dateTime: newEvent.value.end.toISOString(),
            timeZone: 'America/Mexico_City'
        },
        attendees: newEvent.value.attendees.map((attendee) => ({ email: attendee.name })),
        conferenceData: {
            createRequest: {
                requestId: '7qxalsvy0e', // Unique request ID for the API
                conferenceSolutionKey: {
                    type: 'hangoutsMeet'
                }
            }
        },
        reminders: {
            useDefault: true
        }
    };

    if (newEvent.value.meetLink) {
        event.conferenceData = {
            entryPoints: [
                {
                    entryPointType: 'video',
                    uri: `https://meet.google.com/${newEvent.value.meetLink}`,
                    label: 'Google Meet'
                }
            ],
            conferenceSolution: {
                key: {
                    type: 'hangoutsMeet'
                },
                name: 'Google Meet',
                iconUri: 'https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v6/web-512dp/logo_meet_2020q4_color_2x_web_512dp.png'
            },
            conferenceId: newEvent.value.meetLink.replace(/-/g, ''),
            signature: 'sample_signature' // Agrega una firma adecuada si es necesario
        };
    }

    try {
        const response = await gapi.client.calendar.events.insert({
            calendarId: 'primary',
            resource: event,
            conferenceDataVersion: 1
        });
        toast.open({
            message: 'Se creo el evento correctamente',
            type: 'success'
        });
        await listUpcomingEvents();
        limpiarEventos();
    } catch (err) {
        console.log('Error creating event: ', err);
    }
};

const deleteEvent = async (eventId) => {
    try {
        await gapi.client.calendar.events.delete({
            calendarId: 'primary',
            eventId: eventId
        });
        showInfo.value = false;
        toast.open({
            message: 'Se elimino el evento correctamente',
            type: 'success'
        });
        await listUpcomingEvents();
    } catch (err) {
        console.log('Error deleting event: ', err);
    }
};

const limpiarEventos = () => {
    newEvent.value = {
        summary: '',
        description: '',
        start: '',
        end: '',
        attendees: [],
        meetLink: ''
    };
};

const loadAsesorados = async () => {
    loading.value = true;
    try {
        const response = await AuthAPI.auth();
        const response2 = await DocenteApi.getAsesorados(response.data.usuario_id);
        asesorados.value = response2.data;
    } catch (error) {
        console.error('Error loading asesorados: ', error);
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    try {
        await loadScript('https://apis.google.com/js/api.js', gapiLoaded);
        await loadScript('https://accounts.google.com/gsi/client', gisLoaded);
    } catch (error) {
        console.error('Error loading scripts: ', error);
    }
    loadAsesorados();
});

watch(
    () => newEvent.value.start,
    (newStart) => {
        if (newStart) {
            newEvent.value.end = '';
        }
    }
);

const formatUrl = (url) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return 'http://' + url;
    }
    return url;
};

const aceptarProyecto = async (proyectoId) => {
    loading.value = true;
    try {
        const response = await DocenteApi.aceptarProyecto(proyectoId);
        toast.open({
            message: 'Proyecto aceptado correctamente',
            type: 'success'
        });
        await loadAsesorados();
    } catch (error) {
        console.error('Error aceptando proyecto: ', error);
    } finally {
        loading.value = false;
    }
};

// rechazar proyecto con motivo
const rechazarProyecto = (proyecto_id) => {
    showRechazo.value = true;
    proyectoRechazo.value.proyecto_id = proyecto_id;
    proyectoRechazo.value.comentario = '';
};

const agregarComentario = async (proyectoRechazo) => {
    loading.value = true;
    try {
        const response = await DocenteApi.rechazarProyecto(proyectoRechazo);
        toast.open({
            message: 'Proyecto rechazado correctamente',
            type: 'success'
        });
        showRechazo.value = false;
        await loadAsesorados();
    } catch (error) {
        console.error('Error rechazando proyecto: ', error);
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <Spinner v-if="loading" />
    <div class="card">
        <TabView>
            <TabPanel header="Crear Asesorías">
                <h2 class="text-2xl font-bold mb-2">Asesorías</h2>

                <div class="grid">
                    <div class="col-12 lg:col-6">
                        <div v-if="!isGoogleAuthenticated">
                            <Button ref="authorizeButton" severity="contrast" outlined class="border-1" @click="handleAuthClick">
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
                                    <path
                                        d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                                        fill="#EB4335"
                                    />
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
                            <div class="w-full flex align-content-center justify-content-end">
                                <Button ref="signoutButton" severity="contrast" outlined class="border-1 mt-5" @click="handleSignoutClick">
                                    <span class="ml-2 font-bold">Cerrar Sesión</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 lg:col-6">
                        <FullCalendar :options="calendarOptions" />
                    </div>
                </div>
            </TabPanel>
            <TabPanel header="Equipos">
                <div class="w-full mx-auto">
                    <h2 class="text-2xl font-bold mb-5">Alumnos Asesorados</h2>
                    <div class="grid">
                        <div v-for="asesoria in asesorados" :key="asesoria.id" class="col-12 md:col-6">
                            <div class="card shadow-2 mx-1">
                                <h3 class="text-2xl font-bold text-black-alpha-90 mb-2">{{ asesoria.Alumno.nombre }} {{ asesoria.Alumno.apellido_p }} {{ asesoria.Alumno.apellido_m }}</h3>
                                <div class="text-gray-700 font-bold text-lg mb-2">
                                    <Avatar icon="pi pi-book" shape="circle" />
                                    <span class="ml-2">Tesina</span>
                                    <span class="mx-2">•</span>
                                    <span class="text-gray-500 font-medium">
                                        <template v-if="!asesoria.length">
                                            {{ asesoria.nombre_tesina }}
                                        </template>
                                        <template v-else> Pendiente </template>
                                    </span>
                                    <span class="mx-2">•</span>
                                    <span class="text-gray-500 font-medium"
                                        ><template v-if="asesoria.proyectos.length">
                                            <a :href="formatUrl(asesoria.proyectos[0].url_documento)" target="_blank">{{ asesoria.proyectos[0].url_documento }}</a>
                                        </template>
                                        <template v-else> Pendiente </template></span
                                    >
                                </div>
                                <div class="text-gray-700 font-bold text-lg mb-2">
                                    <Avatar icon="pi pi-users" shape="circle" />
                                    <span class="ml-2">Descripción</span>
                                    <span class="mx-2">•</span>
                                    <span class="text-gray-500 font-medium"> {{ asesoria.resenia_tesina }}</span>
                                </div>
                                <div class="text-gray-700 font-bold text-lg mb-2">
                                    <Avatar icon="pi pi-users" shape="circle" />
                                    <span class="ml-2">Status</span>
                                    <span class="mx-2">•</span>
                                    <span class="text-gray-500 font-medium">
                                        <Tag v-if="asesoria.status == 'PENDIENTE'" class="mr-2" severity="warning" value="Pendiente"></Tag>
                                        <Tag v-if="asesoria.status == 'ACEPTADO'" class="mr-2" severity="success" value="Aceptado"></Tag>
                                        <Tag v-if="asesoria.status == 'REGISTRADO'" class="mr-2" severity="success" value="Registrado"></Tag>
                                        <Tag v-if="asesoria.status == 'RECHAZADO'" class="mr-2" severity="danger" value="Rechazado"></Tag
                                    ></span>
                                </div>
                                <div class="text-gray-700 font-bold text-lg mb-2">
                                    <Avatar icon="pi pi-code" shape="circle" />
                                    <span class="ml-2">Proyecto</span>
                                    <span class="mx-2">•</span>
                                    <span class="text-gray-500 font-medium">
                                        <template v-if="asesoria.proyectos.length">
                                            {{ asesoria.proyectos[0].nombre_proyecto || 'Sin nombre' }}
                                        </template>
                                        <template v-else> Pendiente </template>
                                    </span>
                                    <span class="mx-2">•</span>
                                    <span class="text-gray-500 font-medium">
                                        <template v-if="asesoria.proyectos.length">
                                            <a :href="formatUrl(asesoria.proyectos[0].url_documento)" target="_blank">{{ asesoria.proyectos[0].url_documento }}</a>
                                        </template>
                                        <template v-else> Pendiente </template>
                                    </span>
                                    <span class="mx-2">•</span>
                                    <span class="mx-2">
                                        <template v-if="asesoria.proyectos.length && asesoria.proyectos[0].status === 'PENDIENTE'">
                                            <Button label="Aceptar" @click="aceptarProyecto(asesoria.proyectos[0].proyecto_id)" severity="success" class="mr-2" />
                                            <Button label="Rechazar" @click="rechazarProyecto(asesoria.proyectos[0].proyecto_id)" severity="danger" />
                                        </template>
                                        <template v-else-if="asesoria.proyectos.length && asesoria.proyectos[0].status === 'ACEPTADO'">
                                            <Tag class="mr-2" severity="success" value="Aceptado"></Tag>
                                        </template>
                                        <template v-else-if="asesoria.proyectos.length && asesoria.proyectos[0].status === 'RECHAZADO'">
                                            <Tag class="mr-2" severity="danger" value="Rechazado"></Tag>
                                        </template>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </div>

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
    <Dialog v-model:visible="showRechazo" :style="{ width: '450px' }" header="Agregar comentarios" :modal="true" :closable="false">
        <div class="flex flex-column align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle" style="font-size: 2rem" />
            <span class="mt-3">Ingrese el motivo del rechazo del documento</span>
            <InputText class="mt-3 w-8" v-model.trim="proyectoRechazo.comentario" placeholder="Comentarios" />
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" text @click="(showRechazo = false), (proyectoRechazo.comentario = '')" />
            <Button label="Yes" icon="pi pi-check" text @click="agregarComentario(proyectoRechazo)" />
        </template>
    </Dialog>
</template>
