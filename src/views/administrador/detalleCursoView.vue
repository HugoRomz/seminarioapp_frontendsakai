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
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
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
    console.log(moduloData.value);
};

const openModalAlumno = () => {
    alumnoModal.value = true;
};
</script>

<template>
    <Spinner v-if="loading" />
    <div v-if="cursoData && Object.keys(cursoData).length !== 0">
        <div class="card">
            <h1>
                <strong> {{ cursoData.curso.nombre_curso }}</strong> <i class="text-lg">{{ cursoData.periodo.descripcion }}</i>
            </h1>
            <h5>{{ cursoData.curso.carrera.nombre_carrera }}</h5>
            <Toolbar class="mb-4">
                <template v-slot:start>
                    <div class="my-2"><Button label="Agregar Alumnos" icon="pi pi-users" class="mr-2" severity="primary" @click="openModalAlumno" /></div>
                </template>

                <template v-slot:end>
                    <div class="my-2"><Button label="Generador de constancias" icon="pi pi-print" class="mr-2" severity="primary" @click="console.log('Calificaciones')" /></div>
                    <div class="my-2"><Button label="Generar Reportes" icon="pi pi-file-export" class="mr-2" severity="primary" @click="console.log('Reportes')" /></div>
                </template>
            </Toolbar>
            <div class="grid mt-2">
                <div v-for="modulo in cursoData.modulos" :key="modulo.modulo_id" class="col-12 md:col-6">
                    <Card class="border-solid">
                        <template #title>
                            <h3 class="text-center">{{ modulo.nombre_modulo }}</h3>
                        </template>
                        <template #content>
                            <p>Inicio: {{ modulo.fecha_inicio }}</p>
                            <p>Cierre: {{ modulo.fecha_cierre }}</p>
                            <p>Docente: {{ modulo.usuario.nombre }} {{ modulo.usuario.apellido_p }} {{ modulo.usuario.apellido_m }}</p>
                        </template>
                        <template #footer>
                            <div class="flex flex-column md:flex-row gap-3 mt-1">
                                <Button label="Generar Calificaciones" class="w-full" severity="success" raised />
                                <Button label="Editar" class="w-full" severity="info" raised @click="openEditModulo(modulo)" />
                            </div>
                        </template>
                    </Card>
                </div>
            </div>
        </div>
    </div>

    <Dialog v-model:visible="editModulo" header="Editar Modulo" :modal="true" class="p-fluid">
        <div class="field">
            <label for="modulo_id">ID Modulo</label>
            <InputText id="modulo_id" v-model.trim="moduloData.modulo_id" />
        </div>
        <div class="field">
            <label for="nombre_modulo">Nombre del modulo</label>
            <InputText id="nombre_modulo" v-model.trim="moduloData.nombre_modulo" required="true" />
        </div>
        <div class="field">
            <label for="fecha_inicio">Fecha de Inicio</label>
            <Calendar id="fecha_inicio" v-model.trim="moduloData.fecha_inicio" required="true" />
        </div>
        <div class="field">
            <label for="fecha_cierre">Fecha de Cierre</label>
            <Calendar id="fecha_cierre" v-model.trim="moduloData.fecha_cierre" required="true" />
        </div>
        <div class="field">
            <label for="docente">Docente</label>
            <InputText id="docente" v-model.trim="moduloData.usuario.nombre" required="true" />
        </div>

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
            <Button label="Cancelar" icon="pi pi-times" text="" @click="hideDialog" />
            <Button label="Guardar" icon="pi pi-check" text="" @click="EditarModulo" />
        </template>
    </Dialog>
</template>
