<script setup>
import { ref, inject, onMounted } from 'vue';

const toast = inject('toast');

import AlumnoApi from '../../api/AlumnosApi.js';
import AuthAPI from '../../api/AuthAPI.js';
import Spinner from '../../components/Spinner.vue';

const loading = ref(false);
const ModulosData = ref({});
const alumnoInfo = ref({});

const loadModulo = async () => {
    loading.value = true;
    try {
        const response = await AuthAPI.auth();
        const response2 = await AlumnoApi.getModulos(response.data.usuario_id);
        alumnoInfo.value = response.data;
        ModulosData.value = response2.data;
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
    <div v-if="ModulosData && Object.keys(ModulosData).length !== 0">
        <card>
            <template #title>
                <h1 class="text-4xl font-bold">Calificaciones de Módulos</h1>
            </template>
            <template #content>
                <div class="flex flex-column">
                    <div class="flex align-items-center mb-5">
                        <Avatar icon="pi pi-user" class="mr-4" size="xlarge" shape="circle" />
                        <div>
                            <p class="text-gray-500 m-0">{{ alumnoInfo.nombre }} {{ alumnoInfo.apellido_p }} {{ alumnoInfo.apellido_m }}</p>
                            <p class="text-gray-500 m-0">
                                ID de estudiante:
                                <template v-if="alumnoInfo.alumno && alumnoInfo.alumno.matricula">
                                    <span class="font-bold">{{ alumnoInfo.alumno.matricula }}</span>
                                </template>
                                <template v-else-if="alumnoInfo.egresado && alumnoInfo.egresado.cod_egresado">
                                    <span class="font-bold">{{ alumnoInfo.egresado.cod_egresado }}</span>
                                </template>
                            </p>
                        </div>
                    </div>
                    <div class="grid">
                        <div v-for="(moduloInd, index) in ModulosData" :key="index" class="col-12 md:col-4">
                            <card class="min-h-full">
                                <template #title> {{ moduloInd.modulo.nombre_modulo }}</template>
                                <template #content>
                                    <div class="flex flex-column">
                                        <p class="font-medium">• {{ moduloInd.modulo.usuario.nombre }} {{ moduloInd.modulo.usuario.apellido_p }} {{ moduloInd.modulo.usuario.apellido_m }}</p>
                                        <div class="flex align-items-center justify-content-between">
                                            <p class="m-0 font-bold">Calificación General:</p>
                                            <p class="m-0 font-bold text-3xl">{{ moduloInd.calificacion_final }}</p>
                                        </div>
                                        <Divider />
                                        <div class="grid">
                                            <div class="col-12 lg:col-6">
                                                <div class="flex flex-row align-items-center justify-content-between md:flex-row">
                                                    <p class="m-0 font-medium">Módulo:</p>
                                                    <p class="m-0 font-bold text-xl">{{ moduloInd.calificacion }}</p>
                                                </div>
                                            </div>
                                            <div class="col-12 lg:col-6">
                                                <div class="flex flex-row align-items-center justify-content-between md:flex-row">
                                                    <p class="m-0 font-medium">Proyecto Final:</p>
                                                    <p class="m-0 font-bold text-xl">{{ moduloInd.calificacion_proyecto }}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </card>
                        </div>
                    </div>
                </div>
            </template>
        </card>
    </div>
    <div v-else>
        <card>
            <template #title>Módulos</template>
            <template #content>
                <p>No hay módulos disponibles para este usuario</p>
            </template>
        </card>
    </div>
</template>
