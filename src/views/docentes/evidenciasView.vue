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

const modalAltaActividad = ref(false);
const actividadesEdit = ref({});
const isEditMode = ref(false);
const submitted = ref(false);

const modalEvidenciasAct = ref(false);
const EvidenciasData = ref([]);
const evidenciasEdit = ref({});

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
            toast.open({
                message: error.response.data.msg,
                type: 'error'
            });
        } finally {
            loading.value = false;
        }
    }
};

const loadEvidenciasAct = async (actividad_id) => {
    loading.value = true;
    try {
        const response = await EvidenciasApi.getEvidencias(actividad_id);
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

onMounted(() => {
    loadModulo();
});

const showModalActividades = (modulo_id) => {
    loadTipoEvidencias();
    actividadesEdit.value = { modulo_id };
    modalAltaActividad.value = true;
    submitted.value = false;
    isEditMode.value = false;
};

const editActividad = (data, nombre_modulo, modulo_id) => {
    loadTipoEvidencias();
    actividadesEdit.value = {
        ...data,
        nombre_modulo,
        modulo_id,
        tipo_evidencia_id: data.tipo_evidencia.tipo_evidencia_id
    };
    modalAltaActividad.value = true;
    isEditMode.value = true;
    submitted.value = false;
};

const saveActividad = async () => {
    submitted.value = true;

    if (actividadesEdit.value.nombre_actividad && actividadesEdit.value.descripcion && actividadesEdit.value.tipo_evidencia_id && actividadesEdit.value.fecha_entrega) {
        loading.value = true;
        try {
            let response;
            if (isEditMode.value) {
                response = await EvidenciasApi.updateActividad(actividadesEdit.value);

                toast.open({
                    message: response.data.msg,
                    type: 'success'
                });
            } else {
                response = await EvidenciasApi.createActividad(actividadesEdit.value);
                toast.open({
                    message: response.data.msg,
                    type: 'success'
                });
            }
            modalAltaActividad.value = false;
            actividadesEdit.value = {};
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

const openFilePreview = (url) => {
    if (url) {
        window.open(url, '_blank', 'width=1124,height=688');
    }
};

const showModalEvidenciasAct = async (actividad_id) => {
    await loadEvidenciasAct(actividad_id);
    modalEvidenciasAct.value = true;
    evidenciasEdit.value = {};
};

const editEvidencia = (data) => {
    evidenciasEdit.value = { ...data };
    modalEvidenciasAct.value = true;
    isEditMode.value = true;
    submitted.value = false;
};

const subirArchivos = async (event, documento, index) => {
    const formData = new FormData();
    formData.append('documento', event.files[0]);
    formData.append('evidencias_id', evidenciasEdit.value.evidencias_id);
    formData.append('actividad_id', evidenciasEdit.value.actividad_id);
    formData.append('descripcion', evidenciasEdit.value.descripcion);

    loading.value = true;
    try {
        const response = await EvidenciasApi.uploadFile(formData);
        toast.open({
            message: response.data.msg,
            type: 'success'
        });
        await loadEvidenciasAct(evidenciasEdit.value.actividad_id);
        evidenciasEdit.value = {};
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
                        <h2 class="text-2xl font-bold m-0">Tabla de Actividades</h2>
                    </template>

                    <template #end> <Button label="Registrar Nueva Actividad" icon="pi pi-plus" class="mr-2" severity="success" @click="() => showModalActividades(ModuloData[index].modulo_id)" /></template>
                </Toolbar>
                <div class="card">
                    <DataTable
                        :value="ModuloData[index].actividades"
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
                        <template #empty> No hay registros. </template>
                        <template #loading> Cargando... por favor espera </template>
                        <template #paginatorstart> <Button icon="pi pi-refresh" @click="loadModulo" /> </template>
                        <Column field="actividad_id" header="ID" style="width: 5%"></Column>
                        <Column field="nombre_actividad" header="Nombre de la actividad" style="width: 15%"></Column>
                        <Column field="descripcion" header="Descripción" style="width: 35%"></Column>
                        <Column field="tipo_evidencia.nombre_tipo_ev" header="Tipo" style="width: 10%"></Column>
                        <Column header="Fecha de Entrega" style="width: 15%">
                            <template #body="slotProps">
                                {{ formatDate(slotProps.data.fecha_entrega) }}
                            </template>
                        </Column>
                        <Column header="">
                            <template #body="{ data }">
                                <div class="text-center">
                                    <Button label="Ver Evidencias" class="mr-2" severity="info" @click="showModalEvidenciasAct(data.actividad_id)" />
                                    <Button icon="pi pi-pencil" class="mr-2" severity="success" rounded @click="() => editActividad(data, ModuloData[index].nombre_modulo, ModuloData[index].modulo_id)" />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </template>
        </Card>

        <Dialog class="p-fluid" v-model:visible="modalAltaActividad" :header="isEditMode ? 'Editar Actividad' : 'Registrar Actividad'" :modal="true" :style="{ width: '25rem' }">
            <div v-if="isEditMode" class="field">
                <label for="actividad_id">ID Actividad</label>
                <InputText id="actividad_id" :disabled="isEditMode" v-model.trim="actividadesEdit.actividad_id" />
            </div>

            <div v-if="isEditMode" class="field">
                <label for="nombre_modulo">Módulo</label>
                <InputText id="nombre_modulo" :disabled="isEditMode" v-model.trim="actividadesEdit.nombre_modulo" />
            </div>

            <div class="field">
                <label for="nombre_actividad">Nombre de la Actividad</label>
                <InputText id="nombre_actividad" v-model.trim="actividadesEdit.nombre_actividad" />
                <small class="p-invalid text-red-700" v-if="submitted && !actividadesEdit.nombre_actividad"> El nombre de la actividad es requerido. </small>
            </div>

            <div class="field">
                <label for="descripcion">Descripción</label>
                <Textarea id="descripcion" v-model.trim="actividadesEdit.descripcion" rows="5" cols="30" />
                <small class="p-invalid text-red-700" v-if="submitted && !actividadesEdit.descripcion"> La descripcion de la actividad es requerido. </small>
            </div>

            <div class="field">
                <label for="nombre_tipo_ev"> Tipo </label>
                <Dropdown
                    filter
                    id="nombre_tipo_ev"
                    v-model.trim="actividadesEdit.tipo_evidencia_id"
                    :options="tipoEvidencias"
                    optionLabel="nombre_tipo_ev"
                    optionValue="tipo_evidencia_id"
                    placeholder="Selecciona el tipo de evidencia"
                    checkmark
                    :highlightOnSelect="false"
                />
                <small class="p-invalid text-red-700" v-if="submitted && !actividadesEdit.tipo_evidencia_id"> El tipo de evidencia es requerido. </small>
            </div>

            <div class="field">
                <label for="fecha_entrega">Fecha de Entrega</label>
                <Calendar id="fecha_entrega" v-model.trim="actividadesEdit.fecha_entrega" showIcon iconDisplay="input" dateFormat="dd/mm/yy" />
                <small class="p-invalid text-red-700" v-if="submitted && !actividadesEdit.fecha_entrega"> La fecha de entrega es requerida. </small>
            </div>

            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text="" @click="modalAltaActividad = false" />
                <Button label="Guardar" icon="pi pi-check" text="" @click="saveActividad" />
            </template>
        </Dialog>

        <Dialog class="p-fluid w-11 md:w-8" v-model:visible="modalEvidenciasAct" header="Evidencias de la Actividad" modal position="top">
            <Fieldset class="mb-3" legend="Agregar una nueva Evidencia" :toggleable="true">
                <Card class="p-fluid">
                    <template #content>
                        <div class="field">
                            <label for="">Descripción</label>
                            <Textarea id="descripcion" v-model.trim="evidenciasEdit.descripcion" rows="5" cols="30" />
                            <small class="p-invalid text-red-700" v-if="submitted && !evidenciasEdit.descripcion"> La descripcion de la evidencia es requerido. </small>
                        </div>
                        <div class="field">
                            <label for=""></label>
                            <FileUpload
                                name="documento"
                                @uploader="subirArchivos($event, documento, index)"
                                :multiple="false"
                                :maxFileSize="1000000"
                                :fileLimit="1"
                                :invalidFileSizeMessage="'El tamaño del archivo debe ser menor a 1 MB'"
                                customUpload
                                :disabled="!!evidenciasEdit.url_evidencia"
                            >
                                <template #empty>
                                    <div class="flex align-items-center justify-content-center flex-column">
                                        <i class="pi pi-cloud-upload border-2 border-circle p-5 text-3xl text-400 border-400" />
                                        <p class="mt-4 mb-0 text-center">{{ evidenciasEdit.url_evidencia ? 'Archivo subido' : 'Arrastra y suelta un archivo aquí o haz clic para seleccionar un archivo.' }}</p>
                                        <Button v-if="evidenciasEdit.url_evidencia" @click="openFilePreview(evidenciasEdit.url_evidencia)" class="w-5 mt-2" label="Ver archivo" />
                                    </div>
                                </template>
                            </FileUpload>
                        </div>
                    </template>
                    <template #footer>
                        <div class="flex gap-3 mt-1">
                            <Button label="Limpiar" severity="secondary" outlined class="w-full" @click="evidenciasEdit = {}" />
                            <Button label="Guardar" class="w-full" @click="console.log('hola')" />
                        </div>
                    </template>
                </Card>
            </Fieldset>
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
                    <template #header>
                        <div class="flex justify-content-between">
                            <Button type="button" icon="pi pi-filter-slash" label="Limpiar" outlined @click="clearFilter()" />
                            <IconField iconPosition="left">
                                <InputIcon class="pi pi-search" />
                                <InputText class="mt-2 md:mt-0" v-model="filters['global'].value" placeholder="Búsqueda por palabra clave" />
                            </IconField>
                        </div>
                    </template>
                    <template #empty> No hay registros. </template>
                    <template #loading> Cargando... por favor espera </template>
                    <template #paginatorstart> <Button icon="pi pi-refresh" @click="loadEvidenciasAct" /> </template>
                    <Column field="evidencias_id" header="ID Evidencia" style="width: 5%"></Column>
                    <Column field="actividade.nombre_actividad" header="Nombre de la Actividad" style="width: 15%"></Column>
                    <Column field="descripcion" header="Descripción" style="width: 35%"></Column>
                    <Column header="Visualizar" style="width: 10%">
                        <template #body="{ data }">
                            <a @click="openFilePreview(data.url_evidencia)" v-if="data.url_evidencia">
                                <Button icon="pi pi-search" label="Ver Evidencia" />
                            </a>
                            <Button icon="pi pi-search" :disabled="true" v-else />
                        </template>
                    </Column>
                    <Column header="">
                        <template #body="{ data }">
                            <div class="text-center">
                                <Button icon="pi pi-pencil" class="mr-2" severity="success" rounded @click="editEvidencia(data)" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
            <template #footer>
                <Button label="Cerrar" icon="pi pi-times" @click="modalEvidenciasAct = false" />
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
