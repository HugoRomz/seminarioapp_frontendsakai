<script setup>
import UserApi from '../../api/UserApi';
import { ref, inject, onMounted } from 'vue';
import { FilterMatchMode } from 'primevue/api';
import { useConfirm } from 'primevue/useconfirm';
const confirmPopup = useConfirm();

import Spinner from '../../components/Spinner.vue';

const isAccepting = ref(false);

const toast = inject('toast');

const users = ref(null);
const filters = ref();
const loading = ref(null);

const loadUsers = async () => {
    loading.value = true;
    try {
        const response = await UserApi.all();
        users.value = response.data;
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(loadUsers);

const aceptarUsuario = async (userData) => {
    isAccepting.value = true;
    try {
        const response = await UserApi.create(userData);
        toast.open({
            message: response.data.msg,
            type: 'success'
        });
        loadUsers(); // Recarga los usuarios después de aceptar uno
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
                loadUsers();
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
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        egresado: { value: null, matchMode: FilterMatchMode.EQUALS }
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
            <div class="card bg-white shadow-xl rounded-lg p-5 border border-gray-200">
                <h5 class="text-xl font-bold mb-4 border-b border-gray-200 pb-2">TABLA DE PRE REGISTROS</h5>
                <DataTable :value="users" paginator :rows="10" ref="dt" :rowsPerPageOptions="[5, 10, 20, 50]" v-model:filters="filters" filterDisplay="row" tableStyle="min-width: 50rem">
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
                    <template #paginatorend>
                        <Button type="button" icon="pi pi-download" text @click="exportCSV($event)" />
                    </template>
                    <Column field="matricula" header="Matricula" :sortable="true"></Column>
                    <Column field="nombres" header="Nombres" :sortable="true"></Column>
                    <Column field="apellidos" header="Apellidos" :sortable="true"></Column>
                    <Column field="carrera" header="Carrera" :sortable="true"></Column>
                    <Column field="email_usuario" header="Email" :sortable="true"></Column>
                    <Column field="egresado" header="Egresado" dataType="boolean" style="min-width: 8rem" :sortable="true">
                        <template #body="{ data }">
                            <i class="pi" :class="{ 'pi-check-circle text-green-500 ': data.egresado, 'pi-times-circle text-red-500': !data.egresado }"></i>
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <TriStateCheckbox v-model="filterModel.value" @change="filterCallback()" />
                        </template>
                    </Column>
                    <Column header="Acciones" bodyStyle="text-align:center" style="min-width: 10rem">
                        <template #body="{ data }">
                            <Button @click="aceptarUsuario(data)" class="p-button-success mr-2 mb-2">Aceptar</Button>
                            <ConfirmPopup></ConfirmPopup>
                            <Button @click="rechazarUsuario(data)" class="p-button-danger mr-2 mb-2">Rechazar</Button>
                        </template>
                    </Column>

                    <template #footer> En total hay {{ users ? users.length : 0 }} usuarios. </template>
                </DataTable>
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
