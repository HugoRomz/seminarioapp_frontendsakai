<script setup>
import { ref, computed, onMounted } from 'vue';
import AuthAPI from '../api/AuthAPI';
import AppMenuItem from './AppMenuItem.vue';

const users = ref(null);

onMounted(async () => {
    try {
        const response = await AuthAPI.auth();
        users.value = response.data;
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
});

const model = ref([
    {
        label: 'Home',
        items: [{ label: 'Home', icon: 'pi pi-fw pi-home', to: '/' }],
        roles: ['Administrador', 'Docente', 'Alumno', 'Asistente']
    },
    {
        label: 'Administrador',
        items: [
            {
                label: 'Seminarios',
                icon: 'pi pi-th-large',
                to: '/admin/seminarios'
            },
            {
                label: 'Preinscripción',
                icon: 'pi pi-users',
                to: '/admin/preregister'
            },
            {
                label: 'Documentación Alumnos',
                icon: 'pi pi-file-check',
                to: '/admin/documentacionAlumnos'
            },
            {
                label: 'Documentación Docentes',
                icon: 'pi pi-file-check',
                to: '/admin/documentacionDocentes'
            },
            {
                label: 'Alumnos',
                icon: 'pi pi-user-plus',
                to: '/admin/alumnos'
            },
            {
                label: 'Docentes',
                icon: 'pi pi-book',
                to: '/admin/docentes'
            },
            {
                label: 'Evidencias',
                icon: 'pi pi-book',
                to: '/admin/evidenciasDocentes'
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
                to: '/alumnos/subirArchivos'
            },
            {
                label: 'Calificaciones',
                icon: 'pi pi-file-plus',
                to: '/alumnos/modulos'
            }
        ],
        roles: ['Alumno']
    },
    {
        label: 'Docentes',
        items: [
            {
                label: 'Documentación',
                icon: 'pi pi-file-plus',
                to: '/docentes/documentacion'
            },
            {
                label: 'Módulos',
                icon: 'pi pi-box',
                to: '/docentes/modulos'
            },
            {
                label: 'Evidencias',
                icon: 'pi pi-file',
                to: '/docentes/evidencias'
            },
            {
                label: 'Asesorias',
                icon: 'pi pi-desktop',
                to: '/docentes/asesorias'
            }
        ],
        roles: ['Docente']
    },
    {
        label: 'Otros',
        items: [
            {
                label: 'Configuración',
                icon: 'pi pi-cog',
                to: '/configuracion'
            }
        ],
        roles: ['Administrador', 'Docente', 'Alumno', 'Asistente']
    }
]);

const filteredMenuItems = computed(() => {
    const userRoles = (users.value?.roles ?? []).map((rol) => rol.nombre_rol);
    return model.value.filter((section) => section.roles?.some((role) => userRoles.includes(role)) || section.roles === undefined);
});
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in filteredMenuItems" :key="i">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
