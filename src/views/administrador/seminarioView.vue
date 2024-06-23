<script setup>
import { ref, onMounted, inject } from 'vue';
import { FilterMatchMode } from 'primevue/api';
const toast = inject('toast');

import { useRouter } from 'vue-router';
const router = useRouter();

import SeminarioApi from '../../api/SeminarioApi.js';

import Spinner from '../../components/Spinner.vue';

const filters = ref();
const loadingSpinner = ref(false);
const cursosData = ref(null);
const periodos = ref([]);
const cursos = ref([]);
const rechazarCurso = ref(false);
const verMotivo = ref(false);
const altaCursoModal = ref(false);
const cursosDataAlta = ref({});
const dataCursoModal = ref({});
const periodoModal = ref(false);
const submitted = ref(false);
const aceptarCurso = ref(false);

const dataModulos = ref([]);
const formDataModulos = ref([]);
const dataDocentes = ref([]);

const periodoForm = ref({});

const loadSeminarios = async () => {
    loadingSpinner.value = true;
    try {
        const response = await SeminarioApi.findSeminarioActivo();
        cursosData.value = response.data;
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
    } finally {
        loadingSpinner.value = false;
    }
};

const loadPeriodos = async () => {
    loadingSpinner.value = true;
    try {
        const response = await SeminarioApi.loadPeriodos();
        periodos.value = response.data;
    } catch (error) {
        console.error('Error al obtener los periodos:', error);
    } finally {
        loadingSpinner.value = false;
    }
};

const loadCursos = async () => {
    if (!cursos.value.length) {
        loadingSpinner.value = true;
        try {
            const response = await SeminarioApi.loadCursos();
            cursos.value = response.data;
        } catch (error) {
            console.error('Error al obtener los cursos:', error);
        } finally {
            loadingSpinner.value = false;
        }
    }
};

onMounted(loadSeminarios);

const rechazarCursoModal = (dataCurso) => {
    dataCursoModal.value = dataCurso;
    rechazarCurso.value = true;
};

const rechazarCursoMotivo = async (dataCurso) => {
    loadingSpinner.value = true;
    try {
        const response = await SeminarioApi.rechazarCurso(dataCurso);
        toast.open({
            message: response.data.msg,
            type: 'success'
        });
        loadSeminarios();
    } catch (error) {
        console.error('Error al rechazar el curso:', error);
    } finally {
        loadingSpinner.value = false;
        rechazarCurso.value = false;
        dataCursoModal.value = {};
    }
};

const verMotivoModal = (data) => {
    verMotivo.value = true;
    dataCursoModal.value = data;
};
const openModalCurso = () => {
    cursosDataAlta.value = {};
    altaCursoModal.value = true;
    submitted.value = false;
};
const openModalPeriodo = () => {
    periodoForm.value = {};
    periodoModal.value = true;
};

const openModalAceptarCurso = async (data) => {
    loadingSpinner.value = true;
    aceptarCurso.value = true;
    try {
        const response = await SeminarioApi.getMateriasCurso(data.curso_id);
        if (dataDocentes.value.length === 0) {
            const responseDocentes = await SeminarioApi.getDocentes();
            dataDocentes.value = responseDocentes.data;
        }
        dataModulos.value = response.data;
        formDataModulos.value = dataModulos.value.map((modulo) => ({
            detalle_curso_id: modulo.det_curso_id,
            materia: modulo.materia.nombre_materia,
            fecha_inicio: '',
            fecha_cierre: '',
            docente: '',
            curso_periodo_id: data.curso_periodo_id
        }));
    } catch (error) {
        console.error('Error al obtener los módulos:', error);
    } finally {
        loadingSpinner.value = false;
    }
};

const savePeriodo = async () => {
    loadingSpinner.value = true;
    try {
        const response = await SeminarioApi.createPeriodo(periodoForm.value);
        toast.open({
            message: response.data.msg,
            type: 'success'
        });
        periodoModal.value = false;
        periodoForm.value = {};
    } catch (error) {
        console.error('Error al guardar el periodo:', error);
    } finally {
        loadingSpinner.value = false;
    }
};
const validateSaveCurso = () => {
    // Verificar si hay campos vacíos en los formDataModulos
    let camposVacios = false;
    formDataModulos.value.forEach((modulo) => {
        if (!modulo.fecha_inicio || !modulo.fecha_cierre || !modulo.docente) {
            camposVacios = true;
        }
    });

    if (camposVacios) {
        toast.open({
            message: 'Por favor, llena todos los campos.',
            type: 'error'
        });
    } else {
        saveAceptarCurso();
    }
};

const saveAceptarCurso = async () => {
    loadingSpinner.value = true;
    try {
        const response = await SeminarioApi.aceptarCurso(formDataModulos.value);
        toast.open({
            message: response.data.msg,
            type: 'success'
        });
        dataModulos.value = [];
        formDataModulos.value = [];
        aceptarCurso.value = false;
        loadSeminarios();
    } catch (error) {
        console.error('Error al aceptar el curso:', error);
    } finally {
        loadingSpinner.value = false;
    }
};

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};

const altaCursos = async () => {
    submitted.value = true;
    if (cursosDataAlta.value.periodos && cursosDataAlta.value.cursos) {
        loadingSpinner.value = true;
        try {
            const response = await SeminarioApi.altaCursos(cursosDataAlta.value);
            toast.open({
                message: response.data.msg,
                type: 'success'
            });
            altaCursoModal.value = false;
            cursosDataAlta.value = {};
            loadSeminarios();
        } catch (error) {
            const errorMessage = error.response?.data?.msg || 'Error al dar de alta los cursos.';
            toast.open({
                message: errorMessage,
                type: 'error'
            });
        } finally {
            loadingSpinner.value = false;
        }
    }
};

initFilters();
const clearFilter = () => {
    initFilters();
};
</script>
<template>
    <Spinner v-if="loadingSpinner" />
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2"><Button label="Periodo" icon="pi pi-calendar-times" iconPos="right" class="mr-2" severity="primary" @click="openModalPeriodo" /></div>
                        <div class="my-2"><Button label="Alta Curso" icon="pi pi-plus" class="mr-2" severity="success" @click="openModalCurso" /></div>
                    </template>
                    <template v-slot:center> </template>

                    <template v-slot:end>
                        <div class="my-2"><Button label="Crear Catalogo Curso" icon="pi pi-plus" class="mr-2" severity="warning" @click="$router.push('createSeminarios')" /></div>
                        <Button label="Exportar" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
                    </template>
                </Toolbar>

                <DataTable
                    ref="dt"
                    :value="cursosData"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
                    :sortField="'periodo.descripcion'"
                    :sortOrder="1"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Mostrando del {first} al {last} de {totalRecords} cursos"
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
                        <Button icon="pi pi-refresh" @click="loadSeminarios" />
                    </template>
                    <Column field="curso_periodo_id" header="ID" :sortable="true"></Column>
                    <Column field="curso.nombre_curso" header="Nombre del Curso" :sortable="true"></Column>
                    <Column field="periodo.descripcion" header="Periodo" :sortable="true"></Column>
                    <Column field="curso.carrera.nombre_carrera" header="Carrera" :sortable="true"></Column>
                    <Column field="creditos" header="Preregistros" :sortable="true">
                        <template #body="{ data }">
                            <Badge :value="data.preregistrosCount" size="large" severity="secondary"></Badge>
                        </template>
                    </Column>
                    <Column field="aspirantes" header="Aspirantes" :sortable="true">
                        <template #body="{ data }">
                            <Badge :value="data.usuariosCount" size="large" severity="secondary"></Badge>
                        </template>
                    </Column>
                    <Column field="status" header="Status" :sortable="true">
                        <template #body="{ data }">
                            <Tag v-if="data.status == 'Pendiente'" class="mr-2" severity="info" value="Pendiente"></Tag>
                            <Tag v-if="data.status == 'Aceptado'" class="mr-2" severity="success" value="Activo"></Tag>
                            <Tag v-if="data.status == 'Cancelado'" class="mr-2" severity="warning" value="Cancelado"></Tag>
                            <Tag v-if="data.status == 'Finalizado'" class="mr-2" severity="danger" value="Finalizado"></Tag>
                        </template>
                    </Column>
                    <Column headerStyle="min-width:10rem;" header="Acciones">
                        <template #body="{ data }">
                            <div class="flex flex-row justify-content-center">
                                <Button v-if="data.status == 'Pendiente'" label="Aceptar" class="mr-2" rounded severity="success" @click="openModalAceptarCurso(data)" />
                                <Button v-if="data.status == 'Pendiente'" label="Rechazar" class="mr-2" rounded severity="danger" @click="rechazarCursoModal(data)" />
                                <Button v-if="data.status == 'Aceptado'" label="Ver detalle" class="mr-2" rounded severity="info" @click="router.push({ name: 'detalleCurso', params: { id: data.curso_periodo_id } })" />
                                <Button v-if="data.status == 'Cancelado'" label="Ver motivo" class="mr-2" rounded severity="warning" @click="verMotivoModal(data)" />
                                <Button v-if="data.status == 'Finalizado'" label="Ver reporte" class="mr-2" rounded severity="help" @click="console.log('Ver reporte Seminario')" />
                            </div>
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="rechazarCurso" :style="{ width: '450px' }" header="Rechazar Curso" :modal="true">
                    <div class="flex flex-column align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle" style="font-size: 2rem" />
                        <span class="mt-3" v-if="dataCursoModal">¿Estás seguro que quieres rechazar el curso?</span>
                        <InputText class="mt-3 w-8" v-model="dataCursoModal.motivo" placeholder="Motivo de rechazo" />
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" text @click="(rechazarCurso = false), (dataCursoModal.motivo = '')" />
                        <Button label="Yes" icon="pi pi-check" text @click="rechazarCursoMotivo(dataCursoModal)" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="verMotivo" :style="{ width: '450px' }" header="Motivo de Rechazo" :modal="true">
                    <div class="flex flex-column align-items-center justify-content-center">
                        <i class="pi pi-info-circle mt-1" style="font-size: 2rem" />
                        <span class="mt-3 text-lg" v-if="dataCursoModal"
                            >Descripción: <strong> {{ dataCursoModal.descripcion }}</strong></span
                        >
                    </div>
                    <template #footer>
                        <Button label="Cerrar" icon="pi pi-times" text @click="verMotivo = false" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="periodoModal" :style="{ width: '450px' }" header="Periodo" :modal="true" class="p-fluid">
                    <div class="field">
                        <label for="fecha_inicio">Fecha de inicio</label>
                        <Calendar id="fecha_inicio" :showIcon="true" :showButtonBar="true" v-model="periodoForm.fechaInicio" :minDate="new Date(new Date().setDate(new Date().getDate() - 14))"> </Calendar>
                    </div>
                    <div class="field">
                        <label for="fecha_fin">Fecha de Cierre</label>
                        <Calendar id="fecha_fin" :showIcon="true" :showButtonBar="true" v-model="periodoForm.fechaCierre" :minDate="periodoForm.fechaInicio"></Calendar>
                    </div>
                    <template #footer>
                        <Button label="Cancelar" icon="pi pi-times" text="" @click="(periodoModal = false), (periodoForm = {})" />
                        <Button label="Guardar" icon="pi pi-check" text="" @click="savePeriodo" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="altaCursoModal" :style="{ width: '450px' }" header="Alta Curso" :modal="true" class="p-fluid">
                    <div class="field">
                        <label for="descripcion">Periodos</label>
                        <Dropdown
                            id="descripcion"
                            v-model.trim="cursosDataAlta.periodos"
                            :options="periodos"
                            @click="loadPeriodos"
                            optionLabel="descripcion"
                            placeholder="Selecciona el periodo"
                            required="true"
                            :invalid="submitted && !cursosDataAlta.periodos"
                            :filter="true"
                        >
                            <small class="p-invalid" v-if="submitted && !cursosDataAlta.periodos">El periodo es requerido.</small>
                        </Dropdown>
                    </div>
                    <div class="field">
                        <label for="materia">Selecciona los cursos que quieres aperturar</label>
                        <MultiSelect v-model="cursosDataAlta.cursos" :options="cursos" @click="loadCursos" optionLabel="nombre_curso" placeholder="Selecciona los cursos que deseas aperturar" :filter="true">
                            <template #value="slotProps">
                                <div class="inline-flex align-items-center py-1 px-2 bg-blue-900 text-white border-round mr-2" v-for="option of slotProps.value" :key="option.id">
                                    <div>{{ option.nombre_curso }}</div>
                                </div>
                                <template v-if="!slotProps.value || slotProps.value.length === 0">
                                    <div class="p-1">Selecciona el Curso</div>
                                </template>
                            </template>
                            <template #option="slotProps">
                                <div>{{ slotProps.option.nombre_curso }}</div>
                            </template>
                        </MultiSelect>
                    </div>

                    <template #footer>
                        <Button label="Cancelar" icon="pi pi-times" text="" @click="altaCursoModal = false" />
                        <Button label="Guardar" icon="pi pi-check" text="" @click="altaCursos" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="aceptarCurso" class="w-full md:w-6" header="Aceptar Curso" :modal="true">
                    <Spinner v-if="loadingSpinner" />
                    <Stepper>
                        <StepperPanel v-for="(modulo, index) in dataModulos" :key="index" :header="`Módulo ${index + 1}`">
                            <template #content="{ nextCallback, prevCallback }">
                                <div class="flex flex-column h-12rem">
                                    <div class="border-2 border-dashed surface-border border-round surface-ground flex-auto flex justify-content-center align-items-center font-medium">
                                        <div class="p-fluid formgrid grid p-4">
                                            <div class="field col-12">
                                                <div class="text-center text-lg">{{ modulo.materia.nombre_materia }}</div>
                                            </div>
                                            <div class="field col-12 md:col-6">
                                                <label for="periodo">Fecha de Inicio</label>
                                                <Calendar :showIcon="true" :showButtonBar="true" v-model="formDataModulos[index].fecha_inicio" dateFormat="dd/mm/yy"></Calendar>
                                            </div>
                                            <div class="field col-12 md:col-6">
                                                <label for="periodo">Fecha de Cierre</label>
                                                <Calendar :showIcon="true" :showButtonBar="true" v-model="formDataModulos[index].fecha_cierre" dateFormat="dd/mm/yy"></Calendar>
                                            </div>
                                            <div class="field col-12">
                                                <MultiSelect v-model="formDataModulos[index].docente" :selectionLimit="1" :options="dataDocentes" optionLabel="nombre" placeholder="Selecciona el docente para asignar al módulo" :filter="true">
                                                    <template #value="slotProps">
                                                        <div class="inline-flex align-items-center py-1 px-2 bg-blue-900 text-white border-round mr-2" v-for="option of slotProps.value" :key="option.id">
                                                            <div>{{ option.nombre }}</div>
                                                        </div>
                                                        <template v-if="!slotProps.value || slotProps.value.length === 0">
                                                            <div class="p-1">Selecciona el Curso</div>
                                                        </template>
                                                    </template>
                                                    <template #option="slotProps">
                                                        <div>{{ slotProps.option.nombre }}</div>
                                                    </template>
                                                </MultiSelect>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex pt-7 justify-content-between">
                                    <Button v-if="index > 0" label="Regresar" icon="pi pi-arrow-left" @click="prevCallback" />
                                    <Button v-else label="Regresar" icon="pi pi-arrow-left" disabled />
                                    <Button v-if="index < dataModulos.length - 1" label="Siguiente" icon="pi pi-arrow-right" iconPos="right" @click="nextCallback" />
                                    <Button v-else label="Guardar" icon="pi pi-check" iconPos="right" @click="validateSaveCurso()" />
                                </div>
                            </template>
                        </StepperPanel>
                    </Stepper>
                </Dialog>
            </div>
        </div>
    </div>
</template>
