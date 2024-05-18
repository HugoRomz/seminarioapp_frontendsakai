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
        // Recarga la página
        window.location.reload();
    } catch (error) {
        toast.open({
            message: error.response.data.msg,
            type: 'error'
        });
    }
};

const handleIconClick = (node) => {
    node.props.suffixIcon = node.props.suffixIcon === 'eye' ? 'eyeClosed' : 'eye';
    node.props.type = node.props.type === 'password' ? 'text' : 'password';
};
</script>

<template>
    <div class="surface-card p-4 shadow-2 border-round-3xl w-auto">
        <div class="text-center mt-5">
            <h1 class="text-xl font-bold line-height-2 tracking text-blue-900 text-center">Iniciar Sesión</h1>
        </div>
        <FormKit id="loginForm" type="form" :actions="false" incomplete-message="No se pudo enviar, intenta de nuevo" @submit="handleSubmitLogin">
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
            <FormKit
                type="password"
                label="Contraseña"
                name="password"
                placeholder="••••••••"
                prefix-icon="password"
                suffix-icon="eyeClosed"
                @suffix-icon-click="handleIconClick"
                suffix-icon-class="hover:text-blue-900"
                validation="required"
                :validation-messages="{
                    required: 'La contraseña es obligatoria'
                }"
            />
            <div class="text-center">
                <FormKit type="submit">Iniciar Sesión</FormKit>
            </div>
        </FormKit>
        <div class="text-center mt-4">
            <p class="text-base text-blue-900">
                <a href="/auth/" class="font-medium hover:underline">Recuperar contraseña</a>
            </p>
            <p class="text-base text-blue-900">
                <a href="/auth/registro" class="font-medium hover:underline">Pre Registro</a>
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
