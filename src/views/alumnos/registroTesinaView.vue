<script setup>
import { ref, inject, onMounted } from 'vue';
import TesinaApi from '../../api/TesinaApi';
import AuthAPI from '../../api/AuthAPI';
import Spinner from '../../components/Spinner.vue';

const toast = inject('toast');

const numeroCompañeros = 1;

const users = ref(null);
const loading = ref(true);
const showForm = ref(false);
const showTable = ref(false);
const showModal = ref(false);
const showAllAcceptedModal = ref(false);
const showRegisteredTesinasMessage = ref(false);
const invite = ref(null);

const RegTesina = ref({
    userId: null,
    nombre_tesina: '',
    area_tema: '',
    resenia_tema: '',
    invitado_email: []
});

const invitaciones = ref([]);
const tesinas = ref([]);
const invitacionesRecibidas = ref([]);

const getUserData = async () => {
    try {
        const response = await AuthAPI.auth();
        users.value = response.data;
        RegTesina.value.userId = users.value.usuario_id;
    } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
    }
};

const getUserInvitations = async () => {
    try {
        const response = await TesinaApi.getUserInvitations(RegTesina.value.userId);
        invitaciones.value = response.data;
    } catch (error) {
        console.error('Error al obtener las invitaciones:', error);
    }
};

const getInvitationsForUser = async () => {
    try {
        const responseInvitado = await TesinaApi.getInvitationsForUser(RegTesina.value.userId);
        invitacionesRecibidas.value = responseInvitado.data;
        console.log(invitacionesRecibidas.value);
    } catch (error) {
        console.error('Error al obtener las invitaciones recibidas:', error);
    }
};

const getUserTesinas = async () => {
    try {
        const response = await TesinaApi.getTesinasByUser(RegTesina.value.userId);
        tesinas.value = response.data;
        console.log(tesinas.value);
    } catch (error) {
        console.error('Error al obtener las tesinas del usuario:', error);
    }
};

const determineDisplayState = () => {
    if (tesinas.value.length > 0) {
        showRegisteredTesinasMessage.value = true;
        showForm.value = false;
        showTable.value = false;
        showModal.value = false;
        showAllAcceptedModal.value = false;
    } else if (invitacionesRecibidas.value.some((inv) => inv.status === 'ACEPTADO')) {
        showAllAcceptedModal.value = true;
        showForm.value = false;
        showTable.value = false;
        showModal.value = false;
    } else if (invitacionesRecibidas.value.some((inv) => inv.status === 'PENDIENTE')) {
        showModal.value = true;
        showForm.value = false;
        showTable.value = false;
    } else if (invitaciones.value.length > 0) {
        showTable.value = true;
        showForm.value = false;
        showModal.value = false;
        showAllAcceptedModal.value = false;
    } else {
        showForm.value = true;
        showTable.value = true;
        showModal.value = false;
        showAllAcceptedModal.value = false;
    }
};

const cargarData = async () => {
    await getUserInvitations();
    await getInvitationsForUser();
    await getUserTesinas();
    determineDisplayState();
    loading.value = false;
};

onMounted(async () => {
    await getUserData();
    cargarData();
});

const submitProject = async () => {
    loading.value = true;
    try {
        if (RegTesina.value.invitado_email.length === 0 && invite.value === 'yes') {
            toast.open({
                message: 'Por favor ingresa al menos un correo de compañero.',
                type: 'error'
            });
            return;
        }

        if (RegTesina.value.invitado_email.length === 0) {
            const response = await TesinaApi.createTesina(RegTesina.value);
            toast.open({
                message: 'Tesina registrada con éxito.',
                type: 'success'
            });
            cargarData();
        } else {
            const response = await TesinaApi.createInvitation(RegTesina.value);
            const { message, successfulInvitations, failedInvitations, pendingInvitations } = response.data;

            if (successfulInvitations.length > 0) {
                toast.open({
                    message: message,
                    type: 'success'
                });
            }

            if (failedInvitations.length > 0) {
                toast.open({
                    message: `No se encontraron compañeros con los siguientes correos: ${failedInvitations.join(', ')}`,
                    type: 'default'
                });
            }

            if (pendingInvitations.length > 0) {
                toast.open({
                    message: `Los siguientes correos tienen ya una invitación pendiente: ${pendingInvitations.join(', ')}`,
                    type: 'error'
                });
            }

            cargarData();
        }
    } catch (error) {
        toast.open({
            message: error.response && error.response.data.message ? error.response.data.message : 'Error al registrar la tesina',
            type: 'error'
        });
        showForm.value = true;
    } finally {
        loading.value = false;
    }
};

const aceptarInvitacion = async (invitacionId) => {
    loading.value = true;
    try {
        const response = await TesinaApi.acceptInvitation(invitacionId);
        toast.open({
            message: 'Has aceptado la invitación',
            type: 'success'
        });
        showModal.value = false;
        cargarData();
    } catch (error) {
        toast.open({
            message: 'Error al aceptar la invitación',
            type: 'error'
        });
    } finally {
        loading.value = false;
    }
};

const rechazarInvitacion = async (invitacionId) => {
    loading.value = true;
    try {
        const response = await TesinaApi.rejectInvitation(invitacionId);
        toast.open({
            message: 'Has rechazado la invitación',
            type: 'success'
        });
        showModal.value = false;
        cargarData();
    } catch (error) {
        toast.open({
            message: 'Error al rechazar la invitación',
            type: 'error'
        });
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <Spinner v-if="loading" />
    <div class="grid">
        <div v-if="showForm" class="col-12 lg:col-4">
            <div class="card">
                <h3>Registro de Tesina</h3>
                <div class="p-fluid">
                    <div class="field">
                        <label for="nombre_tesina">Nombre de la Tesina</label>
                        <InputText id="nombre_tesina" v-model="RegTesina.nombre_tesina" required />
                    </div>
                    <div class="field">
                        <label for="area_tema">Área de la Tesina</label>
                        <InputText id="area_tema" v-model="RegTesina.area_tema" required />
                    </div>
                    <div class="field">
                        <label for="resenia_tema">Reseña de la Tesina</label>
                        <Textarea id="resenia_tema" v-model="RegTesina.resenia_tema" rows="3" required />
                    </div>
                    <div class="field">
                        <label for="invite">¿Desea invitar a algún compañero?</label>
                        <div class="flex flex-wrap gap-3">
                            <div class="flex align-items-center">
                                <RadioButton inputId="inviteYes" name="invite" value="yes" v-model="invite" />
                                <label for="inviteYes" class="ml-2">Sí</label>
                            </div>
                            <div class="flex align-items-center">
                                <RadioButton inputId="inviteNo" name="invite" value="no" v-model="invite" />
                                <label for="inviteNo" class="ml-2">No</label>
                            </div>
                        </div>
                    </div>
                    <div class="field" v-if="invite === 'yes'">
                        <label for="invitado_email">Correo de tu compañero</label>
                        <Chips id="invitado_email" v-model="RegTesina.invitado_email" separator="," placeholder="correo@unach.mx" :max="numeroCompañeros" />
                        <InlineMessage severity="info" class="mt-2"> Presiona Enter para agregar un correo. </InlineMessage>
                    </div>
                    <Button label="Enviar Proyecto" class="p-mt-2" @click="submitProject" />
                </div>
            </div>
        </div>
        <!-- <p><strong>Área:</strong> {{ invitacion.area_tema }}</p>
                            <p><strong>Reseña:</strong> {{ invitacion.resenia_tema }}</p>
                            <p><strong>Invitado:</strong> {{ invitacion.usuario.nombre }} ({{ invitacion.usuario.email_usuario }})</p>
                            <p><strong>Estado:</strong> {{ invitacion.status }}</p> -->
        <div v-if="showTable" class="col">
            <Card>
                <template #title> Invitaciones Realizadas</template>
                <template #content>
                    <div class="grid">
                        <div v-for="invitacion in invitaciones" :key="invitacion.id" class="col-12 lg:col-4">
                            <Card>
                                <template #content>
                                    <div class="flex flex-column">
                                        <div class="flex flex-row align-items-center">
                                            <Avatar icon="pi pi-user" class="mr-2" size="large" shape="circle" />
                                            <div class="flex-column">
                                                <div class="font-bold text-lg">{{ invitacion.usuario.nombre }}</div>
                                                <div class="text-base">Invitado</div>
                                            </div>
                                        </div>
                                        <h3 class="text-2xl font-semibold">{{ invitacion.nombre_tesina }}</h3>
                                        <div class="text-500 font-semibold">Área: {{ invitacion.area_tema }}</div>
                                        <p class="my-3">
                                            {{ invitacion.resenia_tema }}
                                        </p>
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <Tag :severity="invitacion.status === 'PENDIENTE' ? 'warning' : 'contrast'">
                                                <div class="flex align-items-center gap-2 px-1">
                                                    <span class="text-base">{{ invitacion.status }}</span>
                                                </div>
                                            </Tag>
                                        </div>
                                    </div>
                                </template>
                            </Card>
                        </div>
                    </div>
                </template>
            </Card>
        </div>
        <div>
            <Card v-if="showModal">
                <template #title> Invitaciones Recibidas</template>
                <template #content>
                    <div class="grid">
                        <div v-for="invitacion in invitacionesRecibidas" :key="invitacion.invitacion_id" class="col-12 lg:col-4">
                            <Card>
                                <template #content>
                                    <div class="flex flex-column">
                                        <div class="flex flex-row align-items-center">
                                            <Avatar icon="pi pi-user" class="mr-2" size="large" shape="circle" />
                                            <div class="flex-column">
                                                <div class="font-bold text-lg">{{ invitacion.anfitrion.nombre }}</div>
                                                <div class="text-base">Anfitrión</div>
                                            </div>
                                        </div>
                                        <h3 class="text-2xl font-semibold">{{ invitacion.nombre_tesina }}</h3>
                                        <div class="text-500 font-semibold">Área: {{ invitacion.area_tema }}</div>
                                        <p class="my-3">
                                            {{ invitacion.resenia_tema }}
                                        </p>
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <Button label="Aceptar" class="p-mr-2" @click="aceptarInvitacion(invitacion.invitacion_id)" />
                                            <Button label="Rechazar" class="p-button-danger" @click="rechazarInvitacion(invitacion.invitacion_id)" />
                                        </div>
                                    </div>
                                </template>
                            </Card>
                        </div>
                    </div>
                </template>
            </Card>

            <Card v-if="showAllAcceptedModal" header="Tesinas Aceptadas" class="p-mb-4">
                <template #content>
                    <p>Has aceptado la invitación. Espera a que la tesina se registre</p>
                </template>
            </Card>
        </div>
    </div>
    <div id="showTesinasRegistradas">
        <Message severity="info" v-if="showRegisteredTesinasMessage"> Ya estas registrado en una tesina </Message>
        <Card v-if="showRegisteredTesinasMessage">
            <template #content>
                <div class="grid">
                    <div class="col-12">
                        {{ tesinas }}
                    </div>
                    <div class="col-6">
                        <div class="card">
                            <FileUpload
                                name="documento"
                                @uploader="console.log($event)"
                                :accept="'application/pdf'"
                                :multiple="false"
                                :maxFileSize="1000000"
                                :fileLimit="1"
                                :invalidFileSizeMessage="'El tamaño del archivo debe ser menor a 1 MB'"
                                customUpload
                            >
                                <template #empty>
                                    <div class="flex align-items-center justify-content-center flex-column">
                                        <i class="pi pi-cloud-upload border-2 border-circle p-5 text-8xl text-400 border-400" />
                                        <p class="mt-4 mb-0 text-center">'Arrastra y suelta un archivo aquí o haz clic para seleccionar un archivo.'</p>
                                    </div>
                                </template>
                            </FileUpload>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="card">
                            <FileUpload
                                name="documento"
                                @uploader="console.log($event)"
                                :accept="'application/pdf'"
                                :multiple="false"
                                :maxFileSize="1000000"
                                :fileLimit="1"
                                :invalidFileSizeMessage="'El tamaño del archivo debe ser menor a 1 MB'"
                                customUpload
                            >
                                <template #empty>
                                    <div class="flex align-items-center justify-content-center flex-column">
                                        <i class="pi pi-cloud-upload border-2 border-circle p-5 text-8xl text-400 border-400" />
                                        <p class="mt-4 mb-0 text-center">'Arrastra y suelta un archivo aquí o haz clic para seleccionar un archivo.'</p>
                                    </div>
                                </template>
                            </FileUpload>
                        </div>
                    </div>
                </div>
            </template>
        </Card>
    </div>
</template>
