<script setup>
import AuthAPI from '@/api/AuthAPI';
import { reset } from '@formkit/vue';
import { inject, ref } from 'vue';
import { useRouter } from 'vue-router';

import Spinner from '../../components/Spinner2.vue';

const toast = inject('toast');

const loading = ref(false);

const router = useRouter();

const submitRecuperarContrasena = async (formData) => {
    loading.value = true;
    try {
        const { data } = await AuthAPI.recuperarcontrasena(formData);
        toast.open({
            message: data.msg,
            type: 'success'
        });
        reset('submitRecuperarContrasena');

        router.push({ name: 'Login' });
    } catch (error) {
        toast.open({
            message: error.response.data.msg,
            type: 'error'
        });
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <Spinner v-if="loading" />
    <div class="surface-card p-4 shadow-2 border-round-3xl w-auto">
        <div class="text-center mt-3">
            <h1 class="text-xl font-bold line-height-2 tracking text-blue-900 text-center">Recuperar Contraseña</h1>
        </div>
        <FormKit id="loginRecuperar" type="form" :actions="false" incomplete-message="No se pudo enviar, intenta de nuevo" @submit="submitRecuperarContrasena">
            <FormKit
                type="email"
                label="Email"
                prefix-icon="email"
                name="email_usuario"
                placeholder="correo@unach.mx"
                validation="required|email"
                :validation-messages="{
                    required: 'El email es obligatorio',
                    email: 'Email no válido'
                }"
            />
            <div class="text-center">
                <FormKit type="submit">Recuperar Contraseña</FormKit>
            </div>
        </FormKit>
        <div class="text-center mt-4">
            <!-- boton regresar al login -->
            <p class="text-base text-blue-900">
                <a href="/auth/login" class="font-medium hover:underline">Regresar</a>
            </p>
        </div>
    </div>
</template>

<style scoped>
.bg-custom {
    background-color: #00294f;
}
.tracking {
    letter-spacing: 0.05em;
}
.tracking-wide {
    letter-spacing: 0.5em;
}
</style>
