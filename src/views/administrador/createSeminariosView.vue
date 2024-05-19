<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, inject, onMounted } from 'vue';
import catalogoApi from '../../api/catalogoApi.js';
import Spinner from '../../components/Spinner.vue';

const isAccepting = ref(false);
const toast = inject('toast');

const carreras = ref([]);
const materias = ref([]);
const cursosTable = ref(null);
const filters = ref();
const loading = ref(null);
const expandedRows = ref([]);

const dataDocumentos = ref([]);
const modalDocumentos = ref(false);
const formDataDocumentos = ref([]);

const DocumentosDataFor = ref([
    {
        id: 1,
        nombre: 'Alumno'
    },
    {
        id: 2,
        nombre: 'Egresado'
    },
    {
        id: 3,
        nombre: 'Docente'
    }
]);
const isEditMode = ref(false);

const cursosEdit = ref({});
const cursosModal = ref(false);
const submitted = ref(false);

const loadCursos = async () => {
    loading.value = true;
    try {
        const response = await catalogoApi.findCursos();
        cursosTable.value = response.data;
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
    } finally {
        loading.value = false;
    }
};
const findCarreras = async () => {
    try {
        const response = await catalogoApi.findCarreras();
        carreras.value = response.data;
    } catch (error) {
        console.error('Error al obtener las carreras:', error);
    }
};
const findMaterias = async () => {
    try {
        const response = await catalogoApi.findMaterias();
        materias.value = response.data;
    } catch (error) {
        console.error('Error al obtener las carreras:', error);
    }
};

const findDocumentos = async () => {
    try {
        const response = await catalogoApi.findDocumentos();
        dataDocumentos.value = response.data;
    } catch (error) {
        console.error('Error al obtener los documentos:', error);
    }
};

onMounted(loadCursos(), findCarreras(), findMaterias(), findDocumentos());

const openNew = () => {
    cursosEdit.value = {};
    submitted.value = false;
    cursosModal.value = true;
    isEditMode.value = false;
};

const hideDialog = () => {
    cursosModal.value = false;
    submitted.value = false;
};

const showModalDocumentos = (data) => {
    modalDocumentos.value = true;
    formDataDocumentos.value = DocumentosDataFor.value.map((documento) => ({
        curso_id: data.curso_id,
        tipo: documento.nombre,
        nombre_curso: data.nombre_curso,
        documento_id: []
    }));
    console.log(formDataDocumentos.value);
};

const saveCurso = async () => {
    submitted.value = true;
    isAccepting.value = true;

    loading.value = true;

    try {
        let response;
        if (isEditMode.value) {
            response = await catalogoApi.updateCurso(cursosEdit.value);
            toast.open({
                message: response.data.msg,
                type: 'success'
            });
        } else {
            response = await catalogoApi.createCurso(cursosEdit.value);
            toast.open({
                message: response.data.msg,
                type: 'success'
            });
        }
        cursosModal.value = false;
        cursosEdit.value = {};
        isEditMode.value = false;
        await loadCursos();
    } catch (error) {
        toast.open({
            message: error.response && error.response.data.msg ? error.response.data.msg : 'Error desconocido',
            type: 'error'
        });
    } finally {
        loading.value = false;
        isAccepting.value = false;
    }
};

const editCursos = (curso) => {
    const cursoData = { ...curso };
    cursosEdit.value = { ...cursoData, carrera: cursoData.carrera };
    cursosModal.value = true;
    isEditMode.value = true;
};

const saveAsignarDocumentos = async () => {
    isAccepting.value = true;
    loading.value = true;

    try {
        const response = await catalogoApi.asignarDocumentos(formDataDocumentos.value);
        toast.open({
            message: response.data.msg,
            type: 'success'
        });
        modalDocumentos.value = false;
    } catch (error) {
        toast.open({
            message: error.response && error.response.data.msg ? error.response.data.msg : 'Error desconocido',
            type: 'error'
        });
    } finally {
        loading.value = false;
        isAccepting.value = false;
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
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="Nuevo curso" icon="pi pi-plus" class="mr-2" severity="success" @click="openNew" />
                        </div>
                    </template>
                </Toolbar>

                <DataTable
                    :value="cursosTable"
                    :filters="filters"
                    v-model:expandedRows="expandedRows"
                    dataKey="curso_id"
                    tableStyle="min-width: 60rem"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Mostrando del {first} al {last} de {totalRecords} cursos"
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
                    <Column field="curso_id" header="ID Curso" :sortable="true">
                        <template #body="slotProps">
                            {{ slotProps.data.curso_id }}
                        </template>
                    </Column>
                    <Column field="nombre_curso" header="Curso" :sortable="true">
                        <template #body="slotProps">
                            {{ slotProps.data.nombre_curso }}
                        </template>
                    </Column>
                    <Column field="nombre_carrera" header="Carrera" :sortable="true">
                        <template #body="slotProps">
                            {{ slotProps.data.carrera.nombre_carrera }}
                        </template>
                    </Column>
                    <Column headerStyle="min-width:10rem;" header="Acciones">
                        <template #body="{ data }">
                            <Button icon="pi pi-file" class="mr-2" label="Asignar Documentos" severity="warning" rounded @click="showModalDocumentos(data)" />
                            <Button icon="pi pi-pencil" class="mr-2" severity="success" rounded @click="editCursos(data)" />
                        </template>
                    </Column>

                    <template #expansion="slotProps">
                        <div class="card">
                            <h5>
                                Detalle del Curso - <strong>{{ slotProps.data.nombre_curso }}</strong>
                            </h5>
                            <DataTable :value="slotProps.data.det_cursos">
                                <Column field="det_curso_id" header="ID Detalle" :sortable="true">
                                    <template #body="slotProps">
                                        {{ slotProps.data.det_curso_id }}
                                    </template>
                                </Column>
                                <Column field="nombre_materia" header="Nombre de la Materia" :sortable="true">
                                    <template #body="slotProps">
                                        {{ slotProps.data.materia.nombre_materia }}
                                    </template>
                                </Column>
                                <Column headerStyle="width:4rem">
                                    <template #body>
                                        <Button icon="pi pi-search" @click="$router.push('materias')" />
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </template>
                </DataTable>

                <Dialog v-model:visible="cursosModal" :style="{ width: '650px' }" :header="isEditMode ? 'Datos de la Carrera - Editar' : 'Datos de la Carrera - Registrar'" :modal="true" class="p-fluid">
                    <div class="field" v-if="isEditMode">
                        <label for="curso_id">ID Carrera</label>
                        <InputText id="curso_id" :disabled="isEditMode" v-model.trim="cursosEdit.curso_id" />
                    </div>
                    <div class="field">
                        <label for="nombre_carrera">Carrera</label>
                        <Dropdown id="nombre_carrera" v-model.trim="cursosEdit.carrera" :options="carreras" optionLabel="nombre_carrera" placeholder="Selecciona" required="true" :invalid="submitted && !cursosEdit.carrera" />
                        <small class="p-invalid" v-if="submitted && !cursosEdit.carrera">La carrera es requerida.</small>
                    </div>

                    <div class="field">
                        <label for="nombre_curso">Nombre del Curso</label>
                        <InputText id="nombre_curso" v-model.trim="cursosEdit.nombre_curso" required="true" :invalid="submitted && !cursosEdit.nombre_curso" />
                        <small class="p-invalid" v-if="submitted && !cursosEdit.nombre_curso">El numero de nombre carrera es requerida.</small>
                    </div>
                    <div class="field" v-if="!isEditMode">
                        <label for="materia">Selecciona las materias</label>
                        <MultiSelect v-model="cursosEdit.materias" :options="materias" :selectionLimit="5" optionLabel="nombre_materia" placeholder="Selecciona la materia" :filter="true">
                            <template #value="slotProps">
                                <div class="inline-flex align-items-center py-1 px-2 bg-blue-900 text-white border-round mr-2" v-for="option of slotProps.value" :key="option.id">
                                    <div>{{ option.nombre_materia }}</div>
                                </div>
                                <template v-if="!slotProps.value || slotProps.value.length === 0">
                                    <div class="p-1">Selecciona la materia</div>
                                </template>
                            </template>
                            <template #option="slotProps">
                                <div>{{ slotProps.option.nombre_materia }}</div>
                            </template>
                        </MultiSelect>
                    </div>
                    <template #footer>
                        <Button label="Cancelar" icon="pi pi-times" text="" @click="hideDialog" />
                        <Button label="Guardar" icon="pi pi-check" text="" @click="saveCurso" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="modalDocumentos" class="w-full md:w-6" header="Asignar Documentos al Curso" :modal="true">
                    <Spinner v-if="loading" />
                    <Stepper>
                        <StepperPanel v-for="(documento, index) in DocumentosDataFor" :key="index" :header="`Documentos ${documento.nombre}`">
                            <template #content="{ nextCallback, prevCallback }">
                                <div class="flex flex-column h-12rem">
                                    <div class="border-2 border-dashed surface-border border-round surface-ground flex-auto flex justify-content-center align-items-center font-medium">
                                        <div class="p-fluid formgrid grid p-4 w-full">
                                            <div class="field col-12"></div>
                                            <div class="field col-12">
                                                <MultiSelect v-model="formDataDocumentos[index].documento_id" :options="dataDocumentos" optionLabel="nombre_documento" placeholder="Selecciona el documento" :filter="true" class="w-full">
                                                    <template #value="slotProps">
                                                        <div class="inline-flex align-items-center py-1 px-2 bg-blue-900 text-white border-round mr-2" v-for="option of slotProps.value" :key="option.id">
                                                            <div>{{ option.nombre_documento }}</div>
                                                        </div>
                                                        <template v-if="!slotProps.value || slotProps.value.length === 0">
                                                            <div class="p-1">Selecciona el documento</div>
                                                        </template>
                                                    </template>
                                                    <template #option="slotProps">
                                                        <div>{{ slotProps.option.nombre_documento }}</div>
                                                    </template>
                                                </MultiSelect>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="flex pt-7 justify-content-between">
                                    <Button v-if="index > 0" label="Regresar" icon="pi pi-arrow-left" @click="prevCallback" />
                                    <Button v-else label="Regresar" icon="pi pi-arrow-left" disabled />
                                    <Button v-if="index < DocumentosDataFor.length - 1" label="Siguiente" icon="pi pi-arrow-right" iconPos="right" @click="nextCallback" />
                                    <Button v-else label="Guardar" icon="pi pi-check" iconPos="right" @click="saveAsignarDocumentos()" />
                                </div>
                            </template>
                        </StepperPanel>
                    </Stepper>
                </Dialog>
            </div>
        </div>
    </div>
</template>
