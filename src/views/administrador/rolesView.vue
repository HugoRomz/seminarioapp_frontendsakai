<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, inject, onMounted } from 'vue';
import catalogoApi from '../../api/catalogoApi.js';
import Spinner from '../../components/Spinner.vue';

const toast = inject('toast');

const roles = ref(null);
const filters = ref();
const loading = ref(null);
const dt = ref();

const isEditMode = ref(false);

const rolEdit = ref({});
const deleteRolModal = ref(false);
const rolModal = ref(false);
const submitted = ref(false);

const loadRoles = async () => {
    loading.value = true;
    try {
        const response = await catalogoApi.findRoles();
        roles.value = response.data;
    } catch (error) {
        toast.open({
            message: error.response && error.response.data.msg ? error.response.data.msg : 'Error desconocido',
            type: 'error'
        });
    } finally {
        loading.value = false;
    }
};

onMounted(loadRoles);

const openNew = () => {
    rolEdit.value = {};
    submitted.value = false;
    rolModal.value = true;
    isEditMode.value = false;
};

const hideDialog = () => {
    rolModal.value = false;
    submitted.value = false;
};

const saveRol = async () => {
    submitted.value = true;
    if (rolEdit.value.nombre_rol.trim()) {
        loading.value = true;
        try {
            let response;
            if (isEditMode.value) {
                response = await catalogoApi.updateRol(rolEdit.value);
                toast.open({
                    message: response.data.msg,
                    type: 'success'
                });
            } else {
                response = await catalogoApi.createRol(rolEdit.value);
                toast.open({
                    message: response.data.msg,
                    type: 'success'
                });
            }
            rolModal.value = false;
            rolEdit.value = {};
            isEditMode.value = false;
            await loadRoles();
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

const confirmDeleteRol = (editRol) => {
    rolEdit.value = editRol;
    deleteRolModal.value = true;
};

const editRol = (editRol) => {
    const rolesData = { ...editRol };
    rolEdit.value = rolesData;
    rolModal.value = true;
    isEditMode.value = true;
};

const deleteRol = async () => {
    loading.value = true;

    try {
        const response = await catalogoApi.deleteRol(rolEdit.value.rol_id);
        toast.open({
            message: response.data.msg,
            type: 'success'
        });
        deleteRolModal.value = false;
        rolEdit.value = {};
        await loadRoles();
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

const items = ref([{ label: 'Catalogo' }, { label: 'Roles', route: '/admin/roles' }]);
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
                                <Button label="Nuevo Rol" icon="pi pi-plus" class="mr-2" severity="success" @click="openNew" />
                            </div>
                        </template>

                        <template v-slot:end>
                            <Button label="Exportar" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
                        </template>
                    </Toolbar>

                    <div class="card">
                        <DataTable
                            ref="dt"
                            :value="roles"
                            dataKey="id"
                            :paginator="true"
                            :rows="10"
                            :filters="filters"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            :rowsPerPageOptions="[5, 10, 25]"
                            currentPageReportTemplate="Mostrando del {first} al {last} de {totalRecords} roles"
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
                                <Button icon="pi pi-refresh" @click="loadRoles" />
                            </template>
                            <Column field="rol_id" header="ID Rol" :sortable="true"></Column>
                            <Column field="nombre_rol" header="Nombre del Rol" :sortable="true"></Column>

                            <Column headerStyle="min-width:10rem;" header="Acciones">
                                <template #body="{ data }">
                                    <Button icon="pi pi-pencil" class="mr-2" severity="success" rounded @click="editRol(data)" />
                                    <Button icon="pi pi-trash" class="mt-2" severity="warning" rounded @click="confirmDeleteRol(data)" />
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                </template>
            </Card>
        </div>
    </div>
    <Dialog v-model:visible="rolModal" :header="isEditMode ? 'Datos del Rol - Editar' : 'Datos del Rol - Registrar'" :modal="true" class="p-fluid">
        <div class="field" v-if="isEditMode">
            <label for="rol_id">ID Rol</label>
            <InputText id="rol_id" :disabled="isEditMode" v-model.trim="rolEdit.rol_id" />
        </div>
        <div class="field">
            <label for="nombre_rol">Nombre del Rol</label>
            <InputText id="nombre_rol" v-model.trim="rolEdit.nombre_rol" required="true" :invalid="submitted && !rolEdit.nombre_rol" />
            <small class="p-invalid" v-if="submitted && !rolEdit.nombre_rol">El nombre del rol es requerida.</small>
        </div>

        <!-- </ScrollPanel> -->
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" text="" @click="hideDialog" />
            <Button label="Guardar" icon="pi pi-check" text="" @click="saveRol" />
        </template>
    </Dialog>

    <Dialog v-model:visible="deleteRolModal" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="rolEdit"
                >¿Estás seguro que quieres eliminar a ID Rol: <b>{{ rolEdit.rol_id }}</b
                >?</span
            >
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" text @click="deleteRolModal = false" />
            <Button label="Yes" icon="pi pi-check" text @click="deleteRol" />
        </template>
    </Dialog>
</template>
