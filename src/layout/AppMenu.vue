<script setup>
import { ref, computed } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

import { useUser } from '../stores/user';

const user = useUser();

const model = ref([
    {
        label: 'Home',
        items: [{ label: 'Home', icon: 'pi pi-fw pi-home', to: '/' }],
        roles: ['Administrador', 'Profesor', 'Alumno', 'Asistente']
    },
    {
        label: 'Administrador',
        items: [
            {
                label: 'Preinscripción',
                icon: 'pi pi-cloud-upload',
                to: '/pages/empty'
            },
            {
                label: 'Documentación',
                icon: 'pi pi-cloud-upload',
                to: '/pages/empty'
            },
            {
                label: 'Docentes',
                icon: 'pi pi-cloud-upload',
                to: '/pages/empty'
            },
            {
                label: 'Seminarios',
                icon: 'pi pi-cloud-upload',
                to: '/pages/empty'
            }
        ],
        roles: ['Administrador']
    },
    {
        label: 'Alumnos',
        items: [
            {
                label: 'Subir Archivos',
                icon: 'pi pi-cloud-upload',
                to: '/subirArchivos'
            }
        ],
        roles: ['Alumno']
    },
    {
        label: 'Docentes',
        items: [
            {
                label: 'Documentación',
                icon: 'pi pi-cloud-upload',
                to: '/pages/empty'
            },
            {
                label: 'Módulos',
                icon: 'pi pi-cloud-upload',
                to: '/pages/empty'
            },
            {
                label: 'Evidencias',
                icon: 'pi pi-cloud-upload',
                to: '/pages/empty'
            },
            {
                label: 'Asesorias',
                icon: 'pi pi-cloud-upload',
                to: '/pages/empty'
            }
        ],
        roles: ['Profesor']
    }
]);

const filteredMenuItems = computed(() => {
    const userRoles = (user.getUser.roles ?? []).map((rol) => rol.nombre_rol);
    return model.value.filter((section) => section.roles?.some((role) => userRoles.includes(role)) || section.roles === undefined);
});
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in filteredMenuItems" :key="i">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
        <p>{{ user.getUser.roles }}</p>
    </ul>
</template>

<style lang="scss" scoped></style>
