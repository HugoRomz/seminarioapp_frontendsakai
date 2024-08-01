<script setup>
import { ref, onMounted } from 'vue';
import AuthAPI from '../api/AuthAPI';
import Spinner from '../components/Spinner.vue';

const loading = ref(null);
const users = ref(null);

onMounted(async () => {
    loading.value = true;
    try {
        const response = await AuthAPI.auth();
        users.value = response.data;
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    } finally {
        loading.value = false;
    }
});
</script>
<template>
    <Spinner v-if="loading" />
    <div class="card" v-if="users">
        <div class="content">
            <img src="@/assets/img/userIcon.png" alt="User icon" class="user-icon" />
            <div class="info">
                <div class="label">
                    <template v-if="users.alumno && users.alumno.matricula">
                        <span class="type">Matrícula:</span>
                        <span class="value uppercase">{{ users.alumno.matricula }}</span>
                    </template>
                    <template v-else-if="users.docente && users.docente.num_plaza">
                        <span class="type">Número de Plaza:</span>
                        <span class="value uppercase">{{ users.docente.num_plaza }}</span>
                    </template>
                    <template v-else-if="users.egresado && users.egresado.cod_egresado">
                        <span class="type">Código de Egresado:</span>
                        <span class="value uppercase">{{ users.egresado.cod_egresado }}</span>
                    </template>
                    <template v-else>
                        <span class="type">Usuario ID:</span>
                        <span class="value uppercase">{{ users.usuario_id }}</span>
                    </template>
                </div>
                <div class="label">
                    Usuario: <span class="value uppercase" id="nombre">{{ users.nombre }} {{ users.apellido_p }} {{ users.apellido_m }}</span>
                </div>
                <div class="label">
                    Curp: <span class="value uppercase" id="curp">{{ users.curp }}</span>
                </div>
                <div class="label">
                    Email: <span class="value" id="email">{{ users.email_usuario }}</span>
                </div>
                <div class="label">
                    Teléfono: <span class="value" id="telefono">{{ users.telefono_usuario }}</span>
                </div>
                <div v-if="users.alumno && users.alumno.calificacionFinal !== null">
                    <div class="label">
                        Calificación Final: <span class="value">{{ users.alumno.calificacionFinal }}</span>
                    </div>
                </div>
                <div class="label">
                    Status: <span class="ml-2 lowercase" :class="{ 'text-green-600': users.status === 'ACTIVO', 'text-red-600': users.status !== 'ACTIVO' }">{{ users.status }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 20px;
}

.user-icon {
    width: 224px;
    border-radius: 9999px;
    margin-bottom: 16px;
    align-self: center;
}

.info {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.label {
    font-size: 16px;
    font-weight: bold;
    text-align: left;
}

.value {
    margin-left: 8px;
    font-weight: normal;
    color: #4a5568;
}

.status {
    margin-left: 8px;
    text-transform: lowercase;
}

@media (min-width: 768px) {
    .label {
        text-align: center;
    }
}
</style>
