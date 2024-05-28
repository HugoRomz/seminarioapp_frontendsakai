<script setup>
import AuthAPI from '@/api/AuthAPI';
import { reset } from '@formkit/vue';
import { inject, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import Spinner from '../../components/Spinner2.vue';

const toast = inject('toast');

const loading = ref(false);

const router = useRouter();

const route = useRoute();

const { token } = route.params;

const validToken = ref(false);

console.log(token);
onMounted(async () => {
    try {
        const { data } = await AuthAPI.verificarContrasenaToken(token);
        validToken.value = true;
    } catch (error) {
        toast.open({
            message: error.response.data.msg,
            type: 'error'
        });
    }
});

const submitNuevaContrasena = async ({ password }) => {
    try {
        const { data } = await AuthAPI.updateContrasena(token, { password });
        toast.open({
            message: data.msg,
            type: 'success'
        });
        setTimeout(() => {
            router.push({ name: 'Login' });
        }, 3000);
    } catch (error) {
        toast.open({
            message: error.response.data.msg,
            type: 'error'
        });
    }
};

</script>

<template>
    <Spinner v-if="loading" />
    <div v-if="validToken" class="surface-card p-4 shadow-2 border-round-3xl w-auto">
        <div class="text-center mt-3">
            <h1 class="text-xl font-bold line-height-2 tracking text-blue-900 text-center">Ingresa la nueva contraseña</h1>
        </div>
        <FormKit id="loginCambiarContrasena" type="form" :actions="false" incomplete-message="No se pudo enviar, intenta de nuevo" @submit="submitNuevaContrasena">
            <FormKit
                type="password"
                label="Contraseña"
                prefix-icon="lock"
                name="password"
                placeholder="Ingrese su contraseña"
                validation="required|min:8"
                :validation-messages="{
                    required: 'La contraseña es obligatoria',
                    min: 'La contraseña debe tener al menos 8 caracteres'
                }"
            />

            <FormKit
                type="password"
                label="Confirmar Contraseña"
                prefix-icon="lock"
                name="confirm_password"
                placeholder="Confirme su contraseña"
                validation="required|confirmed:password"
                :validation-messages="{
                    required: 'Debe confirmar su contraseña',
                    confirmed: 'Las contraseñas no coinciden'
                }"
            />
            <div class="text-center">
                <FormKit type="submit">Guardar nueva contraseña</FormKit>
            </div>
        </FormKit>
        <div class="text-center mt-4">
            <!-- botón regresar al login -->
            <p class="text-base text-blue-900">
                <a href="/auth/login" class="font-medium hover:underline">Regresar</a>
            </p>
        </div>
    </div>

    <p v-else class="text-center text-2xl font-black text-white">Token no válido</p>
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
