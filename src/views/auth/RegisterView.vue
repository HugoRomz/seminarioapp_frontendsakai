<script setup>
import AuthAPI from '@/api/AuthAPI'
import { reset } from '@formkit/vue'
import { inject } from 'vue'

const toast = inject('toast')

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
]

const handleSubmit = async (formdata) => {
  try {
    const { data } = await AuthAPI.register(formdata)
    toast.open({
      message: data.msg,
      type: 'success'
    })
    reset('preregisterform')
  } catch (error) {
    toast.open({
      message: error.response.data.msg,
      type: 'error'
    })
  }
}
</script>

<template>
  <div class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0">
    <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
      <h1 class="text-lg font-bold leading-tight tracking-wider text-gray-800 text-center">
        Pre Registro
      </h1>
      <FormKit
        id="preregisterform"
        type="form"
        :actions="false"
        incomplete-message="No se pudo enviar, intenta de nuevo"
        @submit="handleSubmit"
      >
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
        <FormKit
          type="select"
          label="Selecciona tu carrera"
          placeholder="Selecciona tu carrera"
          validation="required"
          name="carrera"
          :options="carreras"
        />
        <FormKit
          type="select"
          label="Egresado"
          placeholder="Selecciona"
          validation="required"
          name="egresado"
          :options="['Si soy egresado', 'No soy egresado']"
        />

        <FormKit type="submit">Pre-registrarse</FormKit>
      </FormKit>
      <div class="space-y-3 text-center">
        <p class="text-base text-blue-600">
          <a href="/auth/login" class="font-medium hover:underline">Regresar</a>
        </p>
      </div>
    </div>
  </div>
</template>
