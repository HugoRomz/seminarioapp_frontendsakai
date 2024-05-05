<script setup>
import AuthAPI from '@/api/AuthAPI';
import { reset } from '@formkit/vue';
import { inject } from 'vue';

const toast = inject('toast');

const carreras = [
    {
        value: 'Licenciatura en Ingeniería en Desarrollo y Tecnologías de Software',
        label: 'Licenciatura en Ingeniería en Desarrollo y Tecnologías de Software'
    },
    { value: 'Licenciatura En Contaduría', label: 'Licenciatura En Contaduría' },
    {
        value: 'Licenciatura en Sistemas Computacionales',
        label: 'Licenciatura en Sistemas Computacionales'
    }
    // Agrega más opciones según sea necesario
];

const handleSubmit = async (formdata) => {
    try {
        const { data } = await AuthAPI.register(formdata);
        toast.open({
            message: data.msg,
            type: 'success'
        });
        reset('preregisterform');
    } catch (error) {
        toast.open({
            message: error.response.data.msg,
            type: 'error'
        });
    }
};
</script>

<template>
    <div class="surface-card p-4 mb-5 shadow-2 border-round-3xl w-full lg:w-3">
        <div class="text-center mt-3 mb-5">
            <h1 class="text-xl font-bold line-height-2 tracking text-blue-900 text-center">Pre Registro</h1>
        </div>
        <FormKit id="preregisterform" type="form" :actions="false" incomplete-message="No se pudo enviar, intenta de nuevo" @submit="handleSubmit">
            <FormKit
                type="text"
                label="Nombre completo:"
                name="nombres"
                placeholder="Tu nombre completo"
                validation="required|length:3"
                :validation-messages="{
                    required: 'El nombre es obligatorio',
                    length: 'El nombre es muy corto'
                }"
            />
            <FormKit
                type="text"
                label="Apellidos:"
                name="apellidos"
                placeholder="Tus apellidos"
                validation="required|length:3"
                :validation-messages="{
                    required: 'Los apellidos son obligatorios',
                    length: 'Los apellidos son muy cortos'
                }"
            />
            <FormKit
                type="text"
                label="Matricula:"
                name="matricula"
                placeholder="Tu matricula unach"
                validation="required|length:7"
                :validation-messages="{
                    required: 'La matricula es obligatorio',
                    length: 'La matricula es muy corto'
                }"
            />
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
            <FormKit type="select" label="Selecciona tu carrera" placeholder="Selecciona tu carrera" validation="required" name="carrera" :options="carreras" />
            <FormKit type="select" label="Egresado" placeholder="Selecciona" validation="required" name="egresado" :options="['Si soy egresado', 'No soy egresado']" />

            <FormKit type="submit">Pre-registrarse</FormKit>
        </FormKit>
        <div class="space-y-3 text-center mt-5">
            <p class="text-base text-blue-600">
                <a href="/auth/login" class="font-medium hover:underline">Regresar</a>
            </p>
        </div>
    </div>
</template>

<style scoped>
.p-stepper {
    flex-basis: 50rem;
}
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
