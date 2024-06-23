<script setup>
import UserApi from '../../api/UserApi';
import { ref, inject, onMounted, watch } from 'vue';
import { FilterMatchMode } from 'primevue/api';
import { useConfirm } from 'primevue/useconfirm';
const confirmPopup = useConfirm();

import Spinner from '../../components/Spinner.vue';

const isAccepting = ref(false);
const toast = inject('toast');
const expandedRowGroups = ref();
const users = ref(null);
const filters = ref();
const loading = ref(null);
const selectedPeriodos = ref(null);
const periodos = ref([]);
const submitted = ref(false);

watch(selectedPeriodos, async (newValue) => {
    if (newValue && newValue.value.periodo_id) {
        await loadUsers(newValue.value.periodo_id);
    }
});

const loadUsers = async (periodoId) => {
    loading.value = true;
    isAccepting.value = true;
    try {
        const response = await UserApi.all(periodoId);
        users.value = response.data.sort((a) => (a.status === true ? -1 : 1));
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
    } finally {
        loading.value = false;
        isAccepting.value = false;
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

const aceptarUsuario = async (userData) => {
    isAccepting.value = true;
    try {
        const response = await UserApi.create(userData);
        toast.open({
            message: response.data.msg,
            type: 'success'
        });
        loadUsers(selectedPeriodos.value.periodo_id); // Recarga los usuarios después de aceptar uno
    } catch (error) {
        toast.open({
            message: error.response.data.msg,
            type: 'error'
        });
    } finally {
        isAccepting.value = false; // Detener spinner
    }
};

const rechazarUsuario = async (userData) => {
    confirmPopup.require({
        target: event.target,
        message: '¿Estás seguro de que quieres rechazar a este usuario?',
        acceptLabel: 'Sí, rechazar',
        rejectLabel: 'Cancelar',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            isAccepting.value = true;
            try {
                const response = await UserApi.delete(userData.id);
                toast.open({
                    message: response.data.msg,
                    type: 'success'
                });
                loadUsers(selectedPeriodos.value.periodo_id);
            } catch (error) {
                toast.open({
                    message: error.response.data.msg,
                    type: 'error'
                });
            } finally {
                isAccepting.value = false;
            }
        }
    });
};

const dt = ref();
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

const getRandomPastelColor = () => {
    const pastelColors = ['#ffd1dc', '#ffb6c1', '#ffa07a', '#ffdead', '#f0e68c', '#98fb98', '#afeeee', '#add8e6', '#b0e0e6', '#e0ffff'];
    return pastelColors[Math.floor(Math.random() * pastelColors.length)];
};
</script>

<template>
    <Spinner v-if="isAccepting" />
    <div class="grid">
        <div class="col-12">
            <card class="mb-4">
                <template #content>
                    <div class="flex align-items-center gap-2">
                        <h2 class="m-0 mr-5 font-medium text-lg">Seleccione el periodo para ver los preregistros:</h2>
                        <Dropdown id="period" v-model="selectedPeriodos" :options="periodos" optionLabel="descripcion" placeholder="Selecciona el periodo" @change="handlePeriodChange" :invalid="submitted && !selectedPeriodos" :filter="true">
                            <template #option="{ option }">
                                {{ option.descripcion }}
                            </template>
                        </Dropdown>
                    </div>
                </template>
            </card>
            <div v-if="selectedPeriodos">
                <div class="card bg-white shadow-xl rounded-lg p-5 border border-gray-200">
                    <h5 class="text-xl font-bold mb-4 border-b border-gray-200 pb-2">TABLA DE PRE REGISTROS</h5>
                    <DataTable v-model:expandedRowGroups="expandedRowGroups" v-model:filters="filters" :value="users" tableStyle="min-width: 50rem" expandableRowGroups rowGroupMode="subheader" groupRowsBy="nombres">
                        <template #header>
                            <div class="flex justify-content-between flex-column sm:flex-row">
                                <Button type="button" icon="pi pi-filter-slash" label="Limpiar" outlined @click="clearFilter()" />
                                <IconField iconPosition="left">
                                    <InputIcon class="pi pi-search" />
                                    <InputText v-model="filters['global'].value" placeholder="Búsqueda por palabra clave" style="width: 100%" />
                                </IconField>
                            </div>
                        </template>
                        <template #groupheader="slotProps">
                            <Avatar :label="slotProps ? slotProps.data.nombres.charAt(0) : ''" class="mr-2" size="large" :style="{ backgroundColor: getRandomPastelColor() }" shape="circle" />
                            <span class="vertical-align-center ml-2 font-bold text-base">
                                <span class="text-xl uppercase">{{ slotProps.data.id_estudiante }}</span>
                                - {{ slotProps.data.nombres }} {{ slotProps.data.apellidos }} - {{ slotProps.data.curp }}
                                <span class="font-normal">- {{ slotProps.data.cursos_periodo.curso.nombre_curso }}</span>
                            </span>
                        </template>
                        <template #empty> No hay preregistros. </template>
                        <template #loading> Cargando... por favor espera </template>
                        <template #paginatorstart>
                            <Button icon="pi pi-refresh" @click="loadSeminarios" />
                        </template>
                        <template #paginatorend>
                            <Button type="button" icon="pi pi-download" text @click="exportCSV($event)" />
                        </template>
                        <Column field="id_estudiante" hidden></Column>
                        <!-- Columnas ocultas para que funcione el filtro por busqueda -->
                        <Column field="nombres" hidden></Column>
                        <Column field="apellidos" hidden></Column>
                        <Column field="curp" hidden></Column>
                        <Column field="cursos_periodo.curso.nombre_curso" hidden></Column>

                        <Column field="email_usuario" header="Email" :sortable="true"></Column>
                        <Column field="telefono" header="Telefono" :sortable="true" style="width: 10rem"></Column>
                        <Column field="nombre_carrera" header="Carrera" :sortable="true"></Column>
                        <Column field="anio_egreso" header="Año de Egreso" :sortable="true">
                            <template #body="{ data }">
                                <template v-if="data.anio_egreso !== null">
                                    {{ data.anio_egreso }}
                                </template>
                                <template v-else> Aun no egresa </template>
                            </template>
                        </Column>
                        <Column field="trabajando" header="¿Trabaja?" dataType="boolean" :sortable="true">
                            <template #body="{ data }">
                                <i class="pi" :class="{ 'pi-check-circle text-green-500 ': data.trabajando, 'pi-times-circle text-red-500': !data.trabajando }"></i>
                            </template>
                        </Column>
                        <Column field="lugar_trabajo" header="Lugar de Trabajo" :sortable="true">
                            <template #body="{ data }">
                                <template v-if="data.trabajando">
                                    {{ data.lugar_trabajo }}
                                </template>
                                <template v-else> No está trabajando </template>
                            </template>
                        </Column>
                        <Column field="checkSeminario" header="¿Ingresar a otro seminario?" dataType="boolean" :sortable="true" style="width: 3rem">
                            <template #body="{ data }">
                                <i class="pi" :class="{ 'pi-check-circle text-green-500 ': data.checkSeminario, 'pi-times-circle text-red-500': !data.checkSeminario }"></i>
                            </template>
                        </Column>
                        <Column field="egresado" header="Egresado" dataType="boolean" style="min-width: 8rem" :sortable="true">
                            <template #body="{ data }">
                                <i class="pi" :class="{ 'pi-check-circle text-green-500 ': data.egresado, 'pi-times-circle text-red-500': !data.egresado }"></i>
                            </template>
                        </Column>
                        <Column field="status" header="Status" :sortable="true">
                            <template #body="{ data }">
                                <Tag :severity="data.status ? 'warning' : 'success'" :value="data.status ? 'Pendiente' : 'Revisado'" />
                            </template>
                        </Column>
                        <Column header="Acciones" bodyStyle="text-align:center" style="width: 16rem">
                            <template #body="{ data }">
                                <!-- Botón de aceptar deshabilitado si el status es false -->
                                <Button @click="aceptarUsuario(data)" class="p-button-success mr-2 mb-2" :disabled="!data.status">Aceptar</Button>
                                <!-- Botón de rechazar deshabilitado si el status es false -->
                                <Button @click="rechazarUsuario(data)" class="p-button-danger mr-2 mb-2" :disabled="!data.status">Rechazar</Button>
                            </template>
                        </Column>
                        <template #footer> En total hay {{ users ? users.length : 0 }} usuarios. </template>
                    </DataTable>
                </div>
            </div>
            <div v-else>
                <div class="card">Por favor, selecciona un periodo.</div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
:deep(.p-datatable-frozen-tbody) {
    font-weight: bold;
}

:deep(.p-datatable-scrollable .p-frozen-column) {
    font-weight: bold;
}
</style>
