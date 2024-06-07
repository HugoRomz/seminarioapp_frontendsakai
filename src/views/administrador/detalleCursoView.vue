<script setup>
import { ref, inject, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const toast = inject('toast');

import SeminarioApi from '../../api/SeminarioApi.js';
import Spinner from '../../components/Spinner.vue';

const route = useRoute();
const cursoId = ref(route.params.id);
const alumnosdata = ref([]);

const cursoData = ref({});
const editModulo = ref(false);
const moduloData = ref({});

const alumnoModal = ref(false);
const alumnosForm = ref({ usuario_id: [] });

const loading = ref(false);

const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('es-ES', options);
};

const loadCurso = async () => {
    loading.value = true;
    try {
        const response = await SeminarioApi.getCursoById(cursoId.value);
        const modulos = response.data.modulos.map((modulo) => {
            return {
                ...modulo,
                fecha_inicio: formatDate(modulo.fecha_inicio),
                fecha_cierre: formatDate(modulo.fecha_cierre)
            };
        });
        cursoData.value = { ...response.data, modulos };
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
};

const loadAlumnos = async () => {
    loading.value = true;
    try {
        const response = await SeminarioApi.loadAlumnos();
        alumnosdata.value = response.data;
    } catch (error) {
        toast.open({
            message: error.response.data.msg,
            type: 'error'
        });
    } finally {
        loading.value = false;
    }
};
onMounted(loadCurso(), loadAlumnos());
const openEditModulo = (data) => {
    moduloData.value = { ...data };
    editModulo.value = true;
};
const hideDialog = () => {
    moduloData.value = {};
    editModulo.value = false;
};
const EditarModulo = async () => {
    try {
        loading.value = true;
        const response = await SeminarioApi.editModulo(moduloData.value.modulo_id, moduloData.value);
        toast.open({
            message: response.data.msg,
            type: 'success'
        });
        hideDialog();
        loadCurso();
    } catch (error) {
        toast.open({
            message: error.response.data.msg,
            type: 'error'
        });
    } finally {
        loading.value = false;
    }
};

const openModalAlumno = () => {
    alumnoModal.value = true;
};
const asignarAlumnos = async () => {
    try {
        loading.value = true;
        const response = await SeminarioApi.asignarAlumnos(cursoId.value, alumnosForm.value);
        toast.open({
            message: response.data.msg,
            type: 'success'
        });
        alumnoModal.value = false;
        alumnosForm.value = { usuario_id: [] };
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

<!--  {{ cursoData.curso.nombre_curso }}
   {{ cursoData.periodo.descripcion }}
{{ cursoData.curso.carrera.nombre_carrera }
{{ modulo.fecha_inicio }}
{{ modulo.fecha_cierre }}
{{ modulo.usuario.nombre }} {{ modulo.usuario.apellido_p }} {{ modulo.usuario.apellido_m }}
 {{ modulo.nombre_modulo }}
  -->
<template>
    <Spinner v-if="loading" />
    <div v-if="cursoData && Object.keys(cursoData).length !== 0">
        <div class="card">
            <div class="grid">
                <div class="col-12">
                    <div class="w-full mx-auto">
                        <div class="grid">
                            <div class="col-12 md:col-7">
                                <h1 class="text-5xl font-bold text-primary">{{ cursoData.curso.nombre_curso }}</h1>
                                <div class="text-gray-700 font-medium text-lg">
                                    <span>{{ cursoData.curso.carrera.nombre_carrera }}</span>
                                    <span class="mx-2">•</span>
                                    <span class="text-gray-500">{{ cursoData.periodo.descripcion }} </span>
                                </div>
                            </div>
                            <div class="col-12 flex flex-column align-items-center justify-content-end md:col-5 md:gap-2 md:flex-row">
                                <Button @click="openModalAlumno" class="w-full mt-3 md:mt-0" label="Agregar alumnos" severity="success" />
                                <Button class="w-full mt-3 md:mt-0" label="Generar constancias" severity="contrast" outlined />
                                <Button class="w-full mt-3 md:mt-0" label="Generar reportes" severity="contrast" outlined />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-12">
                    <div class="w-full mx-auto">
                        <h2 class="text-3xl font-bold mb-5">Módulos del Curso</h2>
                        <div class="grid p-2">
                            <div v-for="modulo in cursoData.modulos" :key="modulo.modulo_id" class="col-12">
                                <div class="card grid p-2 shadow-2">
                                    <div class="col-12 md:col-6">
                                        <h3 class="text-2xl font-bold mb-2">{{ modulo.nombre_modulo }}</h3>
                                        <div class="text-gray-700 font-medium text-lg">
                                            <span>{{ modulo.fecha_inicio }} ― {{ modulo.fecha_cierre }}</span>
                                            <span class="mx-2">•</span>
                                            <span class="text-gray-500">{{ modulo.usuario.nombre }} {{ modulo.usuario.apellido_p }} {{ modulo.usuario.apellido_m }}</span>
                                        </div>
                                    </div>
                                    <div class="col-12 flex flex-column align-items-center justify-content-end md:col-6 md:gap-2 md:flex-row">
                                        <Button @click="openEditModulo(modulo)" class="w-full md:w-auto mt-3 md:mt-0" label="Editar Módulo" severity="success" />
                                        <Button class="w-full md:w-auto mt-3 md:mt-0" label="Generar Calificaciones" severity="info" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <Dialog v-model:visible="editModulo" header="Editar Modulo" :modal="true" class="p-fluid">
        <InputText id="modulo_id" v-model.trim="moduloData.modulo_id" hidden />

        <div class="field">
            <label for="nombre_modulo">Nombre del modulo</label>
            <InputText id="nombre_modulo" v-model.trim="moduloData.nombre_modulo" required="true" disabled />
        </div>
        <div class="field">
            <label for="fecha_inicio">Fecha de Inicio</label>
            <Calendar id="fecha_inicio" v-model.trim="moduloData.fecha_inicio" required="true" />
        </div>
        <div class="field">
            <label for="fecha_cierre">Fecha de Cierre</label>
            <Calendar id="fecha_cierre" v-model.trim="moduloData.fecha_cierre" required="true" />
        </div>
        <!-- <div class="field">
            <label for="docente">Docente</label>
            <InputText id="docente" v-model.trim="moduloData.usuario.nombre" required="true" />
        </div> -->

        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" text="" @click="hideDialog" />
            <Button label="Guardar" icon="pi pi-check" text="" @click="EditarModulo" />
        </template>
    </Dialog>

    <Dialog v-model:visible="alumnoModal" header="Asignar Alumnos" :modal="true" class="p-fluid" style="min-width: 25%">
        <div class="field">
            <label for="materia">Selecciona los alumnos</label>
            <MultiSelect v-model="alumnosForm.usuario_id" :options="alumnosdata" optionLabel="usuario_id" placeholder="Selecciona los alumnos" :filter="true">
                <template #value="slotProps">
                    <div class="inline-flex align-items-center py-1 px-2 bg-blue-900 text-white border-round mr-2" v-for="option of slotProps.value" :key="option.id">
                        <div>{{ option.usuario.nombre }}</div>
                    </div>
                    <template v-if="!slotProps.value || slotProps.value.length === 0">
                        <div class="p-1">Selecciona los alumnos</div>
                    </template>
                </template>
                <template #option="slotProps">
                    <div>{{ slotProps.option.usuario.nombre + ' ' + slotProps.option.usuario.apellido_p + ' ' + slotProps.option.usuario.apellido_m }}</div>
                </template>
            </MultiSelect>
        </div>

        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" text="" @click="alumnoModal = false" />
            <Button label="Guardar" icon="pi pi-check" text="" @click="asignarAlumnos" />
        </template>
    </Dialog>
</template>
