<script setup>
import { reset } from '@formkit/vue';
import { inject } from 'vue';
import AuthAPI from '@/api/AuthAPI';
import { useRouter } from 'vue-router';

const toast = inject('toast');
const router = useRouter();

const handleSubmitLogin = async (formdata) => {
    try {
        const {
            data: { token }
        } = await AuthAPI.login(formdata);
        localStorage.setItem('AUTH_TOKEN', token);
        reset('preregisterform');
        router.push({ name: 'home' });
    } catch (error) {
        toast.open({
            message: error.response.data.msg,
            type: 'error'
        });
    }
};
</script>

<template>
    <div class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0">
        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 class="text-lg font-bold leading-tight tracking-wider text-gray-800 text-center">Iniciar Sesión</h1>
            <FormKit id="loginForm" type="form" :actions="false" incomplete-message="No se pudo enviar, intenta de nuevo" @submit="handleSubmitLogin">
                <FormKit
                    type="email"
                    label="Email"
                    name="email_usuario"
                    placeholder="correo@unach.mx"
                    validation="required|email"
                    :validation-messages="{
                        required: 'El email es obligatorio',
                        email: 'Email no válido'
                    }"
                />
                <FormKit
                    type="password"
                    label="Contraseña"
                    name="password"
                    placeholder="••••••••"
                    validation="required"
                    :validation-messages="{
                        required: 'La contraseña es obligatoria'
                    }"
                />

                <FormKit type="submit">Iniciar Sesión</FormKit>
            </FormKit>
            <div class="space-y-3 text-center">
                <p class="text-base text-blue-600">
                    <a href="/auth/" class="font-medium hover:underline">Recuperar contraseña</a>
                </p>
                <p class="text-base text-blue-600">
                    <a href="/auth/registro" class="font-medium hover:underline">Pre Registro</a>
                </p>
            </div>
        </div>
    </div>
</template>
