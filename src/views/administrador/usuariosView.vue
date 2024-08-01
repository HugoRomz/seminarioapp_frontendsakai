<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, inject, onMounted } from 'vue';
import catalogoApi from '../../api/catalogoApi.js';
import Spinner from '../../components/Spinner.vue';

const toast = inject('toast');

const usuarios = ref(null);
const filters = ref();
const loading = ref(null);
const dt = ref();

const isEditMode = ref(false);

const usuarioEdit = ref({});
const deletUsuarioModal = ref(false);
const usuarioModal = ref(false);
const submitted = ref(false);

const statuses = ref([
    { label: 'Disponible', value: 'DISPONIBLE' },
    { label: 'Inactivo', value: 'INACTIVO' },
    { label: 'Activo', value: 'ACTIVO' },
    { label: 'Pendiente', value: 'PENDIENTE' }
]);

const loadUsuarios = async () => {
    loading.value = true;
    try {
        const response = await catalogoApi.findUsuarios();
        usuarios.value = response.data;
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
    } finally {
        loading.value = false;
    }
};

const roles = ref([]);
const loadRoles = async () => {
    loading.value = true;
    try {
        const response = await catalogoApi.findRoles();
        roles.value = response.data;
    } catch (error) {
        console.error('Error al obtener los roles:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(loadUsuarios);

const openNew = () => {
    usuarioEdit.value = {};
    submitted.value = false;
    usuarioModal.value = true;
    isEditMode.value = false;
    if (roles.value.length === 0) {
        loadRoles();
    }
};

const hideDialog = () => {
    usuarioModal.value = false;
    submitted.value = false;
};

const saveUsuario = async () => {
    submitted.value = true;
    if (usuarioEdit.value.nombre && usuarioEdit.value.apellido_p && usuarioEdit.value.apellido_m && usuarioEdit.value.email_usuario) {
        loading.value = true;
        try {
            let response;
            if (isEditMode.value) {
                response = await catalogoApi.updateUsuario(usuarioEdit.value);
                toast.open({
                    message: response.data.msg,
                    type: 'success'
                });
            } else {
                response = await catalogoApi.createUsuario(usuarioEdit.value);
                toast.open({
                    message: response.data.msg,
                    type: 'success'
                });
            }
            usuarioModal.value = false;
            usuarioEdit.value = {};
            isEditMode.value = false;
            await loadUsuarios();
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
            type: 'warn'
        });
    }
};

const confirmDeleteUsuario = (editUsuario) => {
    usuarioEdit.value = editUsuario;
    deletUsuarioModal.value = true;
};

const editUsuario = (editUsuario) => {
    if (roles.value.length === 0) {
        loadRoles();
    }
    usuarioEdit.value = {
        ...editUsuario,
        roles: editUsuario.roles.map((rol) => rol.rol_id)
    };
    usuarioModal.value = true;
    isEditMode.value = true;
};

const deleteUsuario = async () => {
    loading.value = true;

    try {
        const response = await catalogoApi.deleteUsuario(usuarioEdit.value.usuario_id);
        toast.open({
            message: response.data.msg,
            type: 'success'
        });
        deletUsuarioModal.value = false;
        usuarioEdit.value = {};
        await loadUsuarios(); // Recarga la lista de usuarios
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

const home = ref({
    icon: 'pi pi-home',
    route: '/'
});

const items = ref([{ label: 'Catalogo' }, { label: 'Usuarios', route: '/admin/usuarios' }]);
</script>
<template>
    <Spinner v-if="loading" />
    <div class="grid">
        <div class="col-12">
            <Card>
                <template #title>
                    <Breadcrumb :home="home" :model="items">
                        <template #item="{ item }">
                            <router-link v-if="item.route" :to="item.route">
                                <span :class="[item.icon, 'text-color']" />
                                <span class="text-primary font-semibold">{{ item.label }}</span>
                            </router-link>
                            <span v-else class="text-color">{{ item.label }}</span>
                        </template>
                    </Breadcrumb>
                </template>
                <template #content>
                    <Toolbar class="mb-4">
                        <template v-slot:start>
                            <div class="my-2">
                                <Button label="Nuevo Usuario" icon="pi pi-plus" class="mr-2" severity="success" @click="openNew" />
                            </div>
                        </template>

                        <template v-slot:end>
                            <Button label="Exportar" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
                        </template>
                    </Toolbar>

                    <div class="card">
                        <DataTable
                            ref="dt"
                            :value="usuarios"
                            dataKey="id"
                            :paginator="true"
                            :rows="10"
                            :filters="filters"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            :rowsPerPageOptions="[5, 10, 25]"
                            currentPageReportTemplate="Mostrando del {first} al {last} de {totalRecords} usuarios"
                            sortField="roles"
                            :sortOrder="-1"
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
                                <Button icon="pi pi-refresh" @click="loadUsuarios" />
                            </template>
                            <Column field="nombre" header="Nombre" :sortable="true"></Column>
                            <Column field="apellido_p" header="Apellido Paterno" :sortable="true"></Column>
                            <Column field="apellido_m" header="Apellido Materno" :sortable="true"></Column>
                            <Column field="curp" header="CURP" :sortable="true"></Column>
                            <Column field="email_usuario" header="Descripción"></Column>
                            <Column field="telefono_usuario" header="Teléfono" :sortable="true"></Column>
                            <Column field="status" header="Status" dataType="string" style="min-width: 8rem" :sortable="true">
                                <template #body="{ data }">
                                    <Tag v-if="data.status == 'PENDIENTE'" class="mr-2" severity="info" value="Pendiente"></Tag>
                                    <Tag v-if="data.status == 'ACTIVO'" class="mr-2" severity="success" value="Activo"></Tag>
                                    <Tag v-if="data.status == 'DISPONIBLE'" class="mr-2" severity="success" value="Disponible"></Tag>
                                    <Tag v-if="data.status == 'INACTIVO'" class="mr-2" severity="warning" value="Inactivo"></Tag>
                                    <Tag v-if="data.status == 'FINALIZADO'" class="mr-2" severity="danger" value="Finalizado"></Tag>
                                    <Tag v-if="data.status == ''" class="mr-2" severity="warning" value="Sin Status"></Tag>
                                </template>
                                <template #filter="{ filterModel, filterCallback }">
                                    <TriStateCheckbox v-model="filterModel.value" @change="filterCallback()" />
                                </template>
                            </Column>
                            <Column field="roles" header="Roles-Módulo" :sortable="true">
                                <template #body="{ data }">
                                    <div class="flex flex-wrap gap-1">
                                        <Tag v-for="rol in data.roles" :key="rol.rol_id" style="background: var(--surface-700); color: var(--surface-0)">
                                            <span style="font-size: 10px">{{ rol.nombre_rol }}</span>
                                        </Tag>
                                    </div>
                                </template>
                            </Column>
                            <Column headerStyle="min-width:10rem;" header="Acciones">
                                <template #body="{ data }">
                                    <Button icon="pi pi-pencil" class="mr-2" severity="success" rounded @click="editUsuario(data)" />
                                    <Button icon="pi pi-trash" class="mt-2" severity="warning" rounded @click="confirmDeleteUsuario(data)" />
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                </template>
            </Card>
        </div>
    </div>
    <Dialog v-model:visible="usuarioModal" :header="isEditMode ? 'Datos del Usuario - Editar' : 'Datos del Usuario - Registrar'" :modal="true" class="p-fluid" :style="{ width: '450px' }">
        <div class="field" v-if="isEditMode">
            <label for="usuario_id">ID Usuario</label>
            <InputText id="usuario_id" :disabled="isEditMode" v-model.trim="usuarioEdit.usuario_id" />
        </div>
        <div class="field">
            <label for="nombre">Nombre del usuario</label>
            <InputText id="nombre" v-model.trim="usuarioEdit.nombre" required="true" :invalid="submitted && !usuarioEdit.nombre" />
            <small class="p-invalid" v-if="submitted && !usuarioEdit.nombre">El numero de nombre materia es requerida.</small>
        </div>
        <div class="field">
            <label for="apellido_p">Apellido Paterno</label>
            <InputText id="apellido_p" v-model.trim="usuarioEdit.apellido_p" required="true" :invalid="submitted && !usuarioEdit.apellido_p" />
            <small class="p-invalid" v-if="submitted && !usuarioEdit.apellido_p">El numero de apellido paterno es requerida.</small>
        </div>
        <div class="field">
            <label for="apellido_m">Apellido Materno</label>
            <InputText id="apellido_m" v-model.trim="usuarioEdit.apellido_m" required="true" :invalid="submitted && !usuarioEdit.apellido_m" />
            <small class="p-invalid" v-if="submitted && !usuarioEdit.apellido_m">El numero de apellido materno es requerida.</small>
        </div>
        <div class="field">
            <label for="email_usuario">Email del usuario</label>
            <InputText id="email_usuario" v-model.trim="usuarioEdit.email_usuario" required="true" :invalid="submitted && !usuarioEdit.email_usuario" />
            <small class="p-invalid" v-if="submitted && !usuarioEdit.email_usuario">El numero de email usuario es requerida.</small>
        </div>
        <div class="field">
            <label for="curp">CURP</label>
            <InputText id="curp" v-model.trim="usuarioEdit.curp" required="true" :invalid="submitted && !usuarioEdit.curp" />
            <small class="p-invalid" v-if="submitted && !usuarioEdit.curp">El numero de curp es requerida.</small>
        </div>
        <div class="field">
            <label for="telefono_usuario">Teléfono del usuario</label>
            <InputText id="telefono_usuario" v-model.trim="usuarioEdit.telefono_usuario" required="true" :invalid="submitted && !usuarioEdit.telefono_usuario" />
            <small class="p-invalid" v-if="submitted && !usuarioEdit.telefono_usuario">El numero de telefono usuario es requerida.</small>
        </div>
        <div class="field">
            <label for="password">Contraseña</label>
            <InputText id="password" v-model.trim="usuarioEdit.password" required="true" :invalid="submitted && !usuarioEdit.password" />
            <small class="p-invalid" v-if="submitted && !usuarioEdit.password">El numero de contraseña es requerida.</small>
        </div>
        <div class="field">
            <label for="roles">Roles-Módulos</label>
            <MultiSelect v-model="usuarioEdit.roles" display="chip" :options="roles" optionLabel="nombre_rol" optionValue="rol_id" placeholder="Selecciona los roles" class="w-full md:min-w-full" />
        </div>
        <div class="field" v-if="isEditMode">
            <label for="status">Status</label>
            <Dropdown id="status" v-model="usuarioEdit.status" :options="statuses" optionLabel="label" optionValue="value" placeholder="Selecciona un status" class="w-full md:min-w-full" />
        </div>

        <!-- </ScrollPanel> -->
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" text="" @click="hideDialog" />
            <Button label="Guardar" icon="pi pi-check" text="" @click="saveUsuario" />
        </template>
    </Dialog>

    <Dialog v-model:visible="deletUsuarioModal" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="usuarioEdit"
                >¿Estás seguro que quieres eliminar a ID Usuario: <b>{{ usuarioEdit.usuario_id }}</b
                >?</span
            >
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" text @click="deletUsuarioModal = false" />
            <Button label="Yes" icon="pi pi-check" text @click="deleteUsuario" />
        </template>
    </Dialog>
</template>
