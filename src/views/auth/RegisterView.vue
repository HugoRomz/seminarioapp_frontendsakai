<script setup>
import AuthAPI from '@/api/AuthAPI';
import { reset } from '@formkit/vue';
import { onMounted } from 'vue';
import { inject, ref } from 'vue';

import Spinner from '../../components/Spinner2.vue';

const toast = inject('toast');
const form = ref({ es_egresado: '', trabaja_actualmente: false, ingresar_otro_seminario: false });
const carreras = ref(null);
const cursos = ref(null);
const loading = ref(false);

// Función para obtener carreras
const getCarreras = async () => {
    loading.value = true;
    try {
        const response = await AuthAPI.findCarreras();
        carreras.value = response.data.map((carrera) => ({ value: carrera.carrera_id, label: carrera.nombre_carrera }));
    } catch (error) {
        console.log('Error al obtener los datos de carreras', error);
    } finally {
        loading.value = false;
    }
};

// Función para obtener cursos
const getCursosPeriodos = async () => {
    loading.value = true;
    try {
        const response = await AuthAPI.findCursosPeriodos();
        cursos.value = response.data;
    } catch (error) {
        console.log('Error al obtener los datos de cursos', error);
    } finally {
        loading.value = false;
    }
};

// Llamamos a las funciones al montar el componente
onMounted(getCarreras(), getCursosPeriodos());

const handleSubmit = async (formData) => {
    try {
        console.log('Datos enviados al pre-registrarse:', formData);
        const { data } = await AuthAPI.register(formData);
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
    <Spinner v-if="loading" />
    <div v-if="carreras" class="surface-card p-4 mb-5 shadow-2 border-round-3xl w-full lg:w-3">
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
                label="Teléfono:"
                name="telefono"
                placeholder="Tu número de teléfono"
                validation="required|numeric"
                :validation-messages="{
                    required: 'El teléfono es obligatorio',
                    numeric: 'El teléfono debe contener solo números'
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
            <FormKit
                type="select"
                label="Selecciona tu carrera"
                placeholder="Selecciona tu carrera"
                validation="required"
                :validation-messages="{
                    required: 'La carrera es Obligatoria'
                }"
                name="carrera"
                :options="carreras"
            />
            <FormKit type="radio" label="¿Eres egresado?" name="es_egresado" :options="['Sí', 'No']" v-model="form.es_egresado" inline />
            <div v-if="form.es_egresado === 'No'">
                <FormKit
                    type="text"
                    label="Matrícula:"
                    name="matricula"
                    placeholder="Tu matrícula"
                    validation="required|length:7"
                    :validation-messages="{
                        required: 'La matrícula es obligatoria',
                        length: 'La matrícula debe tener 7 caracteres'
                    }"
                />
            </div>
            <div v-if="form.es_egresado === 'Sí'">
                <FormKit
                    type="text"
                    label="Código de alumno:"
                    name="codigo_alumno"
                    placeholder="Tu código de alumno"
                    validation="required"
                    :validation-messages="{
                        required: 'El código de alumno es obligatorio'
                    }"
                />
                <FormKit
                    type="number"
                    label="Año de egreso:"
                    name="anio_egreso"
                    placeholder="Año de egreso"
                    validation="required|numeric"
                    :validation-messages="{
                        required: 'El año de egreso es obligatorio',
                        numeric: 'Ingresa un año válido'
                    }"
                />
            </div>
            <FormKit type="radio" label="¿Trabajas actualmente?" name="trabaja_actualmente" :options="['Sí', 'No']" v-model="form.trabaja_actualmente" inline />
            <div v-if="form.trabaja_actualmente === 'Sí'">
                <FormKit type="text" label="Lugar de trabajo:" name="lugar_trabajo" placeholder="Lugar donde trabajas" />
            </div>
            <FormKit
                type="select"
                label="Selecciona el seminario"
                placeholder="Selecciona el seminario"
                validation="required"
                :validation-messages="{
                    required: 'El seminario es obligatorio'
                }"
                name="seminario"
                :options="cursos ? cursos.map((curso) => ({ value: curso.curso_periodo_id, label: curso.curso.nombre_curso })) : []"
            />
            <FormKit type="checkbox" label="¿Deseas ingresar al otro seminario si no se abre el deseado?" name="ingresar_otro_seminario" v-model="form.ingresar_otro_seminario" />
            <div class="text-center">
                <FormKit type="submit">Pre-registrarse</FormKit>
            </div>
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
