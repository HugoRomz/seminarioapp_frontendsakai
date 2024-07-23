<script setup>
import { onMounted, defineProps, ref } from 'vue';

const props = defineProps({
    alumno: {
        type: Object,
        required: true
    }
});

console.log(props.alumno);

const imageLoaded = ref(false);

const handleImageLoad = () => {
    imageLoaded.value = true;
};

const numeroALetras = (num) => {
    const unidades = ['Cero', 'Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve', 'Diez'];
    return unidades[num] || num;
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
});
</script>

<template>
    <div class="constancia-container">
        <img src="./templates/membreteypie.jpg" alt="Constancia" class="background-image" @load="handleImageLoad" />
        <div class="content">
            <h1>CONSTANCIA DE ESTUDIOS</h1>
            <p>
                La Facultad de Negocios Campus IV de la Universidad Autónoma de Chiapas <strong>CERTIFICA</strong> que según constancias que obran en la coordinación de la Licenciatura en Ingeniería y Desarrollo en Tecnologías de Software el alumno
                <strong class="uppercase">C. {{ props.alumno.Nombre }}</strong> del
                <strong class="uppercase">{{ props.alumno.Curso }}</strong>
                del ciclo {{ props.alumno.periodo }} con MATRICULA <strong class="uppercase">{{ props.alumno.matricula }}</strong> acreditó las materias correspondientes y además cumplió con <strong>100%</strong> de la asistencia requerida de acuerdo
                con el Reglamento Interno de Evaluación Profesional por la opción de Seminario de Titulación con las calificaciones que a continuación se especifican:
            </p>
            <table>
                <thead>
                    <tr>
                        <th>NOMBRE DE LA MATERIA</th>
                        <th>CALIFICACIÓN CON NÚMERO</th>
                        <th>CALIFICACIÓN CON LETRA</th>
                        <th>RESULTADO</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(calificacion, index) in props.alumno.calificaciones" :key="index">
                        <td>{{ calificacion.modulo.nombre_modulo }}</td>
                        <td>{{ calificacion.calificacion_final }}</td>
                        <td>{{ numeroALetras(calificacion.calificacion_final) }}</td>
                        <td>{{ calificacion.calificacion_final >= 6 ? 'ACREDITADO' : 'NO ACREDITADO' }}</td>
                    </tr>
                </tbody>
            </table>
            <p>
                <strong>PROMEDIO GENERAL: {{ props.alumno.promedioFinal }}</strong>
            </p>
            <p>Para fines de titulación debe aprobar con una calificación mínima de 8 (ocho) por cada módulo y presentar constancia de seminario de titulación con vigencia no mayor a 3 años.</p>
            <p>La evaluación por Seminario de Titulación está sustentada en el Artículo 240 del Estatuto Integral de la Universidad Autónoma de Chiapas.</p>
            <p>Se extiende la presente CONSTANCIA para los fines legales que al interesado le convengan en la Ciudad de Tapachula de C. y O. Chiapas a los doce días del mes de junio del dos mil veinticuatro.</p>
            <div class="firmas">
                <p>Atentamente</p>
                <p>“Por la Conciencia de la Necesidad de Servir”</p>
                <div class="signatures">
                    <p>
                        ________________________________<br />
                        <strong>Dr. Gilibaldo Hernández Cruz</strong><br />
                        Director de la Facultad
                    </p>
                    <p>
                        ______________________________<br />
                        <strong>Mtra. Rosa Isela López Aguilar</strong><br />
                        Coordinadora del Seminario de Titulación
                    </p>
                </div>
            </div>
            <p style="font-size: 0.7em">La escala de calificaciones es de 0 (cero) al 10 (diez)</p>
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
    font-family: Arial;
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
    width: 70%;
    color: black;
    z-index: 1;
    text-align: justify;
}

.content h1 {
    margin-bottom: 20px;
    font-size: 1em;
    text-align: center;
    font-weight: bold;
}

.content p {
    margin: 10px 0;
    font-size: 0.95em;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
}

th,
td {
    border: 1px solid black;
    padding: 8px;
    text-align: center;
    font-size: 0.75em;
}

th {
    background-color: #f2f2f2;
}

.signatures {
    margin-top: 40px;
    display: flex;
    justify-content: space-between;
}

.signatures p {
    font-size: 0.95em;
    display: inline-block;
    width: 50%;
    text-align: center;
}
.firmas {
    justify-content: center;
    margin-top: 20px;
    text-align: center;
}
</style>
