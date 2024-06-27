<script setup>
import { ref, onMounted, inject } from 'vue';
import { FilterMatchMode } from 'primevue/api';

import EvidenciasApi from '../../api/EvidenciasApi';
import AuthAPI from '../../api/AuthAPI.js';

const toast = inject('toast');

import Spinner from '../../components/Spinner.vue';
const loading = ref(false);

const ModuloData = ref();
const tipoEvidencias = ref([]);
const filters = ref();

const modalAltaEvidencia = ref(false);
const evidenciasEdit = ref({});
const isEditMode = ref(false);
const submitted = ref(false);

const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('es-ES', options);
};

const loadModulo = async () => {
    loading.value = true;
    try {
        const response = await AuthAPI.auth();
        const response2 = await EvidenciasApi.getModulos(response.data.usuario_id);
        ModuloData.value = response2.data;
        ModuloData.value.forEach((modulo) => {
            modulo.docente = `${response.data.nombre} ${response.data.apellido_p} ${response.data.apellido_m}`;
        });
    } catch (error) {
        toast.open({
            message: error.response.data.msg,
            type: 'error'
        });
    } finally {
        loading.value = false;
    }
};

const loadTipoEvidencias = async () => {
    if (!tipoEvidencias.value.length) {
        loading.value = true;
        try {
            const response = await EvidenciasApi.getTipoEvidencias();
            tipoEvidencias.value = response.data;
        } catch (error) {
            console.error(error);
        } finally {
            loading.value = false;
        }
    }
};

onMounted(() => {
    loadModulo();
});

const showModalEvidencias = (modulo_id) => {
    loadTipoEvidencias();
    evidenciasEdit.value = { modulo_id };
    modalAltaEvidencia.value = true;
    submitted.value = false;
    isEditMode.value = false;
};

const editEvidencia = (data, nombre_modulo, modulo_id) => {
    loadTipoEvidencias();
    evidenciasEdit.value = {
        ...data,
        nombre_modulo,
        modulo_id,
        tipo_evidencia_id: data.tipo_evidencia.tipo_evidencia_id
    };
    modalAltaEvidencia.value = true;
    isEditMode.value = true;
    submitted.value = false;
};

const saveEvidencia = async () => {
    submitted.value = true;
    if (evidenciasEdit.value.nombre_evidencia && evidenciasEdit.value.fecha_entrega) {
        loading.value = true;
        try {
            let response;
            if (isEditMode.value) {
                response = await EvidenciasApi.updateEvidencia(evidenciasEdit.value);
                toast.open({
                    message: response.data.msg,
                    type: 'success'
                });
            } else {
                response = await EvidenciasApi.createEvidencia(evidenciasEdit.value);
                toast.open({
                    message: response.data.msg,
                    type: 'success'
                });
            }
            modalAltaEvidencia.value = false;
            evidenciasEdit.value = {};
            isEditMode.value = false;
            await loadModulo();
        } catch (error) {
            toast.open({
                message: error.response && error.response.data.msg ? error.response.data.msg : 'Error desconocido',
                type: 'error'
            });
        } finally {
            loading.value = false;
        }
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
    <div v-if="ModuloData">
        <Card v-for="(modulo, index) in ModuloData" :key="index" class="mb-5">
            <template #title>
                <h1 class="text-3xl font-bold mb-0">Evidencias del Módulo</h1>
            </template>
            <template #content>
                <div class="grid">
                    <div class="col-12 lg:col-6 pb-0">
                        <div class="flex flex-column">
                            <h3 class="text-xl font-bold mb-1">Nombre del Módulo</h3>
                            <p class="text-xl font-medium">{{ ModuloData[index].nombre_modulo }}</p>
                        </div>
                    </div>
                    <div class="col-12 lg:col-6 pb-0">
                        <div class="flex flex-column">
                            <h3 class="text-xl font-bold mb-1">Periodo</h3>
                            <p class="text-xl font-medium">{{ ModuloData[index].cursos_periodo.periodo.descripcion }}</p>
                        </div>
                    </div>
                    <div class="col-12 lg:col-6 pb-0">
                        <div class="flex flex-column">
                            <h3 class="text-xl font-bold mb-1">Nombre del Curso</h3>
                            <p class="text-xl font-medium">{{ ModuloData[index].cursos_periodo.curso.nombre_curso }}</p>
                        </div>
                    </div>
                    <div class="col-12 lg:col-6 pb-0">
                        <div class="flex flex-column">
                            <h3 class="text-xl font-bold mb-1">Nombre del Docente</h3>
                            <p class="text-xl font-medium">{{ ModuloData[index].docente }}</p>
                        </div>
                    </div>
                </div>
                <Divider class="my-4" />
                <Toolbar class="my-2" style="border: none">
                    <template #start>
                        <h2 class="text-2xl font-bold m-0">Tabla de Evidencias</h2>
                    </template>

                    <template #end> <Button label="Registrar Nueva Evidencia" icon="pi pi-plus" class="mr-2" severity="success" @click="() => showModalEvidencias(ModuloData[index].modulo_id)" /></template>
                </Toolbar>
                <div class="card">
                    <DataTable
                        :value="ModuloData[index].evidencias"
                        :paginator="true"
                        :rows="10"
                        :filters="filters"
                        stripedRows
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        :rowsPerPageOptions="[5, 10, 25]"
                        currentPageReportTemplate="Mostrando del {first} al {last} de {totalRecords} evidencias"
                        tableStyle="min-width: 50rem"
                    >
                        <template #header>
                            <div class="flex justify-content-between flex-column sm:flex-row">
                                <Button type="button" icon="pi pi-filter-slash" label="Limpiar" outlined @click="clearFilter()" />
                                <IconField iconPosition="left">
                                    <InputIcon class="pi pi-search" />
                                    <InputText class="mt-2 md:mt-0" v-model="filters['global'].value" placeholder="Búsqueda por palabra clave" style="width: 100%" />
                                </IconField>
                            </div>
                        </template>
                        <template #empty> No hay preregistros. </template>
                        <template #loading> Cargando... por favor espera </template>
                        <template #paginatorstart> <Button icon="pi pi-refresh" @click="loadModulo" /> </template>
                        <Column field="evidencia_id" header="ID" style="width: 5%"></Column>
                        <Column field="nombre_evidencia" header="Nombre" style="width: 15%"></Column>
                        <Column field="tipo_evidencia.nombre_tipo_ev" header="Tipo" style="width: 10%"></Column>
                        <Column field="tipo_evidencia.descripcion" header="Descripción" style="width: 40%"></Column>
                        <Column header="Fecha" style="width: 15%">
                            <template #body="slotProps">
                                {{ formatDate(slotProps.data.fecha_entrega) }}
                            </template>
                        </Column>
                        <Column header="OP">
                            <template #body="{ data }">
                                <Button label="Ver Detalle" class="mr-2" severity="info" @click="() => showModalEvidencias(ModuloData[index].modulo_id)" />
                                <Button icon="pi pi-pencil" class="mr-2" severity="success" rounded @click="() => editEvidencia(data, ModuloData[index].nombre_modulo, ModuloData[index].modulo_id)" />
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </template>
        </Card>

        <Dialog class="p-fluid" v-model:visible="modalAltaEvidencia" :header="isEditMode ? 'Editar Evidencias' : 'Registrar Evidencias'" :modal="true" :style="{ width: '25rem' }">
            <div v-if="isEditMode" class="field">
                <label for="evidencia_id">ID Evidencia</label>
                <InputText id="evidencia_id" :disabled="isEditMode" v-model.trim="evidenciasEdit.evidencia_id" />
            </div>
            <div v-if="isEditMode" class="field">
                <label for="nombre_modulo">Módulo</label>
                <InputText id="nombre_modulo" :disabled="isEditMode" v-model.trim="evidenciasEdit.nombre_modulo" />
            </div>
            <div class="field">
                <label for="nombre_evidencia">Nombre de la Evidencia</label>
                <InputText id="nombre_evidencia" v-model.trim="evidenciasEdit.nombre_evidencia" />
                <small class="p-invalid text-red-700" v-if="submitted && !evidenciasEdit.nombre_evidencia"> El nombre de la evidencia es requerido. </small>
            </div>
            <div class="field">
                <label for="nombre_tipo_ev"> Tipo de Evidencia </label>
                <Dropdown
                    filter
                    id="nombre_tipo_ev"
                    v-model.trim="evidenciasEdit.tipo_evidencia_id"
                    :options="tipoEvidencias"
                    optionLabel="nombre_tipo_ev"
                    optionValue="tipo_evidencia_id"
                    placeholder="Selecciona el tipo de evidencia"
                    checkmark
                    :highlightOnSelect="false"
                />
                <small class="p-invalid text-red-700" v-if="submitted && !evidenciasEdit.tipo_evidencia_id"> El tipo de evidencia es requerido. </small>
            </div>
            <div class="field">
                <label for="fecha_entrega">Fecha de Entrega</label>
                <Calendar id="fecha_entrega" v-model.trim="evidenciasEdit.fecha_entrega" showIcon iconDisplay="input" dateFormat="dd/mm/yy" />
                <small class="p-invalid text-red-700" v-if="submitted && !evidenciasEdit.fecha_entrega"> La fecha de entrega es requerida. </small>
            </div>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text="" @click="modalAltaEvidencia = false" />
                <Button label="Guardar" icon="pi pi-check" text="" @click="saveEvidencia" />
            </template>
        </Dialog>
    </div>
    <div v-else>
        <Card>
            <template #title>Evidencias</template>
            <template #content>
                <p>No hay módulos asignados a este docente.</p>
            </template>
        </Card>
    </div>
</template>
