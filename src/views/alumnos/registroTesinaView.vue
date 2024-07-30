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
const showAcceptedTesinasMessage = ref(false);
const invite = ref(null);

const tesinaform = ref({});
const proyectoform = ref({});
const existTesina = ref(false);
const existProyecto = ref(false);

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

const getUserTesinas = async () => {
    try {
        const response = await TesinaApi.getTesinasByUser(RegTesina.value.userId);
        tesinas.value = response.data;

        if (tesinas.value.length > 0) {
            existTesina.value = tesinas.value[0];

            if (existTesina.value.proyectos && existTesina.value.proyectos.length > 0) {
                existProyecto.value = existTesina.value.proyectos[0];
            } else {
                existProyecto.value = {};
            }
        } else {
            existTesina.value = {};
            existProyecto.value = {};
        }
    } catch (error) {
        console.error('Error al obtener las tesinas del usuario:', error);
    }
};

const determineDisplayState = () => {
    if (tesinas.value.length > 0) {
        showAcceptedTesinasMessage.value = true;
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

const formatFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString();
};

const limpiarTesina = () => {
    tesinaform.value = null;
};
const limpiarProyecto = () => {
    proyectoform.value = null;
};

const saveUrlTesina = async () => {
    loading.value = true;

    tesinaform.value.id_tesina = existTesina.value.tesina_id;

    try {
        const response = await TesinaApi.saveUrlTesina(tesinaform.value);
        toast.open({
            message: response.data.msg,
            type: 'success'
        });
        cargarData();
    } catch (error) {
        toast.open({
            message: error.response && error.response.data.message ? error.response.data.message : 'Error al guardar la url de la tesina',
            type: 'error'
        });
    } finally {
        loading.value = false;
    }
};

const saveUrlProyecto = async () => {
    loading.value = true;

    proyectoform.value.tesina_id = existTesina.value.tesina_id;
    proyectoform.value.nombre_proyecto = existTesina.value.nombre_tesina;
    proyectoform.value.descripcion_proyecto = existTesina.value.resenia_tesina;

    try {
        const response = await TesinaApi.saveProyecto(proyectoform.value);
        toast.open({
            message: response.data.msg,
            type: 'success'
        });
        cargarData();
    } catch (error) {
        toast.open({
            message: error.response && error.response.data.message ? error.response.data.message : 'Error al guardar la url de la tesina',
            type: 'error'
        });
    } finally {
        loading.value = false;
    }
};

const openFilePreview = (url) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'http://' + url;
    }
    window.open(url, '_blank');
};
</script>

<template>
    <Spinner v-if="loading" />
    <div class="grid-nogutter">
        <!-- FORM PARA REGISTRAR TESINA Y COMPAÑEROS -->
        <div v-if="showForm" class="col-12 md:col-6">
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
                    <Button label="Enviar Proyecto" class="mt-2" @click="submitProject" />
                </div>
            </div>
        </div>
        <!-- TABLA DE INVITACIONES REALIZADAS -->
        <div v-if="showTable" class="col-12 md:col-6">
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
        <!-- INVITACIONES RECIBIDAS -->
        <div v-if="showModal" class="col-12 md:col-6">
            <Card>
                <template #title> Invitaciones Recibidas</template>
                <template #content>
                    <div class="grid">
                        <div v-for="invitacion in invitacionesRecibidas" :key="invitacion.invitacion_id" class="col-12">
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
            <!-- Invitaciones Pendientes de aceptar   -->
            <Card v-if="showAllAcceptedModal" header="Tesinas Aceptadas" class="">
                <template #content>
                    <p>Has aceptado la invitación. Espera a que tus compañeros acepten la invitación.</p>
                </template>
            </Card>
        </div>
        <!-- SI YA ESTA REGISTRADA LA TESINA -->
        <div id="showTesinasRegistradas">
            <Message severity="info" v-if="showAcceptedTesinasMessage"> Ya estas registrado en una tesina </Message>
            <Card v-if="showAcceptedTesinasMessage">
                <template #content>
                    <div class="grid" v-for="tesina in tesinas" :key="tesina.id">
                        <div class="col-12">
                            <div class="grid">
                                <div class="col-12">
                                    <h1 class="font-bold text-900 text-3xl my-0">Detalles</h1>
                                    <p class="text-500">Aquí puedes ver los detalles de tu tesina.</p>

                                    <div class="flex flex-column gap-3">
                                        <div class="flex flex-column">
                                            <div class="text-900 font-bold text-xl">Nombre de la Tesina</div>
                                            <div class="text-900 text-lg">{{ tesina.nombre_tesina }}</div>
                                        </div>
                                        <div class="flex flex-column">
                                            <div class="text-900 font-bold text-xl">Área de la Tesina</div>
                                            <div class="text-900 text-lg">{{ tesina.area_tesina }}</div>
                                        </div>
                                        <div class="flex flex-column">
                                            <div class="text-900 font-bold text-xl">Reseña de la Tesina</div>
                                            <div class="text-900">{{ tesina.resenia_tesina }}</div>
                                        </div>
                                        <div class="flex flex-column">
                                            <div class="text-900 font-bold text-xl">Fecha de Registro</div>
                                            <div class="text-900 text-lg">{{ formatFecha(tesina.fecha_registro) }}</div>
                                        </div>
                                        <div class="flex flex-column">
                                            <div class="text-900 font-bold text-lg">Status</div>
                                            <div class="text-900 text-lg">
                                                <Tag v-if="tesina.status == 'PENDIENTE'" class="mr-2" severity="warning" value="Pendiente"></Tag>
                                                <Tag v-if="tesina.status == 'ACEPTADO'" class="mr-2" severity="success" value="Aceptado"></Tag>
                                                <Tag v-if="tesina.status == 'REGISTRADO'" class="mr-2" severity="success" value="Registrado"></Tag>
                                                <Tag v-if="tesina.status == 'RECHAZADO'" class="mr-2" severity="danger" value="Rechazado"></Tag>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12" v-if="tesinas[0].status === 'REGISTRADO' || tesinas[0].status === 'ACEPTADO'">
                            <div class="grid">
                                <div class="col-12 md:col-6">
                                    <Card class="p-fluid">
                                        <template #title>Tesina</template>
                                        <template #content>
                                            <div v-if="existTesina.url_documento">
                                                <Button label="Ver" class="w-full" @click="openFilePreview(existTesina.url_documento)" />
                                            </div>
                                            <div v-else class="field">
                                                <label for="url_tesina">Url del Proyecto</label>
                                                <InputText id="url_tesina" v-model="tesinaform.url_documento" required placeholder="www.drive.google.com/tesina.pdf || www.dropbox.com/tesina.zip" />
                                            </div>
                                        </template>
                                        <template #footer v-if="!existTesina.url_documento">
                                            <div class="flex gap-3 mt-1">
                                                <Button label="Limpiar" severity="secondary" outlined class="w-full" @click="limpiarTesina" />
                                                <Button label="Guardar" class="w-full" @click="saveUrlTesina" />
                                            </div>
                                        </template>
                                    </Card>
                                </div>
                                <div class="col-12 md:col-6" :style="tesinas[0].status === 'ACEPTADO' ? '' : 'pointer-events: none; opacity: 0.7'">
                                    <Card class="p-fluid">
                                        <template #title>Proyecto</template>
                                        <template #content>
                                            <div v-if="existProyecto.url_documento">
                                                <Button label="Ver" class="w-full" @click="openFilePreview(existProyecto.url_documento)" />
                                            </div>
                                            <div v-else class="field">
                                                <label for="url_proyecto">Url del Proyecto</label>
                                                <InputText id="url_proyecto" v-model.trim="proyectoform.url_documento" required placeholder="www.github.com/usuario/proyecto.git || www.dropbox.com/proyecto.zip" />
                                            </div>
                                        </template>
                                        <template #footer v-if="!existProyecto.url_documento">
                                            <div class="flex gap-3 mt-1">
                                                <Button label="Limpiar" severity="secondary" outlined class="w-full" @click="limpiarProyecto" />
                                                <Button label="Guardar" class="w-full" @click="saveUrlProyecto" />
                                            </div>
                                        </template>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>
