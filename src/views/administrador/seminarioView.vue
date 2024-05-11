<script setup>
import { ref, onMounted } from 'vue';
import { FilterMatchMode } from 'primevue/api';

import SeminarioApi from '../../api/SeminarioApi.js';

import Spinner from '../../components/Spinner.vue';

const filters = ref();
const loading = ref(false);
const cursosData = ref(null);
const rechazarCurso = ref(false);
const dataCursoModal = ref({});

const loadSeminarios = async () => {
    loading.value = true;
    try {
        const response = await SeminarioApi.findSeminarioActivo();
        cursosData.value = response.data;
        console.log('cursosData:', cursosData.value);
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(loadSeminarios);

const rechazarCursoModal = (dataCurso) => {
    dataCursoModal.value = dataCurso;
    rechazarCurso.value = true;
};

const rechazarCursoMotivo = async (dataCurso) => {
    console.log('dataCurso:', dataCurso);
    rechazarCurso.value = false;
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
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <!-- <Button label="Nueva Materia" icon="pi pi-plus" class="mr-2" severity="success" @click="openNew" /> -->
                        </div>
                    </template>

                    <template v-slot:end>
                        <Button label="Exportar" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
                    </template>
                </Toolbar>

                <DataTable
                    ref="dt"
                    :value="cursosData"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
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
                    <template #empty> No hay registros. </template>
                    <template #loading> Cargando... por favor espera </template>
                    <template #paginatorstart>
                        <Button icon="pi pi-refresh" @click="loadSeminarios" />
                    </template>
                    <Column field="curso_periodo_id" header="ID" :sortable="true"></Column>
                    <Column field="curso.nombre_curso" header="Nombre del Curso" :sortable="true"></Column>
                    <Column field="periodo.descripcion" header="Periodo" :sortable="true"></Column>
                    <Column field="curso.carrera.nombre_carrera" header="Carrera" :sortable="true"></Column>
                    <Column field="status" header="Status" :sortable="true">
                        <template #body="{ data }">
                            <Tag v-if="data.status == 'Pendiente'" class="mr-2" severity="warning" value="Pendiente"></Tag>
                            <Tag v-if="data.status == 'Aceptado'" class="mr-2" severity="success" value="Activo"></Tag>
                            <Tag v-if="data.status == 'Cancelado'" class="mr-2" severity="info" value="Cancelado"></Tag>
                            <Tag v-if="data.status == 'Finalizado'" class="mr-2" severity="danger" value="Terminado"></Tag>
                        </template>
                    </Column>
                    <Column headerStyle="min-width:10rem;" header="Acciones">
                        <template #body="{ data }">
                            <div class="flex flex-row justify-content-center">
                                <Button v-if="data.status == 'Pendiente'" label="Aceptar" class="mr-2" rounded severity="success" @click="console.log('Aceptar')" />
                                <Button v-if="data.status == 'Pendiente'" label="Rechazar" class="mr-2" rounded severity="danger" @click="rechazarCursoModal(data)" />
                                <Button v-if="data.status == 'Aceptado'" label="Ver detalle" class="mr-2" rounded severity="info" @click="console.log('Ver detalle Seminario')" />
                                <Button v-if="data.status == 'Cancelado'" label="Ver motivo" class="mr-2" rounded severity="warning" @click="console.log('Ver motivo')" />
                                <Button v-if="data.status == 'Finalizado'" label="Ver reporte" class="mr-2" rounded severity="help" @click="console.log('Ver reporte Seminario')" />
                            </div>
                        </template>
                    </Column>
                </DataTable>

                <!-- <Dialog v-model:visible="materiaModal" :header="isEditMode ? 'Datos de la Materia - Editar' : 'Datos de la Materia - Registrar'" :modal="true" class="p-fluid">
                    <div class="field" v-if="isEditMode">
                        <label for="materia_id">ID Materia</label>
                        <InputText id="materia_id" :disabled="isEditMode" v-model.trim="materiaEdit.materia_id" />
                    </div>
                    <div class="field">
                        <label for="nombre_materia">Nombre de la Materia</label>
                        <InputText id="nombre_materia" v-model.trim="materiaEdit.nombre_materia" required="true" :invalid="submitted && !materiaEdit.nombre_materia" />
                        <small class="p-invalid" v-if="submitted && !materiaEdit.nombre_materia">El numero de nombre materia es requerida.</small>
                    </div>

                  
                    <template #footer>
                        <Button label="Cancelar" icon="pi pi-times" text="" @click="hideDialog" />
                        <Button label="Guardar" icon="pi pi-check" text="" @click="saveMateria" />
                    </template>
                </Dialog>
 -->
                <Dialog v-model:visible="rechazarCurso" :style="{ width: '450px' }" header="Rechazar Curso" :modal="true">
                    <div class="flex flex-column align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle" style="font-size: 2rem" />
                        <span class="mt-3" v-if="dataCursoModal">¿Estás seguro que quieres rechazar el curso?</span>
                        <InputText class="mt-3 w-8" v-model="dataCursoModal.motivo" placeholder="Motivo de rechazo" />
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" text @click="rechazarCurso = false" />
                        <Button label="Yes" icon="pi pi-check" text @click="rechazarCursoMotivo(dataCursoModal)" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>
