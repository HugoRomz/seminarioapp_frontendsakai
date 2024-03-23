<script setup>
import { useUser } from '../stores/user';
const user = useUser();
</script>
<template>
    <div class="card">
        <div class="flex flex-col items-center space-y-5">
            <!-- La imagen siempre centrada -->
            <img src="@/assets/img/userIcon.png" alt="User icon" class="w-56 rounded-full mb-4" />
            <!-- Contenedor para el texto, con mayor espacio entre elementos -->
            <div class="w-full flex flex-col items-start sm:items-center space-y-4">
                <!-- Aumentado a space-y-4 -->
                <div class="text-lg font-bold">
                    Matricula:<span class="ml-2 text-gray-700 font-normal uppercase">{{ user.getUser.usuario_id }}</span>
                </div>
                <div class="text-lg font-bold">
                    Estudiante: <span class="ml-2 text-gray-700 font-normal uppercase">{{ user.getUser.nombre }} {{ user.getUser.apellido_p }} {{ user.getUser.apellido_m }}</span>
                </div>
                <div class="text-lg font-bold">
                    Email: <span class="ml-2 text-gray-700 font-normal">{{ user.getUser.email_usuario }}</span>
                </div>
                <div class="text-lg font-bold">
                    Teléfono: <span class="ml-2 text-gray-700 font-normal tracking-wider">{{ user.getUser.telefono_usuario }}</span>
                </div>
                <div class="text-lg font-bold">
                    Status: <span class="ml-2 lowercase" :class="{ 'text-green-600': user.user.status === 'ACTIVO', 'text-red-600': user.user.status !== 'ACTIVO' }">{{ user.getUser.status }}</span>
                </div>
            </div>
        </div>
    </div>
</template>
