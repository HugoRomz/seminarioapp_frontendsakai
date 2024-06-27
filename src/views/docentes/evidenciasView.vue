<script setup>
import { ref, onMounted, inject } from 'vue';
import { FilterMatchMode } from 'primevue/api';

import EvidenciasApi from '../../api/EvidenciasApi';
import AuthAPI from '../../api/AuthAPI.js';

const toast = inject('toast');

import Spinner from '../../components/Spinner.vue';
const loading = ref(false);

const ModuloData = ref();
const filters = ref();

const modalAltaEvidencia = ref(false);

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
            modulo.docente = response.data.nombre + ' ' + response.data.apellido_p + ' ' + response.data.apellido_m;
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
    try {
        const response = await EvidenciasApi.getTipoEvidencias();
        console.log(response.data);
        // customers.value = response.data;
    } catch (error) {
        console.error(error);
    }
};

onMounted(() => {
    loadTipoEvidencias(), loadModulo();
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
                            <h3 className="text-xl font-bold mb-1">Nombre del Módulo</h3>
                            <p class="text-xl font-medium">{{ ModuloData[index].nombre_modulo }}</p>
                        </div>
                    </div>
                    <div class="col-12 lg:col-6 pb-0">
                        <div class="flex flex-column">
                            <h3 className="text-xl font-bold mb-1">Periodo</h3>
                            <p class="text-xl font-medium">{{ ModuloData[index].cursos_periodo.periodo.descripcion }}</p>
                        </div>
                    </div>
                    <div class="col-12 lg:col-6 pb-0">
                        <div class="flex flex-column">
                            <h3 className="text-xl font-bold mb-1">Nombre del Curso</h3>
                            <p class="text-xl font-medium">{{ ModuloData[index].cursos_periodo.curso.nombre_curso }}</p>
                        </div>
                    </div>
                    <div class="col-12 lg:col-6 pb-0">
                        <div class="flex flex-column">
                            <h3 className="text-xl font-bold mb-1">Nombre del Docente</h3>
                            <p class="text-xl font-medium">{{ ModuloData[index].docente }}</p>
                        </div>
                    </div>
                </div>
                <Divider class="my-4" />
                <Toolbar class="my-2" style="border: none">
                    <template #start>
                        <h2 class="text-2xl font-bold m-0">Tabla de Evidencias</h2>
                    </template>

                    <template #end> <Button label="Registrar Nueva Evidencia" icon="pi pi-plus" class="mr-2" severity="success" @click="modalAltaEvidencia = true" /></template>
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
                        <template #paginatorstart> <Button icon="pi pi-refresh" @click="console.log('gola')" /> </template>
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
                                <Button label="Ver Detalle" class="mr-2" severity="info" @click="modalAltaEvidencia = true" />
                                <Button icon="pi pi-pencil" class="mr-2" severity="success" rounded @click="console.log(data)" />
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </template>
        </Card>

        <Dialog v-model:visible="modalAltaEvidencia" modal header="Edit Profile" :style="{ width: '25rem' }">
            <span class="p-text-secondary block mb-5">Update your information.</span>
            <div class="flex align-items-center gap-3 mb-3">
                <label for="username" class="font-semibold w-6rem">Username</label>
                <InputText id="username" class="flex-auto" autocomplete="off" />
            </div>
            <div class="flex align-items-center gap-3 mb-5">
                <label for="email" class="font-semibold w-6rem">Email</label>
                <InputText id="email" class="flex-auto" autocomplete="off" />
            </div>
            <div class="flex justify-content-end gap-2">
                <Button type="button" label="Cancelar" severity="secondary" @click="modalAltaEvidencia = false"></Button>
                <Button type="button" label="Guardar" @click="modalAltaEvidencia = false"></Button>
            </div>
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
