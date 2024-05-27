<script setup>
import { ref, inject, onMounted } from 'vue';

const toast = inject('toast');

import DocenteApi from '../../api/DocentesApi.js';
import AuthAPI from '../../api/AuthAPI.js';
import Spinner from '../../components/Spinner.vue';

const loading = ref(false);
const ModuloData = ref({});

const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

const loadModulo = async () => {
    loading.value = true;
    try {
        const response = await AuthAPI.auth();
        const response2 = await DocenteApi.getModulos(response.data.usuario_id);
        ModuloData.value = response2.data;
    } catch (error) {
        toast.open({
            message: error.response.data.msg,
            type: 'error'
        });
    } finally {
        loading.value = false;
    }
};

onMounted(loadModulo);
</script>

<template>
    <Spinner v-if="loading" />
    <div v-if="ModuloData && Object.keys(ModuloData).length !== 0">
        <div class="card" v-for="(modulo, index) in ModuloData" :key="index">
            <h1>
                <strong> {{ modulo.cursos_periodo.curso.nombre_curso }}</strong> <i class="text-lg">{{ modulo.cursos_periodo.periodo.descripcion }}</i>
            </h1>
            <h4>{{ modulo.cursos_periodo.curso.carrera.nombre_carrera }}</h4>
            <h5>
                Módulo: <i class="text-yellow-600"> {{ modulo.nombre_modulo }} </i>
            </h5>
            <h5>
                Fecha de inicio: <i class="text-yellow-600"> {{ formatDate(modulo.fecha_inicio) }} </i> &nbsp; Fecha de fin: <i class="text-yellow-600"> {{ formatDate(modulo.fecha_cierre) }} </i>
            </h5>
            <card>
                <template #title>Lista de Alumnos</template>
                <template #content>
                    <DataTable :value="ModuloData" showGridlines>
                        <Column field="modulo_id" header="Id Alumno"></Column>
                        <Column field="modulo_id" header="Nombre Completo"></Column>
                        <Column field="modulo_id" header="Calificacion"></Column>
                    </DataTable>
                </template>
            </card>
        </div>
    </div>
</template>
