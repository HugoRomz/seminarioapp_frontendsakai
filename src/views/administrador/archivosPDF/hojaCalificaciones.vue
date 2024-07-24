<script setup>
import { onMounted, defineProps, ref } from 'vue';

const props = defineProps({
    alumnos: {
        type: Object,
        required: true
    }
});

const imageLoaded = ref(false);

const handleImageLoad = () => {
    imageLoaded.value = true;
};

onMounted(() => {
    const checkImageLoaded = () => {
        if (imageLoaded.value) {
            window.print();
        } else {
            setTimeout(checkImageLoaded, 100);
        }
    };
    checkImageLoaded();

    window.addEventListener('afterprint', () => {
        window.close();
    });
});
</script>

<template>
    <div class="constancia-container">
        <img src="../../../assets/img/membreteypie.jpg" alt="Constancia" class="background-image" @load="handleImageLoad" />
        <div class="content">
            <h1>{{ props.alumnos.Curso }}</h1>
            <h1 class="mt-2">Ciclo: {{ props.alumnos.periodo }}</h1>
            <h1 class="mb-2">Acta de Calificaciones</h1>
            <h1>Modulo: {{ props.alumnos.nombre_modulo }}</h1>
            <table>
                <thead>
                    <tr>
                        <th>N°</th>
                        <th>Matricula</th>
                        <th>Nombre</th>
                        <th>Cal. Mod.</th>
                        <th>Proy. Fin.</th>
                        <th>Cal. Final</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(calificacion, index) in props.alumnos.calificaciones" :key="index">
                        <td>{{ index + 1 }}</td>
                        <td>{{ calificacion.matricula }}</td>
                        <td>{{ calificacion.nombre }}</td>
                        <td>{{ calificacion.cal_mod }}</td>
                        <td>{{ calificacion.proy_cal }}</td>
                        <td>{{ calificacion.cal_fin }}</td>
                    </tr>
                </tbody>
            </table>
            <p style="font-size: 0.7em; font-weight: normal; color: gray; text-align: left; margin: 0 0">* Las calificaciones se otorgan en una escala del 1 al 10</p>
        </div>
        <div class="firmas">
            <p class="mb-0 uppercase">{{ props.alumnos.nombre_docente }}</p>
            <p class="m-0">Firma del docente</p>
        </div>
    </div>
</template>

<style scoped>
@media print {
    @page {
        margin: 0;
    }
    body {
        margin: 0;
        -webkit-print-color-adjust: exact;
        font-family: Arial, sans-serif;
    }
    .constancia-container {
        width: 100vw;
        height: 100vh;
        overflow: hidden;
    }
}
body {
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
    font-size: 1em !important;
}

.constancia-container {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
}

.background-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: -1;
}

.content {
    position: absolute;
    top: 10%;
    left: 15%;
    width: 71%;
    color: black;
    z-index: 1;
    text-align: justify;
    font-family: Arial, sans-serif;
}

.content h1 {
    text-transform: uppercase;
    margin: 0px;
    font-size: 1em;
    text-align: center;
    font-weight: bold;
    font-family: Arial, sans-serif;
}

.content p {
    margin: 10px 0;
    font-family: Arial, sans-serif;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 0 0;
    margin-top: 20px;
    font-family: Arial, sans-serif;
}

th,
td {
    border: 1px solid black;
    padding: 4px;
    text-align: center;
    font-size: 0.75em;
    font-family: Arial, sans-serif;
}

th {
    background-color: #f2f2f2;
}

.materias {
    margin-top: 40px;
    display: flex;
    justify-content: space-between;
}

.materias p {
    font-size: 0.95em;
    display: inline-block;
    width: 50%;
    text-align: center;
    font-family: Arial, sans-serif;
}
.firmas {
    position: absolute;
    color: black;
    font-weight: bold;
    bottom: 8%;
    width: 100%;
    text-align: center;
    font-family: Arial, sans-serif;
}
</style>
