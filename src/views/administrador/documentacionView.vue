<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, inject, onMounted } from 'vue';
import DocumentosApi from '../../api/DocumentosApi';
import Spinner from '../../components/Spinner.vue';

const isAccepting = ref(false);
const toast = inject('toast');

const users = ref(null);
const filters = ref();
const loading = ref(null);
const loadingSpinner = ref(null);
const dt = ref();
const expandedRows = ref([]);
const agregarComentario = ref(false);
const verComentario = ref(false);
const dataComentarioModal = ref({});

const alumno = ref({
    esEgresado: false
});

const loadUsers = async () => {
    loading.value = true;
    try {
        const response = await DocumentosApi.allUserAlumnos();
        users.value = response.data;
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    loadUsers();
});

const aceptarDocumentos = async (data) => {
    loading.value = true;
    try {
        const response = await DocumentosApi.updateDocumentoStatus(data);

        toast.open({
            message: 'Documento revisado exitosamente',
            type: 'success'
        });

        loadUsers();
    } catch (error) {
        console.error('Error al actualizar el documento:', error);
    } finally {
        loading.value = false;
    }
};

const agregarComentarioModal = (dataComentario) => {
    dataComentarioModal.value = { ...dataComentario, comentarios: '' }; // Limpia comentarios
    agregarComentario.value = true;
};

const agregarComentarios = async (dataComentario) => {
    loadingSpinner.value = true;
    try {
        const response = await DocumentosApi.agregarComentario(dataComentario);
        toast.open({
            message: response.data.msg,
            type: 'success'
        });
        loadUsers();
    } catch (error) {
        console.error('Error al rechazar el documento:', error);
    } finally {
        loadingSpinner.value = false;
        agregarComentario.value = false;
        dataComentarioModal.value = {}; // Limpia el modal después de agregar el comentario
    }
};

const aceptarDocUsuario = async (data) => {
    isAccepting.value = true;
    try {
        const response = await DocumentosApi.aceptarDocUsuario(data);
        toast.open({
            message: response.data.msg,
            type: 'success'
        });
        loadUsers(); 
    } catch (error) {
        toast.open({
            message: error.response.data.msg,
            type: 'error'
        });
    } finally {
        isAccepting.value = false; 
    }
};

const verComentarioModal = (data) => {
    verComentario.value = true;
    dataComentarioModal.value = data;
};

const documentosPendientes = (user) => {
    if (!user.doc_alumnos_estados) return false;
    return user.doc_alumnos_estados.some((doc) => doc.status === 'PENDIENTE');
};

const documentosRevisados = (user) => {
    if (!user.doc_alumnos_estados) return false;
    return user.doc_alumnos_estados.every((doc) => doc.status === 'REVISADO');
};

const onRowToggle = (event) => {
    expandedRows.value = event.data ? [event.data] : [];
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
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <DataTable
                    ref="dt"
                    :value="users"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Mostrando del {first} al {last} de {totalRecords} alumnos"
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
                    <Column field="nombre" header="Nombre" :sortable="true"></Column>
                    <Column field="apellido_p" header="Apellido Paterno" :sortable="true"></Column>
                    <Column field="apellido_m" header="Apellido Materno" :sortable="true"></Column>
                    <Column field="telefono_usuario" header="Telefono" :sortable="true"></Column>
                    <Column field="email_usuario" header="Email" :sortable="true"></Column>
                    <Column field="status" header="Status" dataType="string" style="min-width: 8rem" :sortable="true">
                        <template #body="{ data }">
                            <Tag v-if="data.status === 'PENDIENTE'" severity="warning" value="Pendiente" />
                            <Tag v-if="data.status === 'ACTIVO'" severity="success" value="Revisado" />
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <TriStateCheckbox v-model="filterModel.value" @change="filterCallback()" />
                        </template>
                    </Column>
                    <Column headerStyle="width: 3rem">
                        <template #body="{ data }">
                            <i class="pi pi-exclamation-circle" v-if="documentosPendientes(data)" style="color: red"></i>
                        </template>
                    </Column>
                    <Column header="Acciones" bodyStyle="text-align:center" style="min-width: 10rem">
                        <template #body="{ data }">
                            <Button @click="aceptarDocUsuario(data)" :disabled="data.status === 'ACTIVO' || !documentosRevisados(data)" class="p-button-success mr-2 mb-2">Aceptar</Button>
                        </template>
                    </Column>
                    <template #expansion="slotProps">
                        <div class="card">
                            <h5>
                                Detalle del Usuario - <strong>{{ slotProps.data.nombre }} {{ slotProps.data.apellido_p }} {{ slotProps.data.apellido_m }}</strong> - <strong>{{ slotProps.data.curp }}</strong>
                            </h5>
                            <DataTable :value="slotProps.data.doc_alumnos_estados">
                                <Column field="nombre_documento" header="Nombre del documento" :sortable="true">
                                    <template #body="slotProps">
                                        {{ slotProps.data.det_doc_alumno.documento.nombre_documento }}
                                    </template>
                                </Column>
                                <Column field="status" header="Estado del documento" :sortable="true">
                                    <template #body="slotProps">
                                        <Tag v-if="slotProps.data.status === 'PENDIENTE'" severity="warning" value="Pendiente" />
                                        <Tag v-else-if="slotProps.data.status === 'REVISADO'" severity="succes" value="Revisado" />
                                        <Tag v-else-if="slotProps.data.status === 'RECHAZADO'" severity="danger" value="Rechazado" />
                                    </template>
                                </Column>
                                <Column header="Visualizar" headerStyle="width:4rem">
                                    <template #body="slotProps">
                                        <router-link :to="slotProps.data.url_file || null" target="_blank" rel="noopener" v-if="slotProps.data.url_file" @click.native="slotProps.data.url_file">
                                            <Button icon="pi pi-search" />
                                        </router-link>
                                        <Button icon="pi pi-search" :disabled="true" v-else />
                                    </template>
                                </Column>
                                <Column header="Acciones" headerStyle="width:8rem">
                                    <template #body="slotProps">
                                        <div class="flex flex-row justify-content-center">
                                            <!-- Botón de Aceptar -->
                                            <Button v-if="slotProps.data.status === 'PENDIENTE'" label="Aceptar" class="p-button-success mr-1" @click="aceptarDocumentos(slotProps.data)" />
                                            <!-- <Button v-if="slotProps.data.status === 'PENDIENTE'" label="Aceptar" class="p-button-success mr-1" @click="aceptarDocumentos(slotProps.data)" :disabled="!slotProps.data.url_file" /> -->
                                            <!-- Botón de Rechazar -->
                                            <Button v-if="slotProps.data.status === 'PENDIENTE'" label="Rechazar" class="p-button-danger mr-1" @click="agregarComentarioModal(slotProps.data)" />
                                            <!-- Botón de Ver Comentario -->
                                            <Button v-if="['REVISADO', 'RECHAZADO'].includes(slotProps.data.status)" label="Comentarios" class="p-button-info" @click="verComentarioModal(slotProps.data)" />
                                        </div>
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </template>
                </DataTable>
                <Dialog v-model:visible="agregarComentario" :style="{ width: '450px' }" header="Agregar comentarios" :modal="true" :closable="false">
                    <div class="flex flex-column align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle" style="font-size: 2rem" />
                        <span class="mt-3" v-if="dataComentarioModal">Ingrese el motivo del rechazo del documento</span>
                        <InputText class="mt-3 w-8" v-model="dataComentarioModal.comentarios" placeholder="Comentarios" />
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" text @click="(agregarComentario = false), (dataComentarioModal.comentarios = '')" />
                        <Button label="Yes" icon="pi pi-check" text @click="agregarComentarios(dataComentarioModal)" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="verComentario" :style="{ width: '450px' }" :modal="true">
                    <h5>
                        Documento: <strong>{{ dataComentarioModal.det_doc_alumno.documento.nombre_documento }}</strong>
                    </h5>
                    <div class="flex flex-column align-items-center justify-content-center">
                        <i class="pi pi-info-circle mt-1" style="font-size: 2rem" />
                        <span class="mt-3 text-lg" v-if="dataComentarioModal">
                            <strong>{{ dataComentarioModal.comentarios }}</strong></span
                        >
                    </div>
                </Dialog>
            </div>
        </div>
    </div>
</template>
