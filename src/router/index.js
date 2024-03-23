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
                    path: '/subirArchivos',
                    name: 'subirArchivos',
                    component: () => import('@/views/alumnos/subirArchivos.vue')
                },
                {
                    path: '/pages/empty',
                    name: 'empty',
                    component: () => import('@/views/pages/Empty.vue')
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

router.beforeEach(async (to, from, next) => {
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

    if (requiresAuth) {
        try {
            await AuthAPI.auth();
            next();
        } catch (error) {
            next({ name: 'Login' });
        }
    } else {
        next();
    }
});

export default router;
