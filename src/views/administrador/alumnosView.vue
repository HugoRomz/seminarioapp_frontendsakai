<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, inject, onMounted } from 'vue';
import UserApi from '../../api/UserApi';
import Spinner from '../../components/Spinner.vue';

const isAccepting = ref(false);
const toast = inject('toast');

const users = ref(null);
const filters = ref();
const loading = ref(null);
const dt = ref();

const isEditMode = ref(false);

const alumno = ref({});
const deleteAlumnoModal = ref(false);
const alumnoModal = ref(false);
const submitted = ref(false);

const loadUsers = async () => {
    loading.value = true;
    try {
        const response = await UserApi.allUserAlumnos();
        users.value = response.data;
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(loadUsers);

const openNew = () => {
    alumno.value = {};
    submitted.value = false;
    alumnoModal.value = true;
    isEditMode.value = false;
};

const hideDialog = () => {
    alumnoModal.value = false;
    submitted.value = false;
};

const saveAlumno = async () => {
    submitted.value = true;
    isAccepting.value = true;
    if (alumno.value.matricula && alumno.value.nombre.trim() && alumno.value.apellido_p.trim() && alumno.value.apellido_m.trim() && alumno.value.telefono_usuario.trim() && alumno.value.email_usuario.trim() && alumno.value.password.trim()) {
        loading.value = true;
        try {
            let response;
            if (isEditMode.value) {
                response = await UserApi.updateAlumno(alumno.value);
                toast.open({
                    message: response.data.msg,
                    type: 'success'
                });
            } else {
                response = await UserApi.createAlumno(alumno.value);
                toast.open({
                    message: response.data.msg,
                    type: 'success'
                });
            }
            alumnoModal.value = false; // Cierra el modal
            alumno.value = {}; // Limpia el formulario
            isEditMode.value = false; // Restablece el modo
            await loadUsers(); // Recarga la lista de usuarios
        } catch (error) {
            toast.open({
                message: error.response && error.response.data.msg ? error.response.data.msg : 'Error desconocido',
                type: 'error'
            });
        } finally {
            loading.value = false;
            isAccepting.value = false;
        }
    } else {
        toast.open({
            message: 'Por favor, completa todos los campos requeridos.',
            type: 'warn'
        });
    }
};

const confirmDeleteProduct = (editProduct) => {
    alumno.value = editProduct;
    deleteAlumnoModal.value = true;
};

const editAlumno = (editAlumno) => {
    alumno.value = { ...editAlumno };
    alumnoModal.value = true;
    isEditMode.value = true;
};

const deleteAlumno = async () => {
    isAccepting.value = true;
    try {
        const response = await UserApi.deleteAlumno(alumno.value.matricula);
        toast.open({
            message: response.data.msg,
            type: 'success'
        });
        deleteAlumnoModal.value = false;
        alumno.value = {};
        await loadUsers(); // Recarga la lista de usuarios
    } catch (error) {
        toast.open({
            message: error.response && error.response.data.msg ? error.response.data.msg : 'Error desconocido al eliminar',
            type: 'error'
        });
    } finally {
        isAccepting.value = false;
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
    <Spinner v-if="isAccepting" />
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="Nuevo Alumno" icon="pi pi-plus" class="mr-2" severity="success" @click="openNew" />
                        </div>
                    </template>

                    <template v-slot:end>
                        <Button label="Exportar" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
                    </template>
                </Toolbar>

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
                    <template #empty> No hay preregistros. </template>
                    <template #loading> Cargando... por favor espera </template>
                    <template #paginatorstart>
                        <Button icon="pi pi-refresh" @click="loadUsers" />
                    </template>
                    <Column field="alumno.matricula" header="Matricula" :sortable="true"></Column>
                    <Column field="nombre" header="Nombre" :sortable="true"></Column>
                    <Column field="apellido_p" header="Apellido Paterno" :sortable="true"></Column>
                    <Column field="apellido_m" header="Apellido Materno" :sortable="true"></Column>
                    <Column field="telefono_usuario" header="Telefono" :sortable="true"></Column>
                    <Column field="email_usuario" header="Email" :sortable="true"></Column>
                    <Column field="alumno.calificacionFinal" header="Calificacion" :sortable="true"></Column>
                    <Column field="status" header="Status" dataType="boolean" style="min-width: 8rem" :sortable="true">
                        <template #body="{ data }">
                            <i class="pi" :class="{ 'pi-check-circle text-green-500 ': data.status, 'pi-times-circle text-red-500': !data.status }"></i>
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

                <Dialog v-model:visible="alumnoModal" :style="{ width: '40%' }" :header="isEditMode ? 'Datos del Alumno - Editar' : 'Datos del Alumno - Registrar'" :modal="true" class="p-fluid">
                    <div class="field">
                        <label for="matricula">Matricula ó Codigo Alumno</label>
                        <InputText id="matricula" :disabled="isEditMode" v-model.trim="alumno.matricula" required="true" autofocus :invalid="submitted && !alumno.matricula" />
                        <small class="p-invalid" v-if="submitted && !alumno.matricula">La matricula es requerida.</small>
                    </div>
                    <div class="formgrid grid">
                        <div class="field col">
                            <label for="nombre">Nombre Completo</label>
                            <InputText id="nombre" v-model.trim="alumno.nombre" required="true" autofocus :invalid="submitted && !alumno.nombre" />
                            <small class="p-invalid" v-if="submitted && !alumno.nombre">El nombre es requerido.</small>
                        </div>
                        <div class="field col">
                            <label for="apellido_p">Apellido Paterno</label>
                            <InputText id="apellido_p" v-model.trim="alumno.apellido_p" required="true" autofocus :invalid="submitted && !alumno.apellido_p" />
                            <small class="p-invalid" v-if="submitted && !alumno.apellido_p">El apellido paterno es requerido.</small>
                        </div>
                    </div>
                    <!-- <ScrollPanel :style="{ width: '95%', height: '450px' }"> -->
                    <div class="formgrid grid">
                        <div class="field col">
                            <label for="apellido_m">Apellido Materno</label>
                            <InputText id="apellido_m" v-model.trim="alumno.apellido_m" required="true" autofocus :invalid="submitted && !alumno.apellido_m" />
                            <small class="p-invalid" v-if="submitted && !alumno.apellido_m">El apellido materno es requerido.</small>
                        </div>
                        <div class="field col">
                            <label for="telefono_usuario">Telefono</label>
                            <InputText id="telefono_usuario" v-model.trim="alumno.telefono_usuario" required="true" autofocus :invalid="submitted && !alumno.telefono_usuario" />
                            <small class="p-invalid" v-if="submitted && !alumno.telefono_usuario">El telefono es requerido.</small>
                        </div>
                    </div>
                    <div class="formgrid grid">
                        <div class="field col">
                            <label for="email_usuario">Email</label>
                            <InputText id="email_usuario" v-model.trim="alumno.email_usuario" required="true" autofocus :invalid="submitted && !alumno.email_usuario" />
                            <small class="p-invalid" v-if="submitted && !alumno.email_usuario">El email es requerido.</small>
                        </div>
                        <div class="field col">
                            <label for="password">Contraseña</label>
                            <InputText id="password" v-model.trim="alumno.password" required="true" autofocus :invalid="submitted && !alumno.password" />
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
                            >¿Estás seguro que quieres eliminar a <b>{{ alumno.alumno.matricula }}</b
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
    </div>
</template>
