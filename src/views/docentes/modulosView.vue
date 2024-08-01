<script setup>
import { ref, inject, onMounted } from 'vue';
import { FilterMatchMode } from 'primevue/api';

const toast = inject('toast');

import DocenteApi from '../../api/DocentesApi.js';
import AuthAPI from '../../api/AuthAPI.js';
import Spinner from '../../components/Spinner.vue';

const loading = ref(false);
const ModuloData = ref({});
const filters = ref();

const editingRows = ref();

const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('es-ES', options);
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

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};

initFilters();
const clearFilter = () => {
    initFilters();
};

const onRowEditSave = async (event) => {
    let { newData } = event;

    try {
        loading.value = true;
        const userId = newData.calificacion_id;

        const response = await DocenteApi.updateCalificacion(userId, newData);
        toast.open({
            message: response.data.msg,
            type: 'success'
        });
        loadModulo();
    } catch (error) {
        toast.open({
            message: error.response.data.msg,
            type: 'error'
        });
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <Spinner v-if="loading" />
    <div v-if="ModuloData && Object.keys(ModuloData).length !== 0">
        <div class="card grid" v-for="(modulo, index) in ModuloData" :key="index">
            <div class="col-12 md:col-4">
                <h2 class="font-bold">Información del Módulo</h2>
                <div class="grid">
                    <div class="col-6">
                        <p class="text-xl text-gray-400 font-medium m-0">Nombre</p>
                        <p class="text-xl font-bold m-0">{{ modulo.nombre_modulo }}</p>
                    </div>
                    <div class="col-6">
                        <p class="text-xl text-gray-400 font-medium m-0">Periodo</p>
                        <p class="text-xl font-bold m-0">{{ modulo.cursos_periodo.periodo.descripcion }}</p>
                    </div>
                    <div class="col-6">
                        <p class="text-xl text-gray-400 font-medium m-0">Curso</p>
                        <p class="text-xl font-bold m-0">{{ modulo.cursos_periodo.curso.nombre_curso }}</p>
                    </div>
                    <div class="col-6">
                        <p class="text-xl text-gray-400 font-medium m-0">Fecha Inicio</p>
                        <p class="text-xl font-bold m-0">{{ formatDate(modulo.fecha_inicio) }}</p>
                    </div>
                    <div class="col-6">
                        <p class="text-xl text-gray-400 font-medium m-0">Fecha Cierre</p>
                        <p class="text-xl font-bold m-0">{{ formatDate(modulo.fecha_cierre) }}</p>
                    </div>
                </div>
            </div>
            <div class="col-12 md:col-8">
                <h4 class="font-bold">Estudiantes Módulo</h4>
                <card>
                    <template #content>
                        <DataTable
                            v-model:filters="filters"
                            v-model:editingRows="editingRows"
                            paginator
                            sortField="calificacion_id"
                            :sortOrder="-1"
                            :rows="7"
                            :rowsPerPageOptions="[7, 14, 21]"
                            :value="modulo.calificaciones"
                            editMode="row"
                            dataKey="calificacion_id"
                            @row-edit-save="onRowEditSave"
                            scrollable
                            scrollHeight="400px"
                            :pt="{
                                column: {
                                    bodycell: ({ state }) => ({
                                        style: state['d_editing'] && 'padding-top: 0.6rem; padding-bottom: 0.6rem'
                                    })
                                }
                            }"
                        >
                            <template #header>
                                <div class="flex justify-content-between">
                                    <Button type="button" icon="pi pi-filter-slash" label="Limpiar" outlined @click="clearFilter()" />
                                    <IconField iconPosition="left">
                                        <InputIcon>
                                            <i class="pi pi-search" />
                                        </InputIcon>
                                        <InputText v-model="filters['global'].value" placeholder="Búsqueda por palabra clave" />
                                    </IconField>
                                </div>
                            </template>
                            <Column sortable field="calificacion_id" hidden> </Column>
                            <Column sortable :field="(rowData) => rowData.usuario.nombre + ' ' + rowData.usuario.apellido_p + ' ' + rowData.usuario.apellido_m" header="Nombre Completo" style="min-width: 300px"></Column>
                            <Column sortable field="calificacion" header="Calificación" :editable="true" style="min-width: 100px">
                                <template #editor="{ data, field }">
                                    <InputNumber v-model="data[field]" :min="0" :max="8" mode="decimal" showButtons autofocus />
                                </template>
                            </Column>
                            <Column sortable field="calificacion_proyecto" header="Calificación Proyecto" :editable="true" style="min-width: 100px">
                                <template #editor="{ data, field }">
                                    <InputNumber v-model="data[field]" :min="0" :max="2" mode="decimal" showButtons autofocus />
                                </template>
                            </Column>
                            <Column sortable field="calificacion_final" header="Promedio" style="min-width: 100px"> </Column>

                            <Column :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center"></Column>
                        </DataTable>
                    </template>
                </card>
            </div>
        </div>
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
