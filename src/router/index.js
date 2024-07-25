import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';
import AuthAPI from '../api/AuthAPI';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            meta: { requiresAuth: true },
            children: [
                {
                    path: '/',
                    name: 'home',
                    component: () => import('@/views/Home.vue')
                },
                {
                    path: '/about',
                    name: 'About',
                    component: () => import('@/views/pages/AboutUs.vue')
                },
                {
                    path: '/configuracion',
                    name: 'configuracion',
                    component: () => import('@/views/configuracionView.vue')
                },
                // Rutas de Administrador
                {
                    path: '/admin/preregister',
                    name: 'preregister',
                    component: () => import('@/views/administrador/PreregisterView.vue'),
                    meta: { roles: ['Administrador'] }
                },
                {
                    path: '/admin/documentacionAlumnos',
                    name: 'documentacionAdmin',
                    component: () => import('@/views/administrador/documentacionAlumnosView.vue'),
                    meta: { roles: ['Administrador'] }
                },
                {
                    path: '/admin/documentacionDocentes',
                    name: 'documentacionDocentesAdmin',
                    component: () => import('@/views/administrador/documentacionDocentesView.vue'),
                    meta: { roles: ['Administrador'] }
                },
                {
                    path: '/admin/alumnos',
                    name: 'alumnosAdmin',
                    component: () => import('@/views/administrador/alumnosView.vue'),
                    meta: { roles: ['Administrador'] }
                },
                {
                    path: '/admin/docentes',
                    name: 'docentesAdmin',
                    component: () => import('@/views/administrador/docentesView.vue'),
                    meta: { roles: ['Administrador'] }
                },
                {
                    path: '/admin/evidenciasDocentes',
                    name: 'evidenciasDocentesAdmin',
                    component: () => import('@/views/administrador/evidenciasDocentesView.vue'),
                    meta: { roles: ['Administrador'] }
                },
                {
                    path: '/admin/seminarios',
                    name: 'seminario',
                    component: () => import('@/views/administrador/seminarioView.vue'),
                    meta: { roles: ['Administrador'] }
                },
                {
                    path: '/admin/materias',
                    name: 'materias',
                    component: () => import('@/views/administrador/materiasView.vue'),
                    meta: { roles: ['Administrador'] }
                },
                {
                    path: '/admin/carreras',
                    name: 'carreras',
                    component: () => import('@/views/administrador/carrerasView.vue'),
                    meta: { roles: ['Administrador'] }
                },
                {
                    path: '/admin/createSeminarios',
                    name: 'createSeminarios',
                    component: () => import('@/views/administrador/createSeminariosView.vue'),
                    meta: { roles: ['Administrador'] }
                },
                {
                    path: '/admin/detalleCurso/:id',
                    name: 'detalleCurso',
                    component: () => import('@/views/administrador/detalleCursoView.vue'),
                    meta: { roles: ['Administrador'] }
                },
                {
                    path: '/admin/detalleCursoFinalizado/:id',
                    name: 'detalleCursoFinalizado',
                    component: () => import('@/views/administrador/detalleCursoFinalizadoView.vue'),
                    meta: { roles: ['Administrador'] }
                },
                {
                    path: '/admin/usuarios',
                    name: 'usuariosView',
                    component: () => import('@/views/administrador/usuariosView.vue'),
                    meta: { roles: ['Administrador'] }
                },
                {
                    path: '/admin/roles',
                    name: 'rolesView',
                    component: () => import('@/views/administrador/rolesView.vue'),
                    meta: { roles: ['Administrador'] }
                },
                {
                    path: '/admin/tipoEvidencias',
                    name: 'tipoEvidenciaView',
                    component: () => import('@/views/administrador/tipoEvidenciasView.vue'),
                    meta: { roles: ['Administrador'] }
                },
                {
                    path: '/admin/documentos',
                    name: 'documentosView',
                    component: () => import('@/views/administrador/documentosView.vue'),
                    meta: { roles: ['Administrador'] }
                },
                {
                    path: '/admin/periodos',
                    name: 'periodosView',
                    component: () => import('@/views/administrador/periodosView.vue'),
                    meta: { roles: ['Administrador'] }
                },
                // Rutas de alumno
                {
                    path: 'alumnos/subirArchivos',
                    name: 'subirArchivos',
                    component: () => import('@/views/alumnos/subirArchivos.vue'),
                    meta: { roles: ['Alumno'] }
                },
                {
                    path: 'alumnos/modulos',
                    name: 'modulosAlumnos',
                    component: () => import('@/views/alumnos/moduloView.vue'),
                    meta: { roles: ['Alumno'] }
                },
                {
                    path: 'alumnos/registrarTesina',
                    name: 'registrarTesina',
                    component: () => import('@/views/alumnos/registroTesinaView.vue'),
                    meta: { roles: ['Alumno'] }
                },
                // Rutas docentes
                {
                    path: '/docentes/documentacion',
                    name: 'documentacionDocente',
                    component: () => import('@/views/docentes/documentacionView.vue'),
                    meta: { roles: ['Docente'] }
                },
                {
                    path: '/docentes/asesorias',
                    name: 'asesorias',
                    component: () => import('@/views/docentes/asesoriasView.vue'),
                    meta: { roles: ['Docente'] }
                },
                {
                    path: '/docentes/modulos',
                    name: 'modulos',
                    component: () => import('@/views/docentes/modulosView.vue'),
                    meta: { roles: ['Docente'] }
                },
                {
                    path: '/docentes/evidencias',
                    name: 'evidencias',
                    component: () => import('@/views/docentes/evidenciasView.vue'),
                    meta: { roles: ['Docente'] }
                }
            ]
        },
        {
            path: '/auth',
            name: 'auth',
            component: () => import('@/views/auth/AuthLayout.vue'),
            children: [
                {
                    path: 'registro',
                    name: 'Preregistro',
                    component: () => import('@/views/auth/RegisterView.vue')
                },
                {
                    path: 'login',
                    name: 'Login',
                    component: () => import('@/views/auth/LoginView.vue')
                },
                {
                    path: 'recuperarcontrasena',
                    name: 'RecuperarContrasena',
                    component: () => import('@/views/auth/recuperarContrasena.vue')
                },
                {
                    path: 'nuevacontrasena/:token',
                    name: 'nuevacontrasena',
                    component: () => import('@/views/auth/nuevaContrasenaView.vue')
                }
            ]
        },
        {
            path: '/no-autorizado',
            name: 'NoAutorizado',
            component: () => import('@/views/pages/Unauthorized.vue')
        },
        {
            path: '/:catchAll(.*)',
            name: '404',
            component: () => import('@/views/pages/NotFound.vue')
        },
        // Rutas de impresion pdf
        {
            path: '/imprimir',
            name: 'imprimirPDF',
            children: [
                {
                    path: 'constanciaEstudios',
                    name: 'constanciaEstudios',
                    component: () => import('@/views/administrador/archivosPDF/hojaConstanciaDeEstudios.vue'),
                    props: (route) => ({ alumno: JSON.parse(route.query.alumno) }),
                    meta: { roles: ['Administrador'] }
                },
                {
                    path: 'constanciaNoAdeudo',
                    name: 'constanciaNoAdeudo',
                    component: () => import('@/views/administrador/archivosPDF/hojaConstanciaNoAdeudo.vue'),
                    props: (route) => ({ alumno: JSON.parse(route.query.alumno) }),
                    meta: { roles: ['Administrador'] }
                },
                {
                    path: 'hojaCalificaciones',
                    name: 'hojaCalificaciones',
                    component: () => import('@/views/administrador/archivosPDF/hojaCalificaciones.vue'),
                    props: (route) => ({ alumnos: JSON.parse(route.query.alumnos) }),
                    meta: { roles: ['Administrador'] }
                }
            ]
        }
    ]
});
router.beforeEach(async (to, from, next) => {
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
    let userRoles = []; // Aquí almacenaremos los roles del usuario

    try {
        const response = await AuthAPI.auth(); // Suponiendo que esto devuelve la información del usuario
        if (response && response.data && response.data.roles) {
            // Extraemos los roles del usuario
            userRoles = response.data.roles.map((role) => role.nombre_rol);
        }

        if (to.matched.some((record) => record.name === 'Login' || record.name === 'Preregistro')) {
            next({ name: 'home' });
        } else if (requiresAuth && to.meta.roles) {
            const hasPermission = to.meta.roles.some((role) => userRoles.includes(role));
            if (!hasPermission) {
                // Si el usuario no tiene ningún rol que le permita acceder a la ruta
                next({ name: 'NoAutorizado' });
            } else {
                next();
            }
        } else {
            next();
        }
    } catch (error) {
        if (requiresAuth) {
            next({ name: 'Login' });
        } else {
            next();
        }
    }
});

export default router;
