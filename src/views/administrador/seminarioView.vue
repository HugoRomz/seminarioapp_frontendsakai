<script setup>
import { ref, onMounted, inject } from 'vue';
import { FilterMatchMode } from 'primevue/api';
const toast = inject('toast');

import SeminarioApi from '../../api/SeminarioApi.js';

import Spinner from '../../components/Spinner.vue';

const filters = ref();
const loading = ref(false);
const cursosData = ref(null);
const rechazarCurso = ref(false);
const verMotivo = ref(false);
const altaCursoModal = ref(false);
const dataCursoModal = ref({});
const periodoModal = ref(false);

const periodoForm = ref({});

const loadSeminarios = async () => {
    loading.value = true;
    try {
        const response = await SeminarioApi.findSeminarioActivo();
        cursosData.value = response.data;
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
    loading.value = true;
    try {
        const response = await SeminarioApi.rechazarCurso(dataCurso);
        toast.open({
            message: response.data.msg,
            type: 'success'
        });
        loadSeminarios();
    } catch (error) {
        console.error('Error al rechazar el curso:', error);
    } finally {
        loading.value = false;
        rechazarCurso.value = false;
        dataCursoModal.value = {};
    }
};

const verMotivoModal = (data) => {
    verMotivo.value = true;
    dataCursoModal.value = data;
};
const openModalCurso = () => {
    altaCursoModal.value = true;
};

const openModalPeriodo = () => {
    periodoForm.value = {};
    periodoModal.value = true;
};

const savePeriodo = async () => {
    loading.value = true;
    try {
        const response = await SeminarioApi.createPeriodo(periodoForm.value);
        toast.open({
            message: response.data.msg,
            type: 'success'
        });
        periodoModal.value = false;
        periodoForm.value = {};
    } catch (error) {
        console.error('Error al guardar el periodo:', error);
    } finally {
        loading.value = false;
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
    <Spinner v-if="loading" />
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2"><Button label="Periodo" icon="pi pi-calendar-times" iconPos="right" class="mr-2" severity="primary" @click="openModalPeriodo" /></div>
                        <div class="my-2"><Button label="Alta Curso" icon="pi pi-plus" class="mr-2" severity="success" @click="openModalCurso" /></div>
                    </template>
                    <template v-slot:center> </template>

                    <template v-slot:end>
                        <div class="my-2"><Button label="Crear Catalogo Curso" icon="pi pi-plus" class="mr-2" severity="warning" @click="$router.push('createSeminarios')" /></div>
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
                    :sortField="'periodo.descripcion'"
                    :sortOrder="-1"
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
                            <Tag v-if="data.status == 'Pendiente'" class="mr-2" severity="info" value="Pendiente"></Tag>
                            <Tag v-if="data.status == 'Aceptado'" class="mr-2" severity="success" value="Activo"></Tag>
                            <Tag v-if="data.status == 'Cancelado'" class="mr-2" severity="warning" value="Cancelado"></Tag>
                            <Tag v-if="data.status == 'Finalizado'" class="mr-2" severity="danger" value="Finalizado"></Tag>
                        </template>
                    </Column>
                    <Column headerStyle="min-width:10rem;" header="Acciones">
                        <template #body="{ data }">
                            <div class="flex flex-row justify-content-center">
                                <Button v-if="data.status == 'Pendiente'" label="Aceptar" class="mr-2" rounded severity="success" @click="console.log('Aceptar')" />
                                <Button v-if="data.status == 'Pendiente'" label="Rechazar" class="mr-2" rounded severity="danger" @click="rechazarCursoModal(data)" />
                                <Button v-if="data.status == 'Aceptado'" label="Ver detalle" class="mr-2" rounded severity="info" @click="console.log('Ver detalle Seminario')" />
                                <Button v-if="data.status == 'Cancelado'" label="Ver motivo" class="mr-2" rounded severity="warning" @click="verMotivoModal(data)" />
                                <Button v-if="data.status == 'Finalizado'" label="Ver reporte" class="mr-2" rounded severity="help" @click="console.log('Ver reporte Seminario')" />
                            </div>
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="rechazarCurso" :style="{ width: '450px' }" header="Rechazar Curso" :modal="true">
                    <div class="flex flex-column align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle" style="font-size: 2rem" />
                        <span class="mt-3" v-if="dataCursoModal">¿Estás seguro que quieres rechazar el curso?</span>
                        <InputText class="mt-3 w-8" v-model="dataCursoModal.motivo" placeholder="Motivo de rechazo" />
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" text @click="(rechazarCurso = false), (dataCursoModal.motivo = '')" />
                        <Button label="Yes" icon="pi pi-check" text @click="rechazarCursoMotivo(dataCursoModal)" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="verMotivo" :style="{ width: '450px' }" header="Motivo de Rechazo" :modal="true">
                    <div class="flex flex-column align-items-center justify-content-center">
                        <i class="pi pi-info-circle mt-1" style="font-size: 2rem" />
                        <span class="mt-3 text-lg" v-if="dataCursoModal"
                            >Descripción: <strong> {{ dataCursoModal.descripcion }}</strong></span
                        >
                    </div>
                    <template #footer>
                        <Button label="Cerrar" icon="pi pi-times" text @click="verMotivo = false" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="periodoModal" :style="{ width: '450px' }" header="Periodo" :modal="true" class="p-fluid">
                    <div class="field">
                        <label for="periodo">Fecha de Inicio</label>
                        <Calendar :showIcon="true" :showButtonBar="true" v-model="periodoForm.fechaInicio" :minDate="new Date()"></Calendar>
                    </div>
                    <div class="field">
                        <label for="periodo">Fecha de Cierre</label>
                        <Calendar :showIcon="true" :showButtonBar="true" v-model="periodoForm.fechaCierre" :minDate="periodoForm.fechaInicio"></Calendar>
                    </div>
                    <template #footer>
                        <Button label="Cancelar" icon="pi pi-times" text="" @click="(periodoModal = false), (periodoForm = {})" />
                        <Button label="Guardar" icon="pi pi-check" text="" @click="savePeriodo" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="altaCursoModal" :style="{ width: '450px' }" header="Alta Curso" :modal="true">
                    <div class="field">
                        <label for="materia_id">ID Materia</label>
                        <InputText id="materia_id" />
                    </div>
                    <div class="field">
                        <label for="nombre_materia">Nombre de la Materia</label>
                        <InputText id="nombre_materia" required="true" />
                    </div>
                    <template #footer>
                        <!-- <Button label="Cancelar" icon="pi pi-times" text="" @click="hideDialog" />
                        <Button label="Guardar" icon="pi pi-check" text="" @click="saveMateria" /> -->
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>
