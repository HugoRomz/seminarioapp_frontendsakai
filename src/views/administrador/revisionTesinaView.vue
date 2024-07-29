<script setup>
import { ref, inject, onMounted } from 'vue';
import TesinaApi from '../../api/TesinaApi';
import Spinner from '../../components/Spinner.vue';
import { FilterMatchMode } from 'primevue/api';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';

const expandedRows = ref([]);
const isAccepting = ref(false);
const toast = inject('toast');
const expandedRowGroups = ref([]);
const tesinas = ref([]);
const filters = ref();
const loading = ref(null);

const mostrarModalRechazo = ref(false);
const mostrarModalRechazo2 = ref(false);
const tesinaSeleccionada = ref(null);
const motivoRechazo = ref('');

const usuarioDetalles = ref({ nombre: '', curp: '' });

const getAllTesinas = async () => {
    loading.value = true;
    try {
        const response = await TesinaApi.getAllTesinas();
        tesinas.value = response.data;
        console.log(tesinas.value)
    } catch (error) {
        console.error('Error al obtener todas las tesinas:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    await getAllTesinas();
});

const aceptarTesina = async (tesinaId) => {
    isAccepting.value = true;
    try {
        const response = await TesinaApi.acceptTesina(tesinaId);
        toast.open({
            message: 'Has aceptado la tesina',
            type: 'success'
        });
        getAllTesinas(); // Reload data after accepting
    } catch (error) {
        toast.open({
            message: 'Error al aceptar la tesina',
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

const cancelarRechazo = () => {
    mostrarModalRechazo.value = false;
    motivoRechazo.value = '';
    tesinaSeleccionada.value = null;
};

const rechazarRegistroTesina = async () => {
    isAccepting.value = true;
    try {
        const response = await TesinaApi.rejectTesinaRegistro(tesinaSeleccionada.value, motivoRechazo.value);
        toast.open({
            message: 'Has rechazado el registro de la tesina',
            type: 'success'
        });
        getAllTesinas();
    } catch (error) {
        toast.open({
            message: 'Error al rechazar el registro de la tesina',
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
            message: 'Has rechazado el documento de la tesina',
            type: 'success'
        });
        getAllTesinas();
    } catch (error) {
        toast.open({
            message: 'Error al rechazar el documento de la tesina',
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
    <Spinner v-if="isAccepting" />
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
                <Column field="fecha_registro" header="Fecha de Registro"></Column>
                <Column field="status" header="Estado">
                    <template #body="{ data }">
                        <Tag :value="data.status" :severity="data.status === 'ACEPTADO' ? 'success' : data.status === 'RECHAZADO' ? 'danger' : 'warning'" />
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
                        <Button @click="aceptarTesina(data.tesina_id)" class="p-button-success mr-2 mb-2" label="Aceptar" :disabled="data.status === 'ACEPTADO'" />
                        <Button @click="abrirModalRechazo(data.tesina_id)" class="p-button-danger mr-2 mb-2" label="Rechazar" :disabled="data.status === 'ACEPTADO'" />
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
                                    <Button @click="abrirModalRechazo2(data.tesina_id)" class="p-button-danger mr-2 mb-2" label="Rechazar" />
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
            <span class="mt-3">Ingrese el motivo del rechazo de la tesina 1</span>
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
            <span class="mt-3">Ingrese el motivo del rechazo de la tesina 2</span>
            <InputText class="mt-3 w-8" v-model="motivoRechazo" placeholder="Comentarios" />
        </div>
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" text @click="cancelarRechazo2" />
            <Button label="Aceptar" icon="pi pi-check" text @click="rechazarDocumentoTesina" />
        </template>
    </Dialog>
</template>

<style scoped>
.p-button-rounded {
    margin-right: 0.5em;
}
</style>
