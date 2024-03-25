<script setup>
import UserApi from '../../api/UserApi';
import { ref, onBeforeMount } from 'vue';

const users = ref(null);

const loading = ref(null);

const loadUsers = () => {
    loading.value = true;
    UserApi.all()
        .then((response) => {
            users.value = response.data;
            loading.value = false;
        })
        .catch((error) => {
            console.error('Error al obtener los usuarios:', error);
            loading.value = false;
        });
};

onBeforeMount(() => {
    loadUsers();
});
const aceptarUsuario = (userData) => {
    console.log('Aceptar usuario:', userData);
};

const rechazarUsuario = (userData) => {
    console.log('Rechazar usuario:', userData);
};

const dt = ref();
const exportCSV = () => {
    dt.value.exportCSV();
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card bg-white shadow-xl rounded-lg p-5 border border-gray-200">
                <h5 class="text-xl font-bold mb-4 border-b border-gray-200 pb-2">Filter Menu</h5>
                <DataTable :value="users" paginator :rows="10" ref="dt" :rowsPerPageOptions="[5, 10, 20, 50]" tableStyle="min-width: 50rem">
                    <template #header>
                        <div class="flex flex-wrap items-center justify-between gap-2">
                            <span class="text-xl text-surface-900 dark:text-surface-0 font-bold">Pre registros</span>
                            <Button icon="pi pi-refresh" @click="loadUsers" rounded raised />
                        </div>
                    </template>
                    <template #paginatorstart>
                        <Button icon="pi pi-refresh" @click="loadUsers" />
                    </template>
                    <template #paginatorend>
                        <Button type="button" icon="pi pi-download" text @click="exportCSV($event)" />
                    </template>
                    <Column field="matricula" header="Matricula"></Column>
                    <Column field="nombres" header="Nombres"></Column>
                    <Column field="apellidos" header="Apellidos"></Column>
                    <Column field="carrera" header="Carrera"></Column>
                    <Column field="email_usuario" header="Email"></Column>
                    <Column field="egresado" header="Egresado" dataType="boolean" bodyClass="text-center" style="min-width: 8rem">
                        <template #body="{ data }">
                            <i class="pi" :class="{ 'pi-check-circle text-green-500 ': data.egresado, 'pi-times-circle text-red-500': !data.egresado }"></i>
                        </template>
                    </Column>
                    <Column header="Acciones" bodyStyle="text-align:center" style="min-width: 10rem">
                        <template #body="{ data }">
                            <button @click="aceptarUsuario(data)" class="text-white bg-[#218c74] hover:bg-[#196655] font-medium rounded-lg text-sm px-[24px] py-2.5 mr-2 mb-2">Aceptar</button>
                            <button @click="rechazarUsuario(data)" class="text-white bg-[#ff5252] hover:bg-red-600 font-medium rounded-lg text-sm px-[20px] py-2.5 mr-2 mb-2">Rechazar</button>
                        </template>
                    </Column>

                    <template #footer> In total there are {{ users ? users.length : 0 }} users. </template>
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
