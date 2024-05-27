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

const docente = ref({});
const deleteDocenteModal = ref(false);
const docenteModal = ref(false);
const submitted = ref(false);

const loadUsers = async () => {
    loading.value = true;
    isAccepting.value = true;
    try {
        const response = await UserApi.allUserDocentes();
        users.value = response.data;
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
    } finally {
        loading.value = false;
        isAccepting.value = false;
    }
};

onMounted(loadUsers);

const openNew = () => {
    docente.value = {};
    submitted.value = false;
    docenteModal.value = true;
    isEditMode.value = false;
};

const hideDialog = () => {
    docenteModal.value = false;
    submitted.value = false;
};

const saveDocente = async () => {
    submitted.value = true;
    isAccepting.value = true;
    if (docente.value.num_plaza && docente.value.nombre.trim() && docente.value.apellido_p.trim() && docente.value.apellido_m.trim() && docente.value.telefono_usuario.trim() && docente.value.email_usuario.trim() && docente.value.password.trim()) {
        loading.value = true;
        try {
            let response;
            if (isEditMode.value) {
                response = await UserApi.updateDocente(docente.value);
                toast.open({
                    message: response.data.msg,
                    type: 'success'
                });
            } else {
                response = await UserApi.createDocente(docente.value);
                toast.open({
                    message: response.data.msg,
                    type: 'success'
                });
            }
            docenteModal.value = false; // Cierra el modal
            docente.value = {}; // Limpia el formulario
            isEditMode.value = false;
            await loadUsers();
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
        isAccepting.value = false;
        toast.open({
            message: 'Por favor, completa todos los campos requeridos.',
            type: 'warn'
        });
    }
};

const confirmDeleteDocente = (editDocente) => {
    docente.value = editDocente;
    deleteDocenteModal.value = true;
};

const editDocente = (editDocente) => {
    const docenteData = { ...editDocente, ...editDocente.docente };
    docente.value = docenteData;
    docenteModal.value = true;
    isEditMode.value = true;
};

const deleteDocente = async () => {
    isAccepting.value = true;

    try {
        const response = await UserApi.deleteDocente(docente.value.usuario_id);
        toast.open({
            message: response.data.msg,
            type: 'success'
        });
        deleteDocenteModal.value = false;
        docente.value = {};
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
                            <Button label="Nuevo Docente" icon="pi pi-plus" class="mr-2" severity="success" @click="openNew" />
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
                    currentPageReportTemplate="Mostrando del {first} al {last} de {totalRecords} docentes"
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
                    <Column field="docente.num_plaza" header="N_Plaza" :sortable="true"></Column>
                    <Column field="nombre" header="Nombre" :sortable="true"></Column>
                    <Column field="apellido_p" header="Apellido Paterno" :sortable="true"></Column>
                    <Column field="apellido_m" header="Apellido Materno" :sortable="true"></Column>
                    <Column field="telefono_usuario" header="Telefono" :sortable="true"></Column>
                    <Column field="email_usuario" header="Email" :sortable="true"></Column>
                    <Column field="status" header="Status" dataType="string" style="min-width: 8rem" :sortable="true">
                        <template #body="{ data }">
                            <Tag v-if="data.status === 'PENDIENTE'" severity="warning" value="Pendiente" />
                            <Tag v-if="data.status === 'ACTIVO'" severity="success" value="Activo" />
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <!-- Aquí puedes mantener el componente de filtro existente -->
                            <TriStateCheckbox v-model="filterModel.value" @change="filterCallback()" />
                        </template>
                    </Column>
                    <Column headerStyle="min-width:10rem;">
                        <template #body="{ data }">
                            <Button icon="pi pi-pencil" class="mr-2" severity="success" rounded @click="editDocente(data)" />
                            <Button icon="pi pi-trash" class="mt-2" severity="warning" rounded @click="confirmDeleteDocente(data)" />
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="docenteModal" :header="isEditMode ? 'Datos del Docente - Editar' : 'Datos del Docente - Registrar'" :modal="true" class="p-fluid">
                    <div class="field" v-show="isEditMode">
                        <label for="usuario_id">ID</label>
                        <InputText id="usuario_id" :disabled="isEditMode" v-model.trim="docente.usuario_id" />
                    </div>
                    <div class="formgrid grid">
                        <div class="field col">
                            <label for="num_plaza">Numero de Plaza</label>
                            <InputText id="num_plaza" v-model.trim="docente.num_plaza" required="true" :invalid="submitted && !docente.num_plaza" />
                            <small class="p-invalid" v-if="submitted && !docente.num_plaza">El numero de plaza es requerida.</small>
                        </div>
                        <div class="field col">
                            <label for="curp">CURP</label>
                            <InputText id="curp" v-model.trim="docente.curp" required="true" :invalid="submitted && !docente.curp" />
                            <small class="p-invalid" v-if="submitted && !docente.curp">El numero de plaza es requerida.</small>
                        </div>
                    </div>
                    <div class="formgrid grid">
                        <div class="field col">
                            <label for="nombre">Nombre Completo</label>
                            <InputText id="nombre" v-model.trim="docente.nombre" required="true" :invalid="submitted && !docente.nombre" />
                            <small class="p-invalid" v-if="submitted && !docente.nombre">El nombre es requerido.</small>
                        </div>
                        <div class="field col">
                            <label for="apellido_p">Apellido Paterno</label>
                            <InputText id="apellido_p" v-model.trim="docente.apellido_p" required="true" :invalid="submitted && !docente.apellido_p" />
                            <small class="p-invalid" v-if="submitted && !docente.apellido_p">El apellido paterno es requerido.</small>
                        </div>
                    </div>
                    <!-- <ScrollPanel :style="{ width: '95%', height: '450px' }"> -->
                    <div class="formgrid grid">
                        <div class="field col">
                            <label for="apellido_m">Apellido Materno</label>
                            <InputText id="apellido_m" v-model.trim="docente.apellido_m" required="true" :invalid="submitted && !docente.apellido_m" />
                            <small class="p-invalid" v-if="submitted && !docente.apellido_m">El apellido materno es requerido.</small>
                        </div>
                        <div class="field col">
                            <label for="telefono_usuario">Telefono</label>
                            <InputText id="telefono_usuario" v-model.trim="docente.telefono_usuario" required="true" :invalid="submitted && !docente.telefono_usuario" />
                            <small class="p-invalid" v-if="submitted && !docente.telefono_usuario">El telefono es requerido.</small>
                        </div>
                    </div>
                    <div class="formgrid grid">
                        <div class="field col">
                            <label for="email_usuario">Email</label>
                            <InputText id="email_usuario" v-model.trim="docente.email_usuario" required="true" :invalid="submitted && !docente.email_usuario" />
                            <small class="p-invalid" v-if="submitted && !docente.email_usuario">El email es requerido.</small>
                        </div>
                        <div class="field col">
                            <label for="password">Contraseña</label>
                            <InputText type="password" id="password" v-model.trim="docente.password" required="true" :invalid="submitted && !docente.password" />
                            <small class="p-invalid" v-if="submitted && !docente.password">El password es requerido.</small>
                        </div>
                    </div>

                    <!-- </ScrollPanel> -->
                    <template #footer>
                        <Button label="Cancel" icon="pi pi-times" text="" @click="hideDialog" />
                        <Button label="Save" icon="pi pi-check" text="" @click="saveDocente" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteDocenteModal" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="docente"
                            >¿Estás seguro que quieres eliminar a <b>{{ docente.docente.num_plaza }}</b
                            >?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" text @click="deleteDocenteModal = false" />
                        <Button label="Yes" icon="pi pi-check" text @click="deleteDocente" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>
