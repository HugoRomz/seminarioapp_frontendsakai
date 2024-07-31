<script setup>
import { ref, onMounted, inject } from 'vue';
import { FilterMatchMode } from 'primevue/api';
import { useRoute } from 'vue-router';

import router from '../../router/index.js';

const route = useRoute();
const cursoId = ref(route.params.id);
const filters = ref();

const toast = inject('toast');

import SeminarioApi from '../../api/SeminarioApi.js';
import Spinner from '../../components/Spinner.vue';

const loading = ref(false);
const cursoData = ref({});
const modulos = ref([]);
const alumnosCursoData = ref([]);
const tesinasData = ref([]);

const selectedTipoConstancia = ref();
const dataTipoConstancia = ref([
    { name: 'Constancia con Calificaciones', code: '1' },
    { name: 'Constancia de NO adeudo de parcialidades del Seminario de Titulación', code: '2' }
]);
const constanciaModal = ref(false);
const alumnoModalConstancia = ref([]);

const formatDate = (date) => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    return new Date(date).toLocaleDateString('es-ES', options);
};

const loadCurso = async () => {
    loading.value = true;
    try {
        const response = await SeminarioApi.getCursoById(cursoId.value);
        modulos.value = response.data.modulos.map((modulo) => {
            return {
                ...modulo,
                fecha_inicio: formatDate(modulo.fecha_inicio),
                fecha_cierre: formatDate(modulo.fecha_cierre)
            };
        });
        cursoData.value = { ...response.data };
        console.log(modulos.value);
    } catch (error) {
        toast.open({
            message: error.response.data.msg,
            type: 'error'
        });
    } finally {
        loading.value = false;
    }
};

const obtenerAlumnosCurso = async () => {
    try {
        loading.value = true;
        const response = await SeminarioApi.obtenerAlumnosCurso(cursoId.value);
        alumnosCursoData.value = response.data;
    } catch (error) {
        toast.open({
            message: error.response.data.msg,
            type: 'error'
        });
    } finally {
        loading.value = false;
    }
};

const obtenerTesinasyProyectos = async () => {
    try {
        loading.value = true;
        const response = await SeminarioApi.obtenerTesinasyProyectos(cursoId.value);
        tesinasData.value = response.data.tesinas;
        console.log(response.data);
    } catch (error) {
        toast.open({
            message: error.response.data.msg,
            type: 'error'
        });
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    loadCurso();
    obtenerAlumnosCurso();
    obtenerTesinasyProyectos();
});

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};

initFilters();

const clearFilter = () => {
    initFilters();
};

const generarConstancias = async () => {
    loading.value = true;
    try {
        const data = {
            Nombre: alumnoModalConstancia.value[0].nombre + ' ' + alumnoModalConstancia.value[0].apellido_p + ' ' + alumnoModalConstancia.value[0].apellido_m,
            Curso: cursoData.value.curso.nombre_curso,
            periodo: cursoData.value.periodo.descripcion,
            matricula: alumnoModalConstancia.value[0].matricula,
            calificaciones: alumnoModalConstancia.value[0].calificaciones,
            promedioFinal: alumnoModalConstancia.value[0].promedioFinal,
            modulos: cursoData.value.modulos.map((modulo) => modulo.nombre_modulo)
        };

        const tipoConstancia = selectedTipoConstancia.value[0].code;

        if (tipoConstancia === '1') {
            const url = router.resolve({
                name: 'constanciaEstudios',
                query: { alumno: JSON.stringify(data) }
            }).href;

            const newWindow = window.open(url, '_blank');

            newWindow.addEventListener('load', () => {
                newWindow.addEventListener('afterprint', () => {
                    loading.value = false;
                    newWindow.close();
                });
            });
        } else if (tipoConstancia === '2') {
            const url = router.resolve({
                name: 'constanciaNoAdeudo',
                query: { alumno: JSON.stringify(data) }
            }).href;

            const newWindow = window.open(url, '_blank');

            newWindow.addEventListener('load', () => {
                newWindow.addEventListener('afterprint', () => {
                    loading.value = false;
                    newWindow.close();
                });
            });
        }
    } catch (error) {
        toast.open({
            message: error.response.data.msg,
            type: 'error'
        });
        loading.value = false;
    } finally {
        constanciaModal.value = false;
        selectedTipoConstancia.value = [];
        alumnoModalConstancia.value = [];
    }
};
</script>
<template>
    <Spinner v-if="loading" />
    <div v-if="cursoData && Object.keys(cursoData).length !== 0" class="">
        <div class="card">
            <div class="grid">
                <div class="col-12">
                    <div class="w-full mx-auto">
                        <div class="grid">
                            <div class="col-12 md:col-7">
                                <h1 class="text-4xl font-bold text-black m-0">{{ cursoData.curso.nombre_curso }}</h1>
                                <div class="text-gray-500 font-medium text-lg">
                                    <span>{{ cursoData.curso.carrera.nombre_carrera }}</span>
                                </div>
                                <div class="text-gray-700 font-medium text-lg mt-3">
                                    <span class=""> Periodo </span>
                                </div>
                                <div class="text-black font-medium text-lg mt-1">
                                    <span class="text-gray-500">{{ cursoData.periodo.descripcion }} </span>
                                </div>
                            </div>
                            <div class="col-12 flex flex-column align-items-center justify-content-end md:col-5 md:gap-2 md:flex-row">
                                <Button @click="constanciaModal = true" class="w-full mt-3 md:mt-0" label="Generar constancias" severity="contrast" outlined />
                                <Button class="w-full mt-3 md:mt-0" label="Generar reportes" severity="contrast" outlined disabled />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-12">
                    <h3 class="text-2xl font-bold text-gray-800">Módulos</h3>
                    <DataTable :value="modulos" paginator :rows="5" :rowsPerPageOptions="[5, 10, 20, 50]" tableStyle="min-width: 50rem">
                        <Column field="nombre_modulo" header="Módulo"></Column>
                        <Column field="usuario" header="Docente">
                            <template #body="slotProps"> {{ slotProps.data.usuario.nombre }} {{ slotProps.data.usuario.apellido_p }} {{ slotProps.data.usuario.apellido_m }} </template>
                        </Column>
                        <Column field="fecha_inicio" header="Fecha Inicio"></Column>
                        <Column field="fecha_cierre" header="Fecha Cierre"></Column>
                    </DataTable>
                </div>
                <div class="col-12">
                    <h3 class="text-2xl font-bold text-gray-800">Alumnos</h3>
                    <DataTable
                        ref="dt"
                        :value="alumnosCursoData"
                        dataKey="id"
                        :paginator="true"
                        :rows="10"
                        :filters="filters"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        :rowsPerPageOptions="[5, 10, 25]"
                        currentPageReportTemplate="Mostrando del {first} al {last} de {totalRecords} alumnos"
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
                        <Column field="matricula" header="Matricula" :sortable="true"> </Column>
                        <Column field="nombre" header="Nombre" :sortable="true"></Column>
                        <Column field="apellido_p" header="Apellido Paterno" :sortable="true"></Column>
                        <Column field="apellido_m" header="Apellido Materno" :sortable="true"></Column>
                        <Column field="promedioFinal" header="Promedio" :sortable="true"></Column>

                        <Column field="status" header="Status" dataType="string" style="min-width: 8rem" :sortable="true">
                            <template #body="{ data }">
                                <i
                                    class="pi"
                                    :class="{
                                        'pi-check-circle text-green-500': data.status === 'ACTIVO',
                                        'pi-times-circle text-red-500': data.status !== 'ACTIVO'
                                    }"
                                ></i>
                            </template>
                            <template #filter="{ filterModel, filterCallback }">
                                <TriStateCheckbox v-model="filterModel.value" @change="filterCallback()" />
                            </template>
                        </Column>
                    </DataTable>
                </div>
                <div class="col-12">
                    <h3 class="text-2xl font-bold text-gray-800">Proyectos y Tesinas</h3>
                    <!-- <DataTable :value="alumnosCursoData" paginator :rows="5" :rowsPerPageOptions="[5, 10, 20, 50]" tableStyle="min-width: 50rem">
                        <Column field="alumno.matricula" header="Matricula" :sortable="true">
                            <template #body="{ data }">
                                {{ displayMatricula(data).matricula }}
                            </template>
                        </Column>
                        <Column field="usuario" header="Docente">
                            <template #body="slotProps"> {{ slotProps.data.usuario.nombre }} {{ slotProps.data.usuario.apellido_p }} {{ slotProps.data.usuario.apellido_m }} </template>
                        </Column>
                        <Column field="calificacion" header="Calificación Mód" :sortable="true"></Column>
                        <Column field="calificacion_proyecto" header="Calificación Proy" :sortable="true"></Column>
                        <Column field="calificacion_final" header="Calificación Final" :sortable="true"></Column>
                    </DataTable> -->
                </div>
            </div>
        </div>
    </div>

    <div v-else>
        <div class="card">
            <h3>No se encontró el curso</h3>
        </div>
    </div>

    <Dialog v-model:visible="constanciaModal" header="Generar Constancias" :modal="true" class="p-fluid w-full md:w-4">
        <div class="field">
            <label for="tipoConstancia">Tipo de Constancia</label>
            <MultiSelect v-model="selectedTipoConstancia" display="chip" :options="dataTipoConstancia" optionLabel="name" :filter="true" placeholder="Selecciona el tipo de constancia" :selectionLimit="1" class="w-full" />
        </div>
        <div class="field">
            <label for="alumnoModalConstancia">Selecciona los alumnos</label>
            <MultiSelect v-model="alumnoModalConstancia" :options="alumnosCursoData" placeholder="Selecciona los alumnos para generar constancias" :filter="true" :selectionLimit="1">
                <template #value="slotProps">
                    <div class="inline-flex align-items-center py-1 px-2 bg-blue-900 text-white border-round mr-2" v-for="option of slotProps.value" :key="option.id">
                        <div>{{ option.nombre }} {{ option.apellido_p }} {{ option.apellido_m }}</div>
                    </div>
                </template>
                <template #option="slotProps">
                    <div>{{ slotProps.option.nombre }} {{ slotProps.option.apellido_p }} {{ slotProps.option.apellido_m }}</div>
                </template>
            </MultiSelect>
        </div>

        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" text="" @click="constanciaModal = false" />
            <Button label="Generar" icon="pi pi-check" text="" @click="generarConstancias" />
        </template>
    </Dialog>
</template>
