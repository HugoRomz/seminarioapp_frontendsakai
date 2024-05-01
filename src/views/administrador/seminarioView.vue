<script setup>
import SeminarioApi from '../../api/SeminarioApi.js';

import Spinner from '../../components/Spinner.vue';
import { ref, onMounted } from 'vue';

const loading = ref(false);
const seminarioActivo = ref(null); // Agregar referencia para verificar si hay un seminario activo

const loadUsers = async () => {
    loading.value = true;
    try {
        const response = await SeminarioApi.findSeminarioActivo();
        seminarioActivo.value = response.data; // Actualizar el valor de seminarioActivo con la respuesta
        console.log(seminarioActivo.value);
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(loadUsers);
</script>
<template>
    <Spinner v-if="loading" />
    <div class="card" v-if="seminarioActivo">
        <h1>{{ seminarioActivo[0].curso.nombre_curso }}</h1>
        <p>Carrera: {{ seminarioActivo[0].curso.carrera.nombre_carrera }}</p>
        <ul>
            <li v-for="(materia, index) in seminarioActivo[0].curso.det_cursos" :key="index">Materia {{ index + 1 }}: {{ materia.materia.nombre_materia }}</li>
        </ul>
        <p>Curso Periodo ID: {{ seminarioActivo[0].curso_periodo_id }}</p>
        <p>Periodo ID: {{ seminarioActivo[0].periodo_id }}</p>
        <p>Curso ID: {{ seminarioActivo[0].curso_id }}</p>
    </div>
    <p v-else>No hay seminarios activossss</p>
</template>
