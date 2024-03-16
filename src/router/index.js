import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue')
                },
                {
                    path: '/alumnos',
                    name: 'alumnos',
                    component: () => import('@/views/pages/Empty.vue')
                },
                {
                    path: '/subirArchivos',
                    name: 'subirArchivos',
                    component: () => import('@/views/pages/Empty.vue')
                },
                {
                    path: '/pages/empty',
                    name: 'empty',
                    component: () => import('@/views/pages/Empty.vue')
                },
                {
                    path: '/pages/crud',
                    name: 'crud',
                    component: () => import('@/views/pages/Crud.vue')
                }
            ]
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
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
                }
            ]
        }
    ]
});

export default router;
