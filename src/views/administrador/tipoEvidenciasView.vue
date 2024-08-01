<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, inject, onMounted } from 'vue';
import catalogoApi from '../../api/catalogoApi.js';
import Spinner from '../../components/Spinner.vue';

const toast = inject('toast');

const tipoEvidencias = ref(null);
const filters = ref();
const loading = ref(null);
const dt = ref();

const isEditMode = ref(false);

const tipoEvidenciaEdit = ref({});
const deleteTipoEvidenciaModal = ref(false);
const tipoEvidenciaModal = ref(false);
const submitted = ref(false);

const loadTipoEvidencias = async () => {
    loading.value = true;
    try {
        const response = await catalogoApi.findTipoEvidencias();
        tipoEvidencias.value = response.data;
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(loadTipoEvidencias);

const openNew = () => {
    tipoEvidenciaEdit.value = {};
    submitted.value = false;
    tipoEvidenciaModal.value = true;
    isEditMode.value = false;
};

const hideDialog = () => {
    tipoEvidenciaModal.value = false;
    submitted.value = false;
};

const saveTipoEvidencia = async () => {
    submitted.value = true;
    if (tipoEvidenciaEdit.value.nombre_tipo_ev.trim()) {
        loading.value = true;
        try {
            let response;
            if (isEditMode.value) {
                response = await catalogoApi.updateTipoEvidencia(tipoEvidenciaEdit.value);
                toast.open({
                    message: response.data.msg,
                    type: 'success'
                });
            } else {
                response = await catalogoApi.createTipoEvidencia(tipoEvidenciaEdit.value);
                toast.open({
                    message: response.data.msg,
                    type: 'success'
                });
            }
            tipoEvidenciaModal.value = false;
            tipoEvidenciaEdit.value = {};
            isEditMode.value = false;
            await loadTipoEvidencias();
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

const confirmDeleteTipoEvidencia = (editTipoEvidencia) => {
    tipoEvidenciaEdit.value = editTipoEvidencia;
    deleteTipoEvidenciaModal.value = true;
};

const editTipoEvidencia = (editTipoEvidencia) => {
    const tipoEvidenciasData = { ...editTipoEvidencia };
    tipoEvidenciaEdit.value = tipoEvidenciasData;
    tipoEvidenciaModal.value = true;
    isEditMode.value = true;
};

const deleteTipoEvidencia = async () => {
    loading.value = true;

    try {
        const response = await catalogoApi.deleteTipoEvidencia(tipoEvidenciaEdit.value.tipo_evidencia_id);
        toast.open({
            message: response.data.msg,
            type: 'success'
        });
        deleteTipoEvidenciaModal.value = false;
        tipoEvidenciaEdit.value = {};
        await loadTipoEvidencias(); // Recarga la lista de usuarios
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

const items = ref([{ label: 'Catalogo' }, { label: 'Tipo de Evidencias', route: '/admin/tipoEvidencias' }]);
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
                                <Button label="Nuevo Tipo de Evidencia" icon="pi pi-plus" class="mr-2" severity="success" @click="openNew" />
                            </div>
                        </template>

                        <template v-slot:end>
                            <Button label="Exportar" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
                        </template>
                    </Toolbar>

                    <div class="card">
                        <DataTable
                            ref="dt"
                            :value="tipoEvidencias"
                            dataKey="id"
                            :paginator="true"
                            :rows="10"
                            :filters="filters"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            :rowsPerPageOptions="[5, 10, 25]"
                            currentPageReportTemplate="Mostrando del {first} al {last} de {totalRecords} tipoEvidencias"
                            sortField="tipo_evidencia_id"
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
                                <Button icon="pi pi-refresh" @click="loadTipoEvidencias" />
                            </template>
                            <Column field="tipo_evidencia_id" header="ID Tipo de Evidencia" :sortable="true"></Column>
                            <Column field="nombre_tipo_ev" header="Nombre del Tipo de Evidencia" :sortable="true"></Column>
                            <Column field="descripcion" header="Descripción"></Column>
                            <Column headerStyle="min-width:10rem;" header="Acciones">
                                <template #body="{ data }">
                                    <Button icon="pi pi-pencil" class="mr-2" severity="success" rounded @click="editTipoEvidencia(data)" />
                                    <Button icon="pi pi-trash" class="mt-2" severity="warning" rounded @click="confirmDeleteTipoEvidencia(data)" />
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                </template>
            </Card>
        </div>
    </div>
    <Dialog v-model:visible="tipoEvidenciaModal" :header="isEditMode ? 'Datos del Tipo de Evidencia - Editar' : 'Datos del Tipo de Evidencia - Registrar'" :modal="true" class="p-fluid">
        <div class="field" v-if="isEditMode">
            <label for="tipo_evidencia_id">ID Tipo de Evidencia</label>
            <InputText id="tipo_evidencia_id" :disabled="isEditMode" v-model.trim="tipoEvidenciaEdit.tipo_evidencia_id" />
        </div>
        <div class="field">
            <label for="nombre_tipo_ev">Nombre del Tipo de Evidencia</label>
            <InputText id="nombre_tipo_ev" v-model.trim="tipoEvidenciaEdit.nombre_tipo_ev" required="true" :invalid="submitted && !tipoEvidenciaEdit.nombre_tipo_ev" />
            <small class="p-invalid" v-if="submitted && !tipoEvidenciaEdit.nombre_tipo_ev">El nombre del tipo de evidencia es requerido. </small>
        </div>
        <div class="field">
            <label for="descripcion">Descripción</label>
            <Textarea id="descripcion" v-model.trim="tipoEvidenciaEdit.descripcion" />
        </div>

        <!-- </ScrollPanel> -->
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" text="" @click="hideDialog" />
            <Button label="Guardar" icon="pi pi-check" text="" @click="saveTipoEvidencia" />
        </template>
    </Dialog>

    <Dialog v-model:visible="deleteTipoEvidenciaModal" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="tipoEvidenciaEdit"
                >¿Estás seguro que quieres eliminar a ID Tipo de Evidencia: <b>{{ tipoEvidenciaEdit.tipo_evidencia_id }}</b
                >?</span
            >
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" text @click="deleteTipoEvidenciaModal = false" />
            <Button label="Yes" icon="pi pi-check" text @click="deleteTipoEvidencia" />
        </template>
    </Dialog>
</template>
