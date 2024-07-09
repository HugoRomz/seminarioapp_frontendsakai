<script setup>
import { ref, onMounted, inject, watch } from 'vue';
import { FilterMatchMode } from 'primevue/api';
import SeminarioApi from '../../api/SeminarioApi';
import configuracionApi from '../../api/configuracionApi';
import Spinner from '../../components/Spinner.vue';
import { format } from 'date-fns';

const toast = inject('toast');
const filters = ref();
const expandedRows = ref([]);
const dt = ref();
const modulos = ref([]);
const loading = ref(false);
const submitted = ref(false);
const selectedPeriodos = ref(null);
const periodos = ref([]);
const selectedCurso = ref(null);
const cursos = ref([]);
const modalEvidencias = ref(false);
const EvidenciasData = ref([]);
let allModulos = [];

const formatDate = (dateStr) => {
    return format(new Date(dateStr), 'yyyy/MM/dd');
};

watch(selectedPeriodos, async (newValue) => {
    if (newValue && newValue.value.periodo_id) {
        await loadCursos(newValue.value.periodo_id);
        selectedCurso.value = null;
    }
});

const loadCursos = async (periodoId) => {
    loading.value = true;
    selectedCurso.value = null;
    try {
        const response = await SeminarioApi.loadModulos(periodoId);
        allModulos = response.data;

        allModulos.sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));
        modulos.value = allModulos;

        const cursosSet = new Set(allModulos.map((modulo) => JSON.stringify(modulo.cursos_periodo.curso)));
        cursos.value = Array.from(cursosSet).map((curso) => JSON.parse(curso));
    } catch (error) {
        console.error('Error al cargar los módulos:', error);
        toast.open({
            message: 'Error al cargar los módulos',
            type: 'error'
        });
    } finally {
        loading.value = false;
    }
};

const loadPeriodos = async () => {
    loading.value = true;
    try {
        const response = await SeminarioApi.loadPeriodos();
        periodos.value = response.data;
    } catch (error) {
        console.error('Error al obtener los periodos:', error);
    } finally {
        loading.value = false;
    }
};

const loadEvidencias = async (actividad_id) => {
    loading.value = true;
    try {
        const response = await SeminarioApi.getEvidencias(actividad_id);
        EvidenciasData.value = response.data;
    } catch (error) {
        toast.open({
            message: error.response.data.msg,
            type: 'error'
        });
    } finally {
        loading.value = false;
    }
};

const showModalEvidencias = async (actividad_id) => {
    await loadEvidencias(actividad_id);
    modalEvidencias.value = true;
};

onMounted(async () => {
    await loadPeriodos();
});

const handlePeriodChange = async (newValue) => {
    selectedPeriodos.value = newValue;
};

const handleCursoChange = () => {
    if (selectedCurso.value) {
        const cursoId = selectedCurso.value.curso_id;
        modulos.value = allModulos.filter((modulo) => modulo.cursos_periodo.curso.curso_id === cursoId).sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));
    } else {
        modulos.value = allModulos.sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));
    }
};

const onRowToggle = (event) => {
    expandedRows.value = event.data ? [event.data] : [];
};

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};

const openFilePreview = (url) => {
    if (url) {
        window.open(url, '_blank', 'width=1124,height=688');
    }
};

initFilters();

const clearFilter = () => {
    initFilters();
    selectedCurso.value = null;
    if (selectedPeriodos.value) {
        modulos.value = allModulos.sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));
    }
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
                        <h2 class="m-0 mr-5 font-medium text-lg">Seleccione el periodo para ver las evidencias:</h2>
                        <Dropdown id="period" v-model="selectedPeriodos" :options="periodos" optionLabel="descripcion" placeholder="Selecciona el periodo" @change="handlePeriodChange" :invalid="submitted && !selectedPeriodos" :filter="true">
                            <template #option="{ option }">
                                {{ option.descripcion }}
                            </template>
                        </Dropdown>
                    </div>
                </template>
            </card>
            <div v-if="modulos && Object.keys(modulos).length !== 0">
                <div class="card">
                    <DataTable
                        ref="dt"
                        :value="modulos"
                        dataKey="modulo_id"
                        :paginator="true"
                        :rows="10"
                        :filters="filters"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        :rowsPerPageOptions="[5, 10, 25]"
                        currentPageReportTemplate="Mostrando del {first} al {last} de {totalRecords} módulos"
                        :expandedRows="expandedRows"
                        @rowToggle="onRowToggle"
                    >
                        <template #header>
                            <div class="flex justify-content-between flex-column sm:flex-row">
                                <Button type="button" icon="pi pi-filter-slash" label="Limpiar" outlined @click="clearFilter()" />
                                <div class="flex align-items-center gap-2">
                                    <Dropdown id="curso" v-model="selectedCurso" :options="cursos" optionLabel="nombre_curso" placeholder="Mostrar por curso" @change="handleCursoChange" :filter="true">
                                        <template #option="{ option }">
                                            {{ option.nombre_curso }}
                                        </template>
                                    </Dropdown>
                                    <IconField iconPosition="left">
                                        <InputIcon class="pi pi-search" />
                                        <InputText v-model="filters['global'].value" placeholder="Búsqueda por palabra clave" style="width: 100%" />
                                    </IconField>
                                </div>
                            </div>
                        </template>
                        <template #empty> No hay registros. </template>
                        <template #loading> Cargando... por favor espera </template>
                        <template #paginatorstart>
                            <Button icon="pi pi-refresh" @click="loadCursos(selectedPeriodos.value.periodo_id)" />
                        </template>
                        <Column :expander="true" headerStyle="width: 3rem" />
                        <Column field="nombre_modulo" header="Modulo" :sortable="true"></Column>
                        <Column field="fecha_inicio" header="Fecha de inicio" :sortable="true">
                            <template #body="slotProps">
                                {{ formatDate(slotProps.data.fecha_inicio) }}
                            </template>
                        </Column>
                        <Column field="fecha_cierre" header="Fecha de cierre" :sortable="true">
                            <template #body="slotProps">
                                {{ formatDate(slotProps.data.fecha_cierre) }}
                            </template>
                        </Column>
                        <template #expansion="slotProps">
                            <div class="card">
                                <h5>
                                    Detalle del Modulo - <strong>{{ slotProps.data.nombre_modulo }} </strong> - <strong>{{ slotProps.data.cursos_periodo.curso.nombre_curso }}</strong> -
                                    <strong>{{ slotProps.data.cursos_periodo.periodo.descripcion }}</strong>
                                </h5>
                                <DataTable :value="slotProps.data.actividades">
                                    <Column field="nombre_actividad" header="Nombre de la actividad" :sortable="true">
                                        <template #body="slotProps">
                                            {{ slotProps.data.nombre_actividad }}
                                        </template>
                                    </Column>
                                    <Column field="descripcion" header="Descripción" :sortable="true">
                                        <template #body="slotProps">
                                            {{ slotProps.data.descripcion }}
                                        </template>
                                    </Column>
                                    <Column field="nombre_tipo_ev" header="Tipo de evidencia" :sortable="true">
                                        <template #body="slotProps">
                                            {{ slotProps.data.tipo_evidencia.nombre_tipo_ev }}
                                        </template>
                                    </Column>
                                    <Column field="fecha_entrega" header="Fecha" :sortable="true">
                                        <template #body="slotProps">
                                            {{ formatDate(slotProps.data.fecha_entrega) }}
                                        </template>
                                    </Column>
                                    <Column header="Acciones" headerStyle="text-align: center;">
                                        <template #body="{ data }">
                                            <div class="text-center">
                                                <Button label="Ver Evidencias" class="mr-2" severity="info" @click="showModalEvidencias(data.actividad_id)" />
                                            </div>
                                        </template>
                                    </Column>
                                </DataTable>
                            </div>
                        </template>
                    </DataTable>
                    <Dialog class="p-fluid w-11 md:w-8" v-model:visible="modalEvidencias" header="Evidencias de la Actividad" modal position="top">
                        <div class="card">
                            <DataTable
                                :value="EvidenciasData"
                                :paginator="true"
                                :rows="10"
                                :filters="filters"
                                stripedRows
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                :rowsPerPageOptions="[5, 10, 25]"
                                currentPageReportTemplate="Mostrando del {first} al {last} de {totalRecords} evidencias"
                                tableStyle="min-width: 50rem"
                            >
                                <template #empty> No hay registros. </template>
                                <template #loading> Cargando... por favor espera </template>
                                <Column field="evidencias_id" header="ID Evidencia" style="width: 5%"></Column>
                                <Column field="actividade.nombre_actividad" header="Nombre de la Actividad" style="width: 15%"></Column>
                                <Column field="descripcion" header="Descripción" style="width: 35%"></Column>
                                <Column header="Visualizar" style="width: 20%">
                                    <template #body="{ data }">
                                        <div class="flex gap-2">
                                            <a @click="openFilePreview(data.url_evidencia)" v-if="data.url_evidencia">
                                                <Button icon="pi pi-search" label="Ver" class="w-full" />
                                            </a>
                                            <Button icon="pi pi-search" :disabled="true" v-else class="w-full" />
                                            <a @click="downloadFile(data.url_evidenciaPublic)" v-if="data.url_evidenciaPublic">
                                                <Button icon="pi pi-download" label="Descargar" class="w-full" />
                                            </a>
                                        </div>
                                        <!-- Boton para descargar evidencia -->
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                        <template #footer>
                            <Button label="Cerrar" icon="pi pi-times" @click="modalEvidencias = false" />
                        </template>
                    </Dialog>
                </div>
            </div>
            <div v-else>
                <card>
                    <template #title>Evidencias</template>
                    <template #content> Selecciona un periodo para ver las evidencias. </template>
                </card>
            </div>
        </div>
    </div>
</template>
