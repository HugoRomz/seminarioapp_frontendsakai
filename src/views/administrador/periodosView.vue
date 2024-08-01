<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, inject, onMounted } from 'vue';
import catalogoApi from '../../api/catalogoApi.js';
import Spinner from '../../components/Spinner.vue';

const toast = inject('toast');

const periodos = ref(null);
const filters = ref();
const loading = ref(null);
const dt = ref();

const isEditMode = ref(false);

const periodoEdit = ref({});
const deletePeriodoModal = ref(false);
const periodoModal = ref(false);
const submitted = ref(false);

const loadPeriodos = async () => {
    loading.value = true;
    try {
        const response = await catalogoApi.findPeriodos();
        periodos.value = response.data;
    } catch (error) {
        toast.open({
            message: error.response && error.response.data.msg ? error.response.data.msg : 'Error desconocido',
            type: 'error'
        });
    } finally {
        loading.value = false;
    }
};

onMounted(loadPeriodos);

const openNew = () => {
    periodoEdit.value = {};
    submitted.value = false;
    periodoModal.value = true;
    isEditMode.value = false;
};

const hideDialog = () => {
    periodoModal.value = false;
    submitted.value = false;
};

const savePeriodo = async () => {
    submitted.value = true;
    if (periodoEdit.value.fecha_inicio !== null && periodoEdit.value.fecha_fin !== null) {
        loading.value = true;
        try {
            let response;
            if (isEditMode.value) {
                response = await catalogoApi.updatePeriodo(periodoEdit.value);
                toast.open({
                    message: response.data.msg,
                    type: 'success'
                });
            } else {
                response = await catalogoApi.createPeriodo(periodoEdit.value);
                toast.open({
                    message: response.data.msg,
                    type: 'success'
                });
            }
            periodoModal.value = false;
            periodoEdit.value = {};
            isEditMode.value = false;
            await loadPeriodos();
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

const confirmDeletePeriodo = (editPeriodo) => {
    periodoEdit.value = editPeriodo;
    deletePeriodoModal.value = true;
};

const editPeriodo = (editPeriodo) => {
    const periodosData = { ...editPeriodo };
    periodoEdit.value = periodosData;
    periodoModal.value = true;
    isEditMode.value = true;
};

const deletePeriodo = async () => {
    loading.value = true;

    try {
        const response = await catalogoApi.deletePeriodo(periodoEdit.value.periodo_id);
        toast.open({
            message: response.data.msg,
            type: 'success'
        });
        deletePeriodoModal.value = false;
        periodoEdit.value = {};
        await loadPeriodos(); // Recarga la lista de usuarios
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

const items = ref([{ label: 'Catalogo' }, { label: 'Períodos', route: '/admin/periodos' }]);
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
                                <Button label="Nuevo Período" icon="pi pi-plus" class="mr-2" severity="success" @click="openNew" />
                            </div>
                        </template>

                        <template v-slot:end>
                            <Button label="Exportar" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
                        </template>
                    </Toolbar>

                    <div class="card">
                        <DataTable
                            ref="dt"
                            :value="periodos"
                            dataKey="id"
                            :paginator="true"
                            :rows="10"
                            :filters="filters"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            :rowsPerPageOptions="[5, 10, 25]"
                            currentPageReportTemplate="Mostrando del {first} al {last} de {totalRecords} periodos"
                            sortField="descripcion"
                            :sortOrder="1"
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
                                <Button icon="pi pi-refresh" @click="loadPeriodos" />
                            </template>
                            <Column field="periodo_id" header="ID Período" :sortable="true"></Column>
                            <Column field="descripcion" header="Nombre del Período" :sortable="true"></Column>
                            <Column field="fecha_inicio" header="Fecha Inicio"></Column>
                            <Column field="fecha_fin" header="Fecha Fin"></Column>
                            <Column field="status" header="Status" dataType="string" style="min-width: 8rem" :sortable="true">
                                <template #body="{ data }">
                                    <i
                                        class="pi"
                                        :class="{
                                            'pi-check-circle text-green-500': data.status === true,
                                            'pi-times-circle text-red-500': data.status !== true
                                        }"
                                    ></i>
                                </template>
                                <template #filter="{ filterModel, filterCallback }">
                                    <TriStateCheckbox v-model="filterModel.value" @change="filterCallback()" />
                                </template>
                            </Column>

                            <Column headerStyle="min-width:10rem;" header="Acciones">
                                <template #body="{ data }">
                                    <Button icon="pi pi-pencil" class="mr-2" severity="success" rounded @click="editPeriodo(data)" />
                                    <Button icon="pi pi-trash" class="mt-2" severity="warning" rounded @click="confirmDeletePeriodo(data)" />
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                </template>
            </Card>
        </div>
    </div>
    <Dialog v-model:visible="periodoModal" :header="isEditMode ? 'Datos del Período - Editar' : 'Datos de Período - Registrar'" :modal="true" class="p-fluid">
        <div class="field" v-if="isEditMode">
            <label for="periodo_id">ID Período</label>
            <InputText id="periodo_id" :disabled="isEditMode" v-model.trim="periodoEdit.periodo_id" />
        </div>
        <div class="field" v-if="isEditMode">
            <label for="descripcion">Nombre del Período</label>
            <InputText id="descripcion" v-model.trim="periodoEdit.descripcion" :disabled="isEditMode" :invalid="submitted && !periodoEdit.descripcion" />
        </div>
        <div class="field">
            <label for="fecha_inicio">Fecha de inicio</label>
            <Calendar id="fecha_inicio" :showIcon="true" :showButtonBar="true" v-model.trim="periodoEdit.fecha_inicio" :minDate="new Date(new Date().setDate(new Date().getDate() - 14))"> </Calendar>
        </div>
        <div class="field">
            <label for="fecha_fin">Fecha de Cierre</label>
            <Calendar id="fecha_fin" :showIcon="true" :showButtonBar="true" v-model.trim="periodoEdit.fecha_fin" :minDate="isEditMode ? null : periodoEdit.fecha_inicio"></Calendar>
        </div>

        <!-- </ScrollPanel> -->
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" text="" @click="hideDialog" />
            <Button label="Guardar" icon="pi pi-check" text="" @click="savePeriodo" />
        </template>
    </Dialog>

    <Dialog v-model:visible="deletePeriodoModal" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="periodoEdit"
                >¿Estás seguro que quieres eliminar a ID Período: <b>{{ periodoEdit.periodo_id }}</b
                >?</span
            >
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" text @click="deletePeriodoModal = false" />
            <Button label="Yes" icon="pi pi-check" text @click="deletePeriodo" />
        </template>
    </Dialog>
</template>
