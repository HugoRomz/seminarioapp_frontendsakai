<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, inject, onMounted } from 'vue';
import catalogoApi from '../../api/catalogoApi.js';
import Spinner from '../../components/Spinner.vue';

const isAccepting = ref(false);
const toast = inject('toast');

const materias = ref(null);
const filters = ref();
const loading = ref(null);
const dt = ref();

const isEditMode = ref(false);

const materiaEdit = ref({});
const deleteMateriaModal = ref(false);
const materiaModal = ref(false);
const submitted = ref(false);

const loadMaterias = async () => {
    loading.value = true;
    isAccepting.value = true;
    try {
        const response = await catalogoApi.findMaterias();
        materias.value = response.data;
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
    } finally {
        loading.value = false;
        isAccepting.value = false;
    }
};

onMounted(loadMaterias);

const openNew = () => {
    materiaEdit.value = {};
    submitted.value = false;
    materiaModal.value = true;
    isEditMode.value = false;
};

const hideDialog = () => {
    materiaModal.value = false;
    submitted.value = false;
};

const saveMateria = async () => {
    submitted.value = true;
    isAccepting.value = true;
    if (materiaEdit.value.nombre_materia.trim()) {
        loading.value = true;
        try {
            let response;
            if (isEditMode.value) {
                response = await catalogoApi.updateMateria(materiaEdit.value);
                toast.open({
                    message: response.data.msg,
                    type: 'success'
                });
            } else {
                response = await catalogoApi.createMateria(materiaEdit.value);
                toast.open({
                    message: response.data.msg,
                    type: 'success'
                });
            }
            materiaModal.value = false;
            materiaEdit.value = {};
            isEditMode.value = false;
            await loadMaterias();
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

const confirmDeleteMateria = (editMateria) => {
    materiaEdit.value = editMateria;
    deleteMateriaModal.value = true;
};

const editMateria = (editMateria) => {
    const materiasData = { ...editMateria };
    materiaEdit.value = materiasData;
    materiaModal.value = true;
    isEditMode.value = true;
};

const deleteMateria = async () => {
    isAccepting.value = true;

    try {
        const response = await catalogoApi.deleteMateria(materiaEdit.value.materia_id);
        toast.open({
            message: response.data.msg,
            type: 'success'
        });
        deleteMateriaModal.value = false;
        materiaEdit.value = {};
        await loadMaterias(); // Recarga la lista de usuarios
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
                            <Button label="Nueva Materia" icon="pi pi-plus" class="mr-2" severity="success" @click="openNew" />
                        </div>
                    </template>

                    <template v-slot:end>
                        <Button label="Exportar" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
                    </template>
                </Toolbar>

                <DataTable
                    ref="dt"
                    :value="materias"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Mostrando del {first} al {last} de {totalRecords} materias"
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
                        <Button icon="pi pi-refresh" @click="loadMaterias" />
                    </template>
                    <Column field="materia_id" header="ID Materia" :sortable="true"></Column>
                    <Column field="nombre_materia" header="Nombre de la Materia" :sortable="true"></Column>
                    <Column field="descripcion" header="Descripción"></Column>
                    <Column field="creditos" header="Créditos" :sortable="true">
                        <template #body="{ data }">
                            <Badge :value="data.creditos" size="large" severity="secondary"></Badge>
                        </template>
                    </Column>
                    <Column headerStyle="min-width:10rem;" header="Acciones">
                        <template #body="{ data }">
                            <Button icon="pi pi-pencil" class="mr-2" severity="success" rounded @click="editMateria(data)" />
                            <Button icon="pi pi-trash" class="mt-2" severity="warning" rounded @click="confirmDeleteMateria(data)" />
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="materiaModal" :header="isEditMode ? 'Datos de la Materia - Editar' : 'Datos de la Materia - Registrar'" :modal="true" class="p-fluid">
                    <div class="field" v-if="isEditMode">
                        <label for="materia_id">ID Materia</label>
                        <InputText id="materia_id" :disabled="isEditMode" v-model.trim="materiaEdit.materia_id" />
                    </div>
                    <div class="field">
                        <label for="nombre_materia">Nombre de la Materia</label>
                        <InputText id="nombre_materia" v-model.trim="materiaEdit.nombre_materia" required="true" :invalid="submitted && !materiaEdit.nombre_materia" />
                        <small class="p-invalid" v-if="submitted && !materiaEdit.nombre_materia">El numero de nombre materia es requerida.</small>
                    </div>
                    <div class="field">
                        <label for="descripcion">Descripción</label>
                        <Textarea id="descripcion" v-model.trim="materiaEdit.descripcion" />
                    </div>
                    <div class="field">
                        <label for="creditos">Créditos</label>
                        <InputNumber id="creditos" v-model.trim="materiaEdit.creditos" mode="decimal" :minFractionDigits="0" :maxFractionDigits="0" showButtons :min="0" />
                    </div>

                    <!-- </ScrollPanel> -->
                    <template #footer>
                        <Button label="Cancelar" icon="pi pi-times" text="" @click="hideDialog" />
                        <Button label="Guardar" icon="pi pi-check" text="" @click="saveMateria" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteMateriaModal" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="materiaEdit"
                            >¿Estás seguro que quieres eliminar a ID Materia: <b>{{ materiaEdit.materia_id }}</b
                            >?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" text @click="deleteMateriaModal = false" />
                        <Button label="Yes" icon="pi pi-check" text @click="deleteMateria" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>
