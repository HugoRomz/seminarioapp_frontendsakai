<script setup>
import { ref, inject, onMounted, watch } from 'vue';
import { FilterMatchMode } from 'primevue/api';
import UserApi from '../../api/UserApi';
import Spinner from '../../components/Spinner.vue';

const switchValue = ref(false);
const toast = inject('toast');
const users = ref([]);
const selectedPeriodos = ref(null);
const periodos = ref([]);
const filters = ref();
const loading = ref(false);
const dt = ref();
const isEditMode = ref(false);

const alumno = ref({
    esEgresado: false
});
const deleteAlumnoModal = ref(false);
const alumnoModal = ref(false);
const submitted = ref(false);

watch(selectedPeriodos, async (newValue) => {
    if (newValue && newValue.value.periodo_id) {
        await loadUsers(newValue.value.periodo_id);
    }
});
const loadUsers = async (periodoId) => {
    loading.value = true;
    try {
        const response = await UserApi.allUserAlumnos(periodoId);
        users.value = response.data;
        if (users.value.length === 0) {
            toast.open({
                message: 'No hay alumnos registrados en este periodo',
                type: 'info'
            });
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

const loadPeriodos = async () => {
    loading.value = true;
    try {
        const response = await UserApi.loadPeriodos();
        periodos.value = response.data;
    } catch (error) {
        console.error('Error al obtener los periodos:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    await loadPeriodos();
});

const handlePeriodChange = async (newValue) => {
    selectedPeriodos.value = newValue;
};

const displayMatricula = (data) => {
    if (data.alumno) {
        return {
            matricula: data.alumno.matricula,
            calificacionFinal: data.alumno.calificacionFinal
        };
    } else if (data.egresado) {
        return {
            matricula: data.egresado.cod_egresado,
            calificacionFinal: data.egresado.calificacionFinal
        };
    } else {
        return {
            matricula: 'N/A',
            calificacionFinal: 'N/A'
        };
    }
};

// const openNew = () => {
//     alumno.value = {
//         esEgresado: false,
//         curp: '',
//         alumno: {
//             matricula: ''
//         },
//         egresado: {
//             cod_egresado: ''
//         },
//         nombre: '',
//         apellido_p: '',
//         apellido_m: '',
//         telefono_usuario: '',
//         email_usuario: '',
//         password: ''
//     };
//     submitted.value = false;
//     alumnoModal.value = true;
//     isEditMode.value = false;
// };

const hideDialog = () => {
    alumnoModal.value = false;
    submitted.value = false;
};

const saveAlumno = async () => {
    submitted.value = true;
    loading.value = true;
    if (alumno.value.curp.trim() && alumno.value.nombre.trim() && alumno.value.apellido_p.trim() && alumno.value.apellido_m.trim() && alumno.value.telefono_usuario.trim() && alumno.value.email_usuario.trim() && alumno.value.password.trim()) {
        loading.value = true;
        try {
            let response;
            alumno.value.esEgresado = switchValue.value;
            if (isEditMode.value) {
                response = await UserApi.updateAlumno(alumno.value);
                toast.open({
                    message: response.data.msg,
                    type: 'success'
                });
            } else {
                // response = await UserApi.createAlumno(alumno.value);

                toast.open({
                    message: response.data.msg,
                    type: 'success'
                });
            }
            alumnoModal.value = false; // Cierra el modal
            alumno.value = {}; // Limpia el formulario
            isEditMode.value = false;

            await loadUsers(selectedPeriodos.value.value.periodo_id);
        } catch (error) {
            toast.open({
                message: error.response && error.response.data.msg ? error.response.data.msg : 'Error desconocido',
                type: 'error'
            });
        } finally {
            loading.value = false;
        }
    } else {
        loading.value = false;
        toast.open({
            message: 'Por favor, completa todos los campos requeridos.',
            type: 'error'
        });
    }
};

const confirmDeleteProduct = (deleteAlumno) => {
    const alumnoData = { ...deleteAlumno };
    if (deleteAlumno.egresado) {
        alumnoData.matricula = deleteAlumno.egresado.cod_egresado;
        alumnoData.esEgresado = true;
    } else {
        alumnoData.matricula = deleteAlumno.alumno.matricula;
        alumnoData.esEgresado = false;
    }
    alumno.value = alumnoData;
    deleteAlumnoModal.value = true;
};

const editAlumno = (editAlumno) => {
    alumno.value = { ...editAlumno };
    if (editAlumno.egresado) {
        switchValue.value = true;
    } else {
        switchValue.value = false;
    }
    alumnoModal.value = true;
    isEditMode.value = true;
};

const deleteAlumno = async () => {
    loading.value = true;
    try {
        const response = await UserApi.deleteAlumno(alumno.value.usuario_id);
        toast.open({
            message: response.data.msg,
            type: 'success'
        });
        deleteAlumnoModal.value = false;
        alumno.value = {};
        await loadUsers(selectedPeriodos.value.value.periodo_id);
    } catch (error) {
        toast.open({
            message: error.response && error.response.data.msg ? error.response.data.msg : 'Error desconocido al eliminar',
            type: 'error'
        });
    } finally {
        loading.value = false;
    }
};

const exportCSV = () => {
    dt.value.exportCSV();
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
    <div class="grid">
        <div class="col-12">
            <card class="mb-4">
                <template #content>
                    <div class="flex align-items-center gap-2">
                        <h2 class="m-0 mr-5 font-medium text-lg">Seleccione el periodo para ver los alumnos:</h2>
                        <Dropdown id="period" v-model="selectedPeriodos" :options="periodos" optionLabel="descripcion" placeholder="Selecciona el periodo" @change="handlePeriodChange" :invalid="submitted && !selectedPeriodos" :filter="true">
                            <template #option="{ option }">
                                {{ option.descripcion }}
                            </template>
                        </Dropdown>
                    </div>
                </template>
            </card>
            <div v-if="users && Object.keys(users).length !== 0">
                <div class="card">
                    <Toolbar class="mb-4">
                        <!-- <template v-slot:start>
                            <div class="my-2">
                                <Button label="Nuevo Alumno" icon="pi pi-plus" class="mr-2" severity="success" @click="openNew" />
                            </div>
                        </template> -->

                        <template v-slot:end>
                            <Button label="Exportar" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
                        </template>
                    </Toolbar>

                    <div v-if="selectedPeriodos">
                        <DataTable
                            ref="dt"
                            :value="users"
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
                            <Column field="alumno.matricula" header="Matricula" :sortable="true">
                                <template #body="{ data }">
                                    {{ displayMatricula(data).matricula }}
                                </template>
                            </Column>
                            <Column field="curp" header="Curp" :sortable="true"></Column>
                            <Column field="nombre" header="Nombre" :sortable="true"></Column>
                            <Column field="apellido_p" header="Apellido Paterno" :sortable="true"></Column>
                            <Column field="apellido_m" header="Apellido Materno" :sortable="true"></Column>
                            <Column field="telefono_usuario" header="Telefono" :sortable="true"></Column>
                            <Column field="email_usuario" header="Email" :sortable="true"></Column>
                            <Column field="alumno.calificacionFinal" header="Calificacion" :sortable="true">
                                <template #body="{ data }">
                                    {{ displayMatricula(data).calificacionFinal }}
                                </template>
                            </Column>
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

                            <Column headerStyle="min-width:10rem;">
                                <template #body="{ data }">
                                    <Button icon="pi pi-pencil" class="mr-2" severity="success" rounded @click="editAlumno(data)" />
                                    <Button icon="pi pi-trash" class="mt-2" severity="warning" rounded @click="confirmDeleteProduct(data)" />
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                    <Dialog v-model:visible="alumnoModal" :header="isEditMode ? 'Datos del Alumno - Editar' : 'Datos del Alumno - Registrar'" :modal="true" class="p-fluid">
                        <div class="field" v-show="isEditMode">
                            <label for="usuario_id">ID</label>
                            <InputText id="usuario_id" :disabled="isEditMode" v-model.trim="alumno.usuario_id" />
                        </div>
                        <div class="formgrid grid">
                            <div class="field col">
                                <h6>¿Es egresado?</h6>
                                <InputSwitch :disabled="isEditMode" v-model="switchValue" />
                            </div>
                            <div class="field col">
                                <label for="curp">CURP</label>
                                <InputText id="curp" v-model.trim="alumno.curp" required="true" :invalid="submitted && !alumno.curp" placeholder="XXXX999999XXXXXX99" />
                                <small class="p-invalid" v-if="submitted && !alumno.curp">La CURP es requerida.</small>
                            </div>
                        </div>
                        <div class="formgrid grid">
                            <div class="field col" v-if="!switchValue">
                                <label for="matricula">Matricula</label>
                                <InputText id="matricula" v-model.trim="alumno.alumno.matricula" required="true" :invalid="submitted && !alumno.alumno.matricula" />
                                <small class="p-invalid" v-if="submitted && !alumno.alumno.matricula">La matricula es requerida.</small>
                            </div>
                            <div class="field col" v-else-if="isEditMode">
                                <label for="codigo_egresado"> Código egresado </label>
                                <InputText id="codigo_egresado" v-model.trim="alumno.egresado.cod_egresado" required="true" :invalid="submitted && !alumno.egresado.cod_egresado" />
                                <small class="p-invalid" v-if="submitted && !alumno.egresado.cod_egresado">El código de egresado es requerido.</small>
                            </div>
                        </div>
                        <div class="formgrid grid">
                            <div class="field col">
                                <label for="nombre">Nombre Completo</label>
                                <InputText id="nombre" v-model.trim="alumno.nombre" required="true" :invalid="submitted && !alumno.nombre" />
                                <small class="p-invalid" v-if="submitted && !alumno.nombre">El nombre es requerido.</small>
                            </div>
                            <div class="field col">
                                <label for="apellido_p">Apellido Paterno</label>
                                <InputText id="apellido_p" v-model.trim="alumno.apellido_p" required="true" :invalid="submitted && !alumno.apellido_p" />
                                <small class="p-invalid" v-if="submitted && !alumno.apellido_p">El apellido paterno es requerido.</small>
                            </div>
                        </div>
                        <!-- <ScrollPanel :style="{ width: '95%', height: '450px' }"> -->
                        <div class="formgrid grid">
                            <div class="field col">
                                <label for="apellido_m">Apellido Materno</label>
                                <InputText id="apellido_m" v-model.trim="alumno.apellido_m" required="true" :invalid="submitted && !alumno.apellido_m" />
                                <small class="p-invalid" v-if="submitted && !alumno.apellido_m">El apellido materno es requerido.</small>
                            </div>
                            <div class="field col">
                                <label for="telefono_usuario">Telefono</label>
                                <InputMask id="telefono_usuario" v-model.trim="alumno.telefono_usuario" required="true" :invalid="submitted && !alumno.telefono_usuario" mask="999-999-9999" placeholder="xxx-xxx-xxxx" />
                                <small class="p-invalid" v-if="submitted && !alumno.telefono_usuario">El telefono es requerido.</small>
                            </div>
                        </div>
                        <div class="formgrid grid">
                            <div class="field col">
                                <label for="email_usuario">Email</label>
                                <InputText id="email_usuario" v-model.trim="alumno.email_usuario" required="true" :invalid="submitted && !alumno.email_usuario" />
                                <small class="p-invalid" v-if="submitted && !alumno.email_usuario">El email es requerido.</small>
                            </div>
                            <div class="field col">
                                <label for="password">Contraseña</label>
                                <InputText type="password" id="password" v-model.trim="alumno.password" required="true" :invalid="submitted && !alumno.password" />
                                <small class="p-invalid" v-if="submitted && !alumno.password">El password es requerido.</small>
                            </div>
                        </div>

                        <!-- </ScrollPanel> -->
                        <template #footer>
                            <Button label="Cancel" icon="pi pi-times" text="" @click="hideDialog" />
                            <Button label="Save" icon="pi pi-check" text="" @click="saveAlumno" />
                        </template>
                    </Dialog>

                    <Dialog v-model:visible="deleteAlumnoModal" :style="{ width: '450px' }" header="Confirm" :modal="true">
                        <div class="flex align-items-center justify-content-center">
                            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                            <span v-if="alumno"
                                >¿Estás seguro que quieres eliminar a <b>{{ alumno.matricula }}</b
                                >?</span
                            >
                        </div>
                        <template #footer>
                            <Button label="No" icon="pi pi-times" text @click="deleteAlumnoModal = false" />
                            <Button label="Yes" icon="pi pi-check" text @click="deleteAlumno" />
                        </template>
                    </Dialog>
                </div>
            </div>
            <div v-else>
                <card>
                    <template #title>Alumnos</template>
                    <template #content> Selecciona un periodo para ver los alumnos. </template>
                </card>
            </div>
        </div>
    </div>
</template>
