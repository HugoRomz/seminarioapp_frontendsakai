<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, inject, onMounted } from 'vue';
import catalogoApi from '../../api/catalogoApi.js';
import Spinner from '../../components/Spinner.vue';

const isAccepting = ref(false);
const toast = inject('toast');

const carreras = ref(null);
const filters = ref();
const loading = ref(null);
const dt = ref();

const isEditMode = ref(false);

const carreraEdit = ref({});
const deleteCarreraModal = ref(false);
const carreraModal = ref(false);
const submitted = ref(false);

const loadCarreras = async () => {
    loading.value = true;
    try {
        const response = await catalogoApi.findCarreras();
        carreras.value = response.data;
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(loadCarreras);

const openNew = () => {
    carreraEdit.value = {};
    submitted.value = false;
    carreraModal.value = true;
    isEditMode.value = false;
};

const hideDialog = () => {
    carreraModal.value = false;
    submitted.value = false;
};

const saveCarrera = async () => {
    submitted.value = true;
    isAccepting.value = true;
    if (carreraEdit.value.nombre_carrera.trim()) {
        loading.value = true;
        try {
            let response;
            if (isEditMode.value) {
                response = await catalogoApi.updateCarrera(carreraEdit.value);
                toast.open({
                    message: response.data.msg,
                    type: 'success'
                });
            } else {
                response = await catalogoApi.createCarrera(carreraEdit.value);
                toast.open({
                    message: response.data.msg,
                    type: 'success'
                });
            }
            carreraModal.value = false;
            carreraEdit.value = {};
            isEditMode.value = false;
            await loadCarreras();
        } catch (error) {
            toast.open({
                message: error.response && error.response.data.msg ? error.response.data.msg : 'Error desconocido',
                type: 'error'
            });
        } finally {
            loading.value = false;
            isAccepting.value = false;
        }
    } else {
        isAccepting.value = false;
        toast.open({
            message: 'Por favor, completa todos los campos requeridos.',
            type: 'warn'
        });
    }
};

const confirmDeleteMateria = (editCarrera) => {
    carreraEdit.value = editCarrera;
    deleteCarreraModal.value = true;
};

const editCarrera = (editCarrera) => {
    const materiasData = { ...editCarrera };
    carreraEdit.value = materiasData;
    carreraModal.value = true;
    isEditMode.value = true;
};

const deleteCarrera = async () => {
    isAccepting.value = true;

    try {
        const response = await catalogoApi.deleteCarrera(carreraEdit.value.carrera_id);
        toast.open({
            message: response.data.msg,
            type: 'success'
        });
        deleteCarreraModal.value = false;
        carreraEdit.value = {};
        await loadCarreras(); // Recarga la lista de usuarios
    } catch (error) {
        toast.open({
            message: error.response && error.response.data.msg ? error.response.data.msg : 'Error desconocido al eliminar',
            type: 'error'
        });
    } finally {
        isAccepting.value = false;
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
</script>
<template>
    <Spinner v-if="isAccepting" />
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="Nueva Carrera" icon="pi pi-plus" class="mr-2" severity="success" @click="openNew" />
                        </div>
                    </template>

                    <template v-slot:end>
                        <Button label="Exportar" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
                    </template>
                </Toolbar>

                <DataTable
                    ref="dt"
                    :value="carreras"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Mostrando del {first} al {last} de {totalRecords} carreras"
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
                        <Button icon="pi pi-refresh" @click="loadCarreras" />
                    </template>
                    <Column field="carrera_id" header="ID Carrera" :sortable="true"></Column>
                    <Column field="nombre_carrera" header="Nombre de la Carrera" :sortable="true"></Column>
                    <Column headerStyle="min-width:10rem;" header="Acciones">
                        <template #body="{ data }">
                            <Button icon="pi pi-pencil" class="mr-2" severity="success" rounded @click="editCarrera(data)" />
                            <Button icon="pi pi-trash" class="mt-2" severity="warning" rounded @click="confirmDeleteMateria(data)" />
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="carreraModal" :header="isEditMode ? 'Datos de la Carrera - Editar' : 'Datos de la Carrera - Registrar'" :modal="true" class="p-fluid">
                    <div class="field" v-if="isEditMode">
                        <label for="carrera_id">ID Carrera</label>
                        <InputText id="carrera_id" :disabled="isEditMode" v-model.trim="carreraEdit.carrera_id" />
                    </div>
                    <div class="field">
                        <label for="nombre_carrera">Nombre de la Carrera</label>
                        <InputText id="nombre_carrera" v-model.trim="carreraEdit.nombre_carrera" required="true" :invalid="submitted && !carreraEdit.nombre_carrera" />
                        <small class="p-invalid" v-if="submitted && !carreraEdit.nombre_carrera">El numero de nombre carrera es requerida.</small>
                    </div>

                    <!-- </ScrollPanel> -->
                    <template #footer>
                        <Button label="Cancelar" icon="pi pi-times" text="" @click="hideDialog" />
                        <Button label="Guardar" icon="pi pi-check" text="" @click="saveCarrera" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteCarreraModal" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="carreraEdit"
                            >¿Estás seguro que quieres eliminar a ID Carrera: <b>{{ carreraEdit.carrera_id }}</b
                            >?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" text @click="deleteCarreraModal = false" />
                        <Button label="Yes" icon="pi pi-check" text @click="deleteCarrera" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>
