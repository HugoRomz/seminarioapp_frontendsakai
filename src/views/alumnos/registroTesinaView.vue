<script setup>
import { ref, inject, onMounted } from 'vue';
import TesinaApi from '../../api/TesinaApi';
import AuthAPI from '../../api/AuthAPI';
import Spinner from '../../components/Spinner.vue';

const isAccepting = ref(false);
const toast = inject('toast');

const users = ref(null);
const loading = ref(true);
const showForm = ref(false);
const showTable = ref(false);
const showModal = ref(false);
const showAllAcceptedModal = ref(false);
const invite = ref(null);  // Change to null to handle the Yes/No selection

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
    } catch (error) {
        console.error('Error al obtener las invitaciones recibidas:', error);
    }
};

const determineDisplayState = () => {
    if (invitacionesRecibidas.value.length > 0) {
        showModal.value = true;
        showForm.value = false;
        showTable.value = false;
    } else if (invitaciones.value.length > 0) {
        showForm.value = false;
        showTable.value = true;
    } else {
        showForm.value = true;
        showTable.value = true;
    }
};

const getUserTesinas = async () => {
    try {
        const response = await TesinaApi.getTesinasByUser(RegTesina.value.userId);
        console.log(response.data);
    } catch (error) {
        console.error('Error al obtener las tesinas del usuario:', error);
    }
};

onMounted(async () => {
    await getUserData();
    await getUserInvitations();
    await getInvitationsForUser();
    determineDisplayState();
    loading.value = false;
    await getUserTesinas();  
});

const submitProject = async () => {
    console.log(RegTesina.value);
    try {
        if (RegTesina.value.invitado_email.length === 0) {
            const response = await TesinaApi.createTesina(RegTesina.value);
            toast.open({
                message: 'Tesina registrada con éxito.',
                type: 'success'
            });
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

            await getUserInvitations();
            determineDisplayState();
        }
    } catch (error) {
        toast.open({
            message: error.response && error.response.data.message ? error.response.data.message : 'Error al registrar la tesina',
            type: 'error'
        });
        showForm.value = true;
    }
};

const aceptarInvitacion = async (invitacionId) => {
    console.log(invitacionId);
    try {
        const response = await TesinaApi.acceptInvitation(invitacionId);
        toast.open({
            message: 'Has aceptado la invitación',
            type: 'success'
        });
        showModal.value = false;
        await getUserInvitations();
        await getInvitationsForUser();
        determineDisplayState();
    } catch (error) {
        toast.open({
            message: 'Error al aceptar la invitación',
            type: 'error'
        });
    }
};

const rechazarInvitacion = async (invitacionId) => {
    try {
        const response = await TesinaApi.rejectInvitation(invitacionId);
        toast.open({
            message: 'Has rechazado la invitación',
            type: 'success'
        });
        showModal.value = false;
        await getUserInvitations();
        await getInvitationsForUser();
        determineDisplayState();
    } catch (error) {
        toast.open({
            message: 'Error al rechazar la invitación',
            type: 'error'
        });
    }
};
</script>

<template>
    <Spinner v-if="loading" />
    <div class="grid" v-else>
        <div v-if="showForm" class="col-12 lg:col-4">
            <div class="card">
                <h3>Registro de Tesina</h3>
                <div class="p-fluid">
                    <div class="field">
                        <label for="nombre_tesina">Nombre de la Tesina</label>
                        <InputText id="nombre_tesina" v-model="RegTesina.nombre_tesina" />
                    </div>
                    <div class="field">
                        <label for="area_tema">Área de la Tesina</label>
                        <InputText id="area_tema" v-model="RegTesina.area_tema" />
                    </div>
                    <div class="field">
                        <label for="resenia_tema">Reseña de la Tesina</label>
                        <Textarea id="resenia_tema" v-model="RegTesina.resenia_tema" rows="3" />
                    </div>
                    <div class="field">
                        <label for="invite">¿Desea invitar a algún compañero?</label>
                        <div class="p-formgroup-inline">
                            <div class="field-radiobutton">
                                <RadioButton inputId="inviteYes" name="invite" value="yes" v-model="invite" />
                                <label for="inviteYes">Sí</label>
                            </div>
                            <div class="field-radiobutton">
                                <RadioButton inputId="inviteNo" name="invite" value="no" v-model="invite" />
                                <label for="inviteNo">No</label>
                            </div>
                        </div>
                    </div>
                    <div class="field" v-if="invite === 'yes'">
                        <label for="invitado_email">Correos de los Compañeros</label>
                        <Chips id="invitado_email" v-model="RegTesina.invitado_email" separator="," />
                    </div>
                    <Button label="Enviar Proyecto" class="p-mt-2" @click="submitProject" />
                </div>
            </div>
        </div>
        <div v-if="showTable" class="col">
            <div class="card">
                <h3>Invitaciones Realizadas</h3>
                <div class="grid">
                    <div v-for="invitacion in invitaciones" :key="invitacion.id" class="col-12 lg:col-4">
                        <div class="card">
                            <h4>{{ invitacion.nombre_tesina }}</h4>
                            <p><strong>Área:</strong> {{ invitacion.area_tema }}</p>
                            <p><strong>Reseña:</strong> {{ invitacion.resenia_tema }}</p>
                            <p><strong>Invitado:</strong> {{ invitacion.usuario.nombre }} ({{ invitacion.usuario.email_usuario }})</p>
                            <p><strong>Estado:</strong> {{ invitacion.status }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div>
            <Card v-if="showModal" header="Invitación Recibida" class="p-mb-4">
                <template #content>
                    <p>Has recibido una invitación. ¿Deseas aceptarla o rechazarla?</p>
                    <div v-for="invitacion in invitacionesRecibidas" :key="invitacion.invitacion_id">
                        <p>{{ invitacion.nombre_tesina }}</p>
                        <Button label="Aceptar" class="p-mr-2" @click="aceptarInvitacion(invitacion.invitacion_id)" />
                        <Button label="Rechazar" class="p-button-danger" @click="rechazarInvitacion(invitacion.invitacion_id)" />
                    </div>
                </template>
            </Card>
            <Card v-if="showAllAcceptedModal" header="Tesinas Registradas" class="p-mb-4">
                <template #content>
                    <p>Has aceptado todas las invitaciones. A continuación se muestran tus tesinas registradas:</p>
                    <div v-for="tesina in tesinas" :key="tesina.tesina_id">
                        <p>{{ tesina.nombre_tesina }}</p>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>
