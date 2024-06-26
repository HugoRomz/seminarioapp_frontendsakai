<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, inject, onMounted, watch } from 'vue';
import DocumentosApi from '../../api/DocumentosApi';
import configuracionApi from '../../api/configuracionApi';
import Spinner from '../../components/Spinner.vue';

const toast = inject('toast');

const users = ref(null);
const filters = ref();
const loading = ref(null);
const selectedPeriodos = ref(null);
const periodos = ref([]);
const dt = ref();
const expandedRows = ref([]);
const agregarComentario = ref(false);
const verComentario = ref(false);
const dataComentarioModal = ref({});
const submitted = ref(false);

watch(selectedPeriodos, async (newValue) => {
    if (newValue && newValue.value.periodo_id) {
        await loadUsers(newValue.value.periodo_id);
    }
});

const loadUsers = async (periodoId) => {
    loading.value = true;
    try {
        const response = await DocumentosApi.allUserAlumnos(periodoId);
        users.value = response.data;
        if (users.value.length === 0) {
            toast.open({
                message: 'No hay alumnos registrados en este periodo',
                type: 'info'
            });
        }
    } catch (error) {
        toast.open({
            message: error.response.data.msg,
            type: 'error'
        });
    } finally {
        loading.value = false;
    }
};

const loadPeriodos = async () => {
    loading.value = true;
    try {
        const response = await DocumentosApi.loadPeriodos();
        periodos.value = response.data;
    } catch (error) {
        console.error('Error al obtener los periodos:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    await loadPeriodos();
});

const handlePeriodChange = async (newValue) => {
    selectedPeriodos.value = newValue;
};

const aceptarDocumentos = async (data, periodo_id) => {
    loading.value = true;
    try {
        await DocumentosApi.updateDocumentoStatus(data);

        toast.open({
            message: 'Documento revisado exitosamente',
            type: 'success'
        });

        loadUsers(periodo_id);
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

const agregarComentarios = async (dataComentario, periodo_id) => {
    loading.value = true;
    try {
        const response = await DocumentosApi.agregarComentario(dataComentario);
        toast.open({
            message: response.data.msg,
            type: 'success'
        });
        loadUsers(periodo_id);
    } catch (error) {
        console.error('Error al rechazar el documento:', error);
    } finally {
        loading.value = false;
        agregarComentario.value = false;
        dataComentarioModal.value = {}; // Limpia el modal después de agregar el comentario
    }
};

const aceptarDocUsuario = async (data, periodo_id) => {
    loading.value = true;
    try {
        const response = await DocumentosApi.aceptarDocUsuario(data);
        toast.open({
            message: response.data.msg,
            type: 'success'
        });
        loadUsers(periodo_id);
    } catch (error) {
        toast.open({
            message: error.response.data.msg,
            type: 'error'
        });
    } finally {
        loading.value = false;
    }
};

const verComentarioModal = (data) => {
    verComentario.value = true;
    dataComentarioModal.value = data;
};

const documentosPendientes = (user) => {
    if (!user.doc_alumnos_estados) return false;
    return user.doc_alumnos_estados.some((doc) => doc.status === 'PENDIENTE' && doc.url_file);
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

// const getFullUrl = (fileName) => {
//     const baseUrl = import.meta.env.VITE_FILES_URL;
//     return fileName ? `${baseUrl}/Alumnos/${fileName}` : null;
// };

const openFilePreview = (url) => {
    if (url) {
        window.open(url, '_blank', 'toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=1124,height=688');
    }
};

initFilters();

const clearFilter = () => {
    initFilters();
};

const downloadFile = async (url) => {
    try {
        const response = await configuracionApi.downloadFile(url);
        const blob = await fetch(response.data.url).then((res) => res.blob());

        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = blobUrl;
        link.setAttribute('download', '');
        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        toast.open({
            message: 'Descarga exitosa',
            type: 'success'
        });
    } catch (error) {
        toast.open({
            message: error.response && error.response.data.msg ? error.response.data.msg : 'Error desconocido',
            type: 'error'
        });
    }
};
</script>

<template>
    <Spinner v-if="loading" />
    <div class="grid">
        <div class="col-12">
            <card class="mb-4">
                <template #content>
                    <div class="flex align-items-center gap-2">
                        <h2 class="m-0 mr-5 font-medium text-lg">Seleccione el periodo para ver la documentación de los alumnos:</h2>
                        <Dropdown id="period" v-model="selectedPeriodos" :options="periodos" optionLabel="descripcion" placeholder="Selecciona el periodo" @change="handlePeriodChange" :invalid="submitted && !selectedPeriodos" :filter="true">
                            <template #option="{ option }">
                                {{ option.descripcion }}
                            </template>
                        </Dropdown>
                    </div>
                </template>
            </card>
            <div v-if="users && Object.keys(users).length !== 0">
                <div class="card">
                    <div v-if="selectedPeriodos">
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
                            <template #empty> No hay registros. </template>
                            <template #loading> Cargando... por favor espera </template>
                            <template #paginatorstart>
                                <Button icon="pi pi-refresh" @click="loadUsers(selectedPeriodos.value.periodo_id)" />
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
                                    <Button @click="aceptarDocUsuario(data, selectedPeriodos.value.periodo_id)" :disabled="data.status === 'ACTIVO' || !documentosRevisados(data)" class="p-button-success mr-2 mb-2">Aceptar</Button>
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
                                                <div class="flex flex-row gap-1">
                                                    <a @click="openFilePreview(slotProps.data.url_file)" v-if="slotProps.data.url_file">
                                                        <Button icon="pi pi-search" />
                                                    </a>
                                                    <Button icon="pi pi-search" :disabled="true" v-else />
                                                    <a @click="downloadFile(slotProps.data.url_filePublic)" v-if="slotProps.data.url_filePublic">
                                                        <Button icon="pi pi-download" />
                                                    </a>
                                                </div>
                                            </template>
                                        </Column>
                                        <Column header="Acciones" headerStyle="width:8rem">
                                            <template #body="slotProps">
                                                <div class="flex flex-row justify-content-center">
                                                    <!-- Botón de Aceptar -->
                                                    <Button
                                                        v-if="slotProps.data.status === 'PENDIENTE'"
                                                        label="Aceptar"
                                                        class="p-button-success mr-1"
                                                        @click="aceptarDocumentos(slotProps.data, selectedPeriodos.value.periodo_id)"
                                                        :disabled="!slotProps.data.url_file"
                                                    />
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
                    </div>
                    <div v-else>
                        <div class="card">Por favor, selecciona un periodo.</div>
                    </div>
                    <Dialog v-model:visible="agregarComentario" :style="{ width: '450px' }" header="Agregar comentarios" :modal="true" :closable="false">
                        <div class="flex flex-column align-items-center justify-content-center">
                            <i class="pi pi-exclamation-triangle" style="font-size: 2rem" />
                            <span class="mt-3" v-if="dataComentarioModal">Ingrese el motivo del rechazo del documento</span>
                            <InputText class="mt-3 w-8" v-model="dataComentarioModal.comentarios" placeholder="Comentarios" />
                        </div>
                        <template #footer>
                            <Button label="No" icon="pi pi-times" text @click="(agregarComentario = false), (dataComentarioModal.comentarios = '')" />
                            <Button label="Yes" icon="pi pi-check" text @click="agregarComentarios(dataComentarioModal, selectedPeriodos.value.periodo_id)" />
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
            <div v-else>
                <card>
                    <template #title>Documentación Alumnos</template>
                    <template #content> Selecciona un periodo para ver los alumnos. </template>
                </card>
            </div>
        </div>
    </div>
</template>
