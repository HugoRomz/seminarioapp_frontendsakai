<script setup>
import { ref, inject, onMounted } from 'vue';
import TesinaApi from '../../api/TesinaApi';
import SeminarioApi from '../../api/SeminarioApi.js';
import Spinner from '../../components/Spinner.vue';
import { FilterMatchMode } from 'primevue/api';
import { format } from 'date-fns';

const expandedRows = ref([]);
const isAccepting = ref(false);
const toast = inject('toast');
const expandedRowGroups = ref([]);
const tesinas = ref([]);
const users = ref([]);
const filters = ref();
const loading = ref(null);

const mostrarModalRechazo = ref(false);
const mostrarModalRechazo2 = ref(false);
const mostrarModalAsignacion = ref(false);
const tesinaSeleccionada = ref(null);
const docenteSeleccionado = ref(null);
const motivoRechazo = ref('');

const getAllTesinas = async () => {
    loading.value = true;
    try {
        const response = await TesinaApi.getAllTesinas();
        tesinas.value = response.data.sort((a, b) => a.nombre_tesina.localeCompare(b.nombre_tesina));
    } catch (error) {
        console.error('Error al obtener todas las tesinas:', error);
    } finally {
        loading.value = false;
    }
};

const loadUsers = async () => {
    loading.value = true;
    try {
        const response = await SeminarioApi.getDocentes();
        users.value = response.data;
    } catch (error) {
        console.error('Error al obtener los usuarios docentes:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    await getAllTesinas();
    await loadUsers();
});

const aceptarTesina = async () => {
    isAccepting.value = true;
    try {
        await TesinaApi.acceptTesinasByName(tesinaSeleccionada.value, docenteSeleccionado.value.id);
        toast.open({
            message: 'Has registrado la tesina y todas las relacionadas',
            type: 'success'
        });
        await getAllTesinas(); // Recargar datos después de aceptar
    } catch (error) {
        toast.open({
            message: 'Error al registrar las tesinas',
            type: 'error'
        });
    } finally {
        isAccepting.value = false;
        mostrarModalAsignacion.value = false;
        tesinaSeleccionada.value = null;
        docenteSeleccionado.value = null;
    }
};

const aceptarTesinaUrl = async (tesinaId) => {
    isAccepting.value = true;
    try {
        const tesina = tesinas.value.find(t => t.tesina_id === tesinaId);
        const relacionadas = tesinas.value.filter(t => t.nombre_tesina === tesina.nombre_tesina && t.tesina_id !== tesinaId);

        if (!tesina.url_documento || relacionadas.some(t => !t.url_documento)) {
            toast.open({
                message: 'No se puede aceptar. Todas las tesinas relacionadas deben tener un URL.',
                type: 'error'
            });
            return;
        }

        if (relacionadas.some(t => t.url_documento !== tesina.url_documento)) {
            toast.open({
                message: 'Las URL de las tesinas no coinciden. Favor de revisar cada una.',
                type: 'error'
            });
            return;
        }

        await TesinaApi.acceptTesinaUrl(tesinaId);
        toast.open({
            message: 'Has aceptado la tesina y todas las relacionadas',
            type: 'success'
        });
        getAllTesinas(); // Reload data after accepting
    } catch (error) {
        toast.open({
            message: 'Error al aceptar las tesinas',
            type: 'error'
        });
    } finally {
        isAccepting.value = false;
    }
};

const abrirModalRechazo = (tesinaId) => {
    tesinaSeleccionada.value = tesinaId;
    mostrarModalRechazo.value = true;
};

const abrirModalRechazo2 = (tesinaId) => {
    tesinaSeleccionada.value = tesinaId;
    mostrarModalRechazo2.value = true;
};

const cancelarRechazo2 = () => {
    mostrarModalRechazo2.value = false;
    motivoRechazo.value = '';
    tesinaSeleccionada.value = null;
};

const abrirModalAsignacion = (tesinaId) => {
    tesinaSeleccionada.value = tesinaId;
    mostrarModalAsignacion.value = true;
    docenteSeleccionado.value = null;
};

const cancelarRechazo = () => {
    mostrarModalRechazo.value = false;
    motivoRechazo.value = '';
    tesinaSeleccionada.value = null;
};

const rechazarRegistroTesina = async () => {
    isAccepting.value = true;
    try {
        await TesinaApi.rejectTesinasByName(tesinaSeleccionada.value, motivoRechazo.value);
        toast.open({
            message: 'Has rechazado la tesina y todas las relacionadas',
            type: 'success'
        });
        await getAllTesinas(); // Reload data after rejecting
    } catch (error) {
        toast.open({
            message: 'Error al rechazar las tesinas',
            type: 'error'
        });
    } finally {
        isAccepting.value = false;
        cancelarRechazo();
    }
};

const rechazarDocumentoTesina = async () => {
    isAccepting.value = true;
    try {
        const response = await TesinaApi.rejectTesinaDocumento(tesinaSeleccionada.value, motivoRechazo.value);
        toast.open({
            message: 'Has rechazado el documento de la tesina y todos las relacionadas',
            type: 'success'
        });
        getAllTesinas();
    } catch (error) {
        toast.open({
            message: 'Error al rechazar el documento de las tesinas',
            type: 'error'
        });
    } finally {
        isAccepting.value = false;
        cancelarRechazo2();
    }
};

const onRowToggle = async (event) => {
    expandedRows.value = event.data ? [event.data] : [];
    if (event.data) {
        await getUserDetails(event.data.usuario_id_alumno);
    }
};

const openFilePreview = (url) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'http://' + url;
    }
    window.open(url, '_blank');
};

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};

initFilters();
const clearFilter = () => {
    initFilters();
};
</script>

<template>
    <Spinner v-if="loading" />
    <div class="col">
        <card class="mb-4">
            <template #content>
                <h2 class="m-0 mr-5 font-medium text-lg">Tesinas Registradas</h2>
            </template>
        </card>
        <div class="card bg-white shadow-xl rounded-lg p-5 border border-gray-200">
            <DataTable
                v-model:expandedRowGroups="expandedRowGroups"
                v-model:filters="filters"
                :value="tesinas"
                tableStyle="min-width: 50rem"
                paginator
                :rows="5"
                :rowsPerPageOptions="[5, 10, 20, 50]"
                :expandedRows="expandedRows"
                @rowToggle="onRowToggle"
            >
                <template #header>
                    <div class="flex justify-content-between flex-column sm:flex-row">
                        <Button type="button" icon="pi pi-filter-slash" label="Limpiar" outlined @click="clearFilter()" />
                        <IconField iconPosition="left">
                            <InputIcon class="pi pi-search" />
                            <InputText v-model="filters['global'].value" placeholder="Búsqueda por palabra clave" style="width: 100%" />
                        </IconField>
                    </div>
                </template>
                <Column :expander="true" headerStyle="width: 3rem" />
                <Column field="nombre_tesina" header="Nombre de la Tesina" :sortable="true">
                    <template #body="slotProps">
                        {{ slotProps.data.nombre_tesina }}
                    </template>
                </Column>
                <Column field="area_tesina" header="Área"></Column>
                <Column field="resenia_tesina" header="Reseña"></Column>
                <Column field="fecha_registro" header="Fecha de Registro">
                    <template #body="{ data }">
                        {{ format(new Date(data.fecha_registro), 'yyyy-MM-dd') }}
                    </template>
                </Column>
                <Column field="status" header="Estado">
                    <template #body="{ data }">
                        <Tag :value="data.status" :severity="data.status === 'ACEPTADO' ? 'success' : data.status === 'REGISTRADO' ? 'success' : data.status === 'RECHAZADO' ? 'danger' : 'warning'" />
                    </template>
                </Column>
                <Column header="Acciones" bodyStyle="text-align:center" style="width: 20rem">
                    <template #body="{ data }">
                        <Button @click="abrirModalAsignacion(data.tesina_id)" class="p-button-success mr-2 mb-2" label="Registrar" :disabled="data.status !== 'PENDIENTE'" />
                        <Button @click="abrirModalRechazo(data.tesina_id)" class="p-button-danger mr-2 mb-2" label="Rechazar" :disabled="data.status !== 'PENDIENTE'" />
                    </template>
                </Column>
                <template #expansion="slotProps">
                    <div class="card">
                        <h5>
                            Detalle del Usuario - <strong>{{ slotProps.data.Alumno.nombre }} {{ slotProps.data.Alumno.apellidop }} {{ slotProps.data.Alumno.apellidom }} - {{ slotProps.data.Alumno.curp }}</strong>
                        </h5>
                        <DataTable :value="[slotProps.data]">
                            <Column field="nombre_tesina" header="Nombre de la tesina" :sortable="true">
                                <template #body="slotProps">
                                    {{ slotProps.data.nombre_tesina }}
                                </template>
                            </Column>
                            <Column header="Visualizar" headerStyle="width:4rem">
                                <template #body="slotProps">
                                    <div class="flex flex-row gap-1">
                                        <a @click="openFilePreview(slotProps.data.url_documento)" v-if="slotProps.data.url_documento">
                                            <Button icon="pi pi-search" />
                                        </a>
                                        <Button icon="pi pi-search" :disabled="true" v-else />
                                        <a @click="downloadFile(slotProps.data.url_filePublic)" v-if="slotProps.data.url_filePublic">
                                            <Button icon="pi pi-download" />
                                        </a>
                                    </div>
                                </template>
                            </Column>
                            <Column header="Acciones" bodyStyle="text-align:center" style="width: 16rem">
                                <template #body="{ data }">
                                    <Button @click="aceptarTesinaUrl(data.tesina_id)" class="p-button-success mr-2 mb-2" label="Aceptar" :disabled="data.status !== 'REGISTRADO' || !data.url_documento" />
                                    <Button @click="abrirModalRechazo2(data.tesina_id)" class="p-button-danger mr-2 mb-2" label="Rechazar" :disabled="data.status !== 'REGISTRADO'" />
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                </template>
                <template #footer> En total hay {{ tesinas ? tesinas.length : 0 }} tesinas registradas. </template>
            </DataTable>
        </div>
    </div>

    <Dialog v-model:visible="mostrarModalRechazo" :style="{ width: '450px' }" header="Motivo del Rechazo" :modal="true" :closable="false">
        <div class="flex flex-column align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle" style="font-size: 2rem" />
            <span class="mt-3">Ingrese el motivo del rechazo del registro de la tesina</span>
            <InputText class="mt-3 w-8" v-model="motivoRechazo" placeholder="Comentarios" />
        </div>
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" text @click="cancelarRechazo" />
            <Button label="Aceptar" icon="pi pi-check" text @click="rechazarRegistroTesina" />
        </template>
    </Dialog>

    <Dialog v-model:visible="mostrarModalRechazo2" :style="{ width: '450px' }" header="Motivo del Rechazo" :modal="true" :closable="false">
        <div class="flex flex-column align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle" style="font-size: 2rem" />
            <span class="mt-3">Ingrese el motivo del rechazo de la url de la tesina</span>
            <InputText class="mt-3 w-8" v-model="motivoRechazo" placeholder="Comentarios" />
        </div>
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" text @click="cancelarRechazo2" />
            <Button label="Aceptar" icon="pi pi-check" text @click="rechazarDocumentoTesina" />
        </template>
    </Dialog>

    <Dialog v-model:visible="mostrarModalAsignacion" header="Asignar Docente a Tesina" :style="{ width: '30vw' }" modal>
        <template #footer>
            <Button @click="mostrarModalAsignacion = false" label="Cancelar" class="mr-2" icon="pi pi-times" />
            <Button @click="aceptarTesina" label="Aceptar" class="mr-2" icon="pi pi-check" :loading="isAccepting" />
        </template>
        <div class="field">
            <label for="docente">Seleccione un docente</label>
            <Dropdown id="docente" v-model="docenteSeleccionado" :options="users" optionLabel="nombre" placeholder="Seleccione un docente" class="w-full" />
        </div>
    </Dialog>
</template>

<style scoped>
.p-button-rounded {
    margin-right: 0.5em;
}
</style>
