<script setup>
import { ref, onMounted, inject } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const cursoId = ref(route.params.id);

const toast = inject('toast');

import SeminarioApi from '../../api/SeminarioApi.js';
import Spinner from '../../components/Spinner.vue';

const loading = ref(false);
const cursoData = ref({});
const modulos = ref([]);
const alumnosCursoData = ref([]);
const tesinasData = ref([]);

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
        const response = await SeminarioApi.obtenerAlumnosConstancias(cursoId.value);
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

const displayMatricula = (data) => {
    if (data.usuario.alumno) {
        return {
            matricula: data.usuario.alumno.matricula,
            calificacionFinal: data.alumno.calificacionFinal
        };
    } else if (data.usuario.egresado) {
        return {
            matricula: data.usuario.egresado.cod_egresado,
            calificacionFinal: data.usuario.egresado.calificacionFinal
        };
    } else {
        return {
            matricula: 'N/A',
            calificacionFinal: 'N/A'
        };
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
                                <Button @click="console.log('fdas')" class="w-full mt-3 md:mt-0" label="Generar constancias" severity="contrast" outlined />
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
                    <DataTable :value="alumnosCursoData" paginator :rows="5" :rowsPerPageOptions="[5, 10, 20, 50]" tableStyle="min-width: 50rem">
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
                    </DataTable>
                </div>
                <div class="col-12">
                    <h3 class="text-2xl font-bold text-gray-800">Proyectos y Tesinas</h3>
                    <DataTable :value="alumnosCursoData" paginator :rows="5" :rowsPerPageOptions="[5, 10, 20, 50]" tableStyle="min-width: 50rem">
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
                    </DataTable>
                </div>
            </div>
        </div>
    </div>

    <div v-else>
        <div class="card">
            <h3>No se encontró el curso</h3>
        </div>
    </div>
</template>
