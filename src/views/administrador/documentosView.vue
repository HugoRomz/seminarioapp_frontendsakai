<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, inject, onMounted } from 'vue';
import catalogoApi from '../../api/catalogoApi.js';
import Spinner from '../../components/Spinner.vue';

const toast = inject('toast');

const documentos = ref(null);
const filters = ref();
const loading = ref(null);
const dt = ref();

const isEditMode = ref(false);

const documentoEdit = ref({});
const deleteDocumentoModal = ref(false);
const documentoModal = ref(false);
const submitted = ref(false);

const destinatarios = ref([
    { name: 'Alumno', code: 'alumno' },
    { name: 'Docente', code: 'docente' }
]);

const loadDocumentos = async () => {
    loading.value = true;
    try {
        const response = await catalogoApi.findDocumentos();
        documentos.value = response.data;
    } catch (error) {
        toast.open({
            message: error.response && error.response.data.msg ? error.response.data.msg : 'Error desconocido',
            type: 'error'
        });
    } finally {
        loading.value = false;
    }
};

onMounted(loadDocumentos);

const openNew = () => {
    documentoEdit.value = {};
    submitted.value = false;
    documentoModal.value = true;
    isEditMode.value = false;
};

const hideDialog = () => {
    documentoModal.value = false;
    submitted.value = false;
};

const saveDocumento = async () => {
    submitted.value = true;
    if (documentoEdit.value.nombre_documento.trim()) {
        loading.value = true;
        try {
            let response;
            if (isEditMode.value) {
                response = await catalogoApi.updateDocumento(documentoEdit.value);
                toast.open({
                    message: response.data.msg,
                    type: 'success'
                });
            } else {
                response = await catalogoApi.createDocumento(documentoEdit.value);
                toast.open({
                    message: response.data.msg,
                    type: 'success'
                });
            }
            documentoModal.value = false;
            documentoEdit.value = {};
            isEditMode.value = false;
            await loadDocumentos();
        } catch (error) {
            toast.open({
                message: error.response && error.response.data.msg ? error.response.data.msg : 'Error desconocido',
                type: 'error'
            });
        } finally {
            loading.value = false;
        }
    } else {
        loading.value = false;
        toast.open({
            message: 'Por favor, completa todos los campos requeridos.',
            type: 'warn'
        });
    }
};

const confirmDeleteDocumento = (editDocumento) => {
    documentoEdit.value = editDocumento;
    deleteDocumentoModal.value = true;
};

const editDocumento = (editDocumento) => {
    documentoEdit.value = {
        ...editDocumento,
        destinatario: destinatarios.value.filter((d) => d.code === editDocumento.destinatario)
    };
    documentoModal.value = true;
    isEditMode.value = true;
};

const deleteDocumento = async () => {
    loading.value = true;

    try {
        const response = await catalogoApi.deleteDocumento(documentoEdit.value.documento_id);
        toast.open({
            message: response.data.msg,
            type: 'success'
        });
        deleteDocumentoModal.value = false;
        documentoEdit.value = {};
        await loadDocumentos(); // Recarga la lista de usuarios
    } catch (error) {
        toast.open({
            message: error.response && error.response.data.msg ? error.response.data.msg : 'Error desconocido al eliminar',
            type: 'error'
        });
    } finally {
        loading.value = false;
    }
};

const exportCSV = () => {
    dt.value.exportCSV();
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

const home = ref({
    icon: 'pi pi-home',
    route: '/'
});

const items = ref([{ label: 'Catalogo' }, { label: 'Documentos', route: '/admin/documentos' }]);
</script>
<template>
    <Spinner v-if="loading" />
    <div class="grid">
        <div class="col-12">
            <Card>
                <template #title>
                    <Breadcrumb :home="home" :model="items">
                        <template #item="{ item }">
                            <router-link v-if="item.route" :to="item.route">
                                <span :class="[item.icon, 'text-color']" />
                                <span class="text-primary font-semibold">{{ item.label }}</span>
                            </router-link>
                            <span v-else class="text-color">{{ item.label }}</span>
                        </template>
                    </Breadcrumb>
                </template>
                <template #content>
                    <Toolbar class="mb-4">
                        <template v-slot:start>
                            <div class="my-2">
                                <Button label="Nuevo Documento" icon="pi pi-plus" class="mr-2" severity="success" @click="openNew" />
                            </div>
                        </template>

                        <template v-slot:end>
                            <Button label="Exportar" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
                        </template>
                    </Toolbar>

                    <div class="card">
                        <DataTable
                            ref="dt"
                            :value="documentos"
                            dataKey="id"
                            :paginator="true"
                            :rows="10"
                            :filters="filters"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            :rowsPerPageOptions="[5, 10, 25]"
                            currentPageReportTemplate="Mostrando del {first} al {last} de {totalRecords} documentos"
                            sortField="documento_id"
                            :sortOrder="1"
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
                                <Button icon="pi pi-refresh" @click="loadDocumentos" />
                            </template>
                            <Column field="documento_id" header="ID Documento" :sortable="true"></Column>
                            <Column field="nombre_documento" header="Nombre de la Documento" :sortable="true"></Column>

                            <Column field="destinatario" header="Destinatario" :sortable="true">
                                <template #body="{ data }">
                                    <Tag class="mr-2" severity="contrast" :value="data.destinatario"></Tag>
                                </template>
                            </Column>
                            <Column headerStyle="min-width:10rem;" header="Acciones">
                                <template #body="{ data }">
                                    <Button icon="pi pi-pencil" class="mr-2" severity="success" rounded @click="editDocumento(data)" />
                                    <Button icon="pi pi-trash" class="mt-2" severity="warning" rounded @click="confirmDeleteDocumento(data)" />
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                </template>
            </Card>
        </div>
    </div>
    <Dialog v-model:visible="documentoModal" :header="isEditMode ? 'Datos del Documento - Editar' : 'Datos del Documento - Registrar'" :modal="true" class="p-fluid">
        <div class="field" v-if="isEditMode">
            <label for="documento_id">ID Documento</label>
            <InputText id="documento_id" :disabled="isEditMode" v-model.trim="documentoEdit.documento_id" />
        </div>
        <div class="field">
            <label for="nombre_documento">Nombre del Documento</label>
            <InputText id="nombre_documento" v-model.trim="documentoEdit.nombre_documento" required="true" :invalid="submitted && !documentoEdit.nombre_documento" />
            <small class="p-invalid" v-if="submitted && !documentoEdit.nombre_documento">El nombre del documento es requerido</small>
        </div>
        <div class="field">
            <label for="destinatario">destinatario</label>
            <MultiSelect v-model.trim="documentoEdit.destinatario" display="chip" :options="destinatarios" optionLabel="name" placeholder="Selecciona el destinatario" :selectionLimit="1" />
        </div>

        <!-- </ScrollPanel> -->
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" text="" @click="hideDialog" />
            <Button label="Guardar" icon="pi pi-check" text="" @click="saveDocumento" />
        </template>
    </Dialog>

    <Dialog v-model:visible="deleteDocumentoModal" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="documentoEdit"
                >¿Estás seguro que quieres eliminar a ID Documento: <b>{{ documentoEdit.documento_id }}</b
                >?</span
            >
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" text @click="deleteDocumentoModal = false" />
            <Button label="Yes" icon="pi pi-check" text @click="deleteDocumento" />
        </template>
    </Dialog>
</template>
