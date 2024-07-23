<script setup>
import { ref, inject, onMounted } from 'vue';
import { FilterMatchMode } from 'primevue/api';
import { useRoute } from 'vue-router';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import LogoSuperior from '../../assets/img/LogoSuperior.js';
import logoInferior from '../../assets/img/LogoInferior.js';

const toast = inject('toast');

import SeminarioApi from '../../api/SeminarioApi.js';
import Spinner from '../../components/Spinner.vue';
import router from '../../router/index.js';

const route = useRoute();
const cursoId = ref(route.params.id);
const alumnosdata = ref([]);

const cursoData = ref({});
const editModulo = ref(false);
const moduloData = ref({});

const alumnoModal = ref(false);
const alumnosForm = ref({ usuario_id: [] });

const constanciaModal = ref(false);
const alumnoModalConstancia = ref([]);

const alumnosCursoData = ref([]);
const filters = ref();

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
        toast.open({
            message: error.response.data.msg,
            type: 'error'
        });
    } finally {
        loading.value = false;
    }
};

const loadAlumnos = async () => {
    loading.value = true;
    try {
        const response = await SeminarioApi.loadAlumnos(cursoId.value);
        alumnosdata.value = response.data;
    } catch (error) {
        toast.open({
            message: error.response.data.msg,
            type: 'info'
        });
    } finally {
        loading.value = false;
    }
};

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

const generarCalificaciones = async (modulo_id, nombre_modulo) => {
    try {
        loading.value = true;
        const response = await SeminarioApi.generarCalificaciones(modulo_id);
        const data = response.data;
        const caldata = data.calificaciones;

        if (caldata.length > 0) {
            const doc = new jsPDF();

            const pageWidth = doc.internal.pageSize.getWidth();
            const logoWidth = 195; // Adjust the width of the logo as needed
            const logoX = (pageWidth - logoWidth) / 2;
            doc.addImage(LogoSuperior, 'JPEG', logoX, 5, logoWidth, 15);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            const textWidth = (doc.getStringUnitWidth(data.curso.toUpperCase()) * doc.internal.getFontSize()) / doc.internal.scaleFactor;
            const textX = (pageWidth - textWidth) / 2;
            doc.text(data.curso.toUpperCase(), textX, 30);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            const periodWidth = (doc.getStringUnitWidth(`CICLO:${data.periodo.toUpperCase()}`) * doc.internal.getFontSize()) / doc.internal.scaleFactor;
            const periodX = (pageWidth - periodWidth) / 2;
            doc.text(`CICLO:${data.periodo.toUpperCase()}`, periodX, 36);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            const titleWidth = (doc.getStringUnitWidth('ACTA DE CALIFICACIONES') * doc.internal.getFontSize()) / doc.internal.scaleFactor;
            const titleX = (pageWidth - titleWidth) / 2;
            doc.text('ACTA DE CALIFICACIONES', titleX, 41);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            const moduleWidth = (doc.getStringUnitWidth(`MODULO:${nombre_modulo.toUpperCase()}`) * doc.internal.getFontSize()) / doc.internal.scaleFactor;
            const moduleX = (pageWidth - moduleWidth) / 2;
            doc.text(`MODULO:${nombre_modulo.toUpperCase()}`, moduleX, 47);

            doc.setFontSize(7);
            doc.setFont('helvetica');
            doc.setTextColor(128, 128, 128); // Set text color to gray
            doc.text(`* Las calificaciones se otorgan en una escala del 1 al 10`, 23, 54);
            doc.setTextColor(0, 0, 0); // Reset text color to black

            const headers = [['N°', 'Matrícula', 'Nombre', 'Cal. Mod.', 'Proy. Fin.', 'Cal. Final']];
            const rows = caldata.map((item, index) => [
                { content: index + 1, styles: { halign: 'center' } },
                { content: item.matricula.toUpperCase(), styles: { halign: 'center' } },
                { content: item.nombre, styles: { halign: 'left' } },
                { content: item.cal_mod, styles: { halign: 'center' } },
                { content: item.proy_cal, styles: { halign: 'right' } },
                { content: item.cal_fin, styles: { halign: 'right' } }
            ]);

            autoTable(doc, {
                head: headers,
                body: rows,
                theme: 'plain',
                styles: {
                    lineColor: [0, 0, 0],
                    lineWidth: 0.2
                },
                margin: { top: 55, right: 23, left: 23 },
                didDrawPage: function (data) {
                    if (data.pageCount > 1) {
                        doc.text('Continuación...', 10, doc.internal.pageSize.height - 50);
                    }
                }
            });

            //nombre y firma del docente

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            const DocenteWidth = (doc.getStringUnitWidth(data.docente.toUpperCase()) * doc.internal.getFontSize()) / doc.internal.scaleFactor;
            const DocenteX = (pageWidth - DocenteWidth) / 2;
            doc.text(data.docente.toUpperCase(), DocenteX, doc.internal.pageSize.height - 40);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            const firmaWidth = (doc.getStringUnitWidth('Firma del docente') * doc.internal.getFontSize()) / doc.internal.scaleFactor;
            const firmaX = (pageWidth - firmaWidth) / 2;
            doc.text('Firma del docente', firmaX, doc.internal.pageSize.height - 35);

            const centroX = doc.internal.pageSize.width / 2 - 150 / 2;
            // Agregar logo inferior
            doc.addImage(logoInferior, 'JPEG', centroX, doc.internal.pageSize.height - 10, 150, 5);

            // doc.save(`Calificaciones_${nombre_modulo}.pdf`);
            doc.output('dataurlnewwindow');
            toast.open({
                message: `Calificaciones generadas ${nombre_modulo}`,
                type: 'success'
            });
            return;
        }
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
        const response = await SeminarioApi.obtenerAlumnosCurso(cursoId.value);
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

const generarConstancias = async () => {
    const data = {
        Nombre: alumnoModalConstancia.value[0].nombre + ' ' + alumnoModalConstancia.value[0].apellido_p + ' ' + alumnoModalConstancia.value[0].apellido_m,
        Curso: cursoData.value.curso.nombre_curso,
        periodo: cursoData.value.periodo.descripcion,
        matricula: alumnoModalConstancia.value[0].matricula,
        calificaciones: alumnoModalConstancia.value[0].calificaciones,
        promedioFinal: alumnoModalConstancia.value[0].promedioFinal,
        modulos: cursoData.value.modulos.map((modulo) => modulo.nombre_modulo)
    };

    const url = router.resolve({
        name: 'constanciaEstudios',
        query: { alumno: JSON.stringify(data) }
    }).href;

    window.open(url, '_blank');
};

onMounted(loadCurso(), loadAlumnos()), obtenerAlumnosCurso();

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
                                <Button @click="openModalAlumno" class="w-full mt-3 md:mt-0" label="Agregar alumnos" severity="success" :disabled="!alumnosdata || alumnosdata.length === 0" />
                                <Button @click="constanciaModal = true" class="w-full mt-3 md:mt-0" label="Generar constancias" severity="contrast" outlined />
                                <Button class="w-full mt-3 md:mt-0" label="Generar reportes" severity="contrast" outlined disabled />
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
                                        <Button @click="generarCalificaciones(modulo.modulo_id, modulo.nombre_modulo)" class="w-full md:w-auto mt-3 md:mt-0" label="Generar Calificaciones" severity="info" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-12">
                    <div class="w-full mx-auto">
                        <h2 class="text-3xl font-bold mb-3">Alumnos del Curso</h2>
                        <DataTable
                            ref="dt"
                            :value="alumnosCursoData"
                            dataKey="id"
                            :paginator="true"
                            :rows="10"
                            :filters="filters"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            :rowsPerPageOptions="[5, 10, 25]"
                            currentPageReportTemplate="Mostrando del {first} al {last} de {totalRecords} alumnos"
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
                                <Button icon="pi pi-refresh" @click="loadUsers(selectedPeriodos.value.periodo_id)" />
                            </template>
                            <Column field="matricula" header="Matricula" :sortable="true"> </Column>
                            <Column field="nombre" header="Nombre" :sortable="true"></Column>
                            <Column field="apellido_p" header="Apellido Paterno" :sortable="true"></Column>
                            <Column field="apellido_m" header="Apellido Materno" :sortable="true"></Column>
                            <Column field="promedioFinal" header="Promedio" :sortable="true"></Column>

                            <Column field="status" header="Status" dataType="string" style="min-width: 8rem" :sortable="true">
                                <template #body="{ data }">
                                    <i
                                        class="pi"
                                        :class="{
                                            'pi-check-circle text-green-500': data.status === 'ACTIVO',
                                            'pi-times-circle text-red-500': data.status !== 'ACTIVO'
                                        }"
                                    ></i>
                                </template>
                                <template #filter="{ filterModel, filterCallback }">
                                    <TriStateCheckbox v-model="filterModel.value" @change="filterCallback()" />
                                </template>
                            </Column>
                        </DataTable>
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
                        <div>{{ option.nombre }}</div>
                    </div>
                    <template v-if="!slotProps.value || slotProps.value.length === 0">
                        <div class="p-1">Selecciona los alumnos</div>
                    </template>
                </template>
                <template #option="slotProps">
                    <div>{{ slotProps.option.nombre + ' ' + slotProps.option.apellido_p + ' ' + slotProps.option.apellido_m }}</div>
                </template>
            </MultiSelect>
        </div>

        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" text="" @click="alumnoModal = false" />
            <Button label="Guardar" icon="pi pi-check" text="" @click="asignarAlumnos" />
        </template>
    </Dialog>

    <Dialog v-model:visible="constanciaModal" header="Generar Constancias" :modal="true" class="p-fluid w-full md:w-30rem">
        <div class="field">
            <label for="Alumnos">Selecciona los alumnos</label>
            <MultiSelect v-model="alumnoModalConstancia" :options="alumnosCursoData" placeholder="Selecciona los alumnos para generar constancias" :filter="true">
                <template #value="slotProps">
                    <div class="inline-flex align-items-center py-1 px-2 bg-blue-900 text-white border-round mr-2" v-for="option of slotProps.value" :key="option.id">
                        <div>{{ option.nombre }} {{ option.apellido_p }} {{ option.apellido_m }}</div>
                    </div>
                </template>
                <template #option="slotProps">
                    <div>{{ slotProps.option.nombre }} {{ slotProps.option.apellido_p }} {{ slotProps.option.apellido_m }}</div>
                </template>
            </MultiSelect>
        </div>

        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" text="" @click="constanciaModal = false" />
            <Button label="Generar" icon="pi pi-check" text="" @click="generarConstancias" />
        </template>
    </Dialog>
</template>
