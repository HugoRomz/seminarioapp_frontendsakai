<script setup>
import { useUser } from '../stores/user';
const user = useUser();
</script>
<template>
    <div class="card">
        <div class="content">
            <img src="@/assets/img/userIcon.png" alt="User icon" class="user-icon" />
            <div class="info">
                <div class="label">
                    Matricula:<span class="value uppercase" id="matricula">{{ user.getUser.usuario_id }}</span>
                </div>
                <div class="label">
                    Estudiante: <span class="value uppercase" id="nombre">{{ user.getUser.nombre }} {{ user.getUser.apellido_p }} {{ user.getUser.apellido_m }}</span>
                </div>
                <div class="label">
                    Email: <span class="value" id="email">{{ user.getUser.email_usuario }}</span>
                </div>
                <div class="label">
                    Teléfono: <span class="value" id="telefono">{{ user.getUser.telefono_usuario }}</span>
                </div>
                <div class="label">
                    Status: <span class="ml-2 lowercase" :class="{ 'text-green-600': user.user.status === 'ACTIVO', 'text-red-600': user.user.status !== 'ACTIVO' }">{{ user.getUser.status }}</span>
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
