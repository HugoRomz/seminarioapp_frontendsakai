<script setup>
import { onMounted, defineProps, ref } from 'vue';

const props = defineProps({
    alumno: {
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

const separarCurso = (curso) => {
    if (curso) {
        const cursoArray = curso.split(' ');

        return cursoArray[2].toLowerCase();
    }
    return '';
};
</script>

<template>
    <div class="constancia-container">
        <img src="../../../assets/img/constanciaNoadeudo.jpg" alt="Constancia" class="background-image" @load="handleImageLoad" />
        <div class="content">
            <h1>A QUIEN CORRESPONDA:</h1>
            <br />
            <p>La que suscribe Coordinadora del Seminario de Titulación de la facultad de Negocios Campus IV, de la Universidad Autónoma de Chiapas</p>
            <p class="text-center py-4"><strong>HACE CONSTAR:</strong></p>
            <p>
                Que el <strong class="uppercase">C. {{ props.alumno.Nombre }}</strong> con número de matrícula <strong>{{ props.alumno.matricula }}</strong
                >, cursó el seminario de titulación en el área de {{ separarCurso(props.alumno.Curso) }} en el ciclo {{ props.alumno.periodo }} y al término del mismo <strong>NO</strong> presenta
                <strong>ningún adeudo de las parcialidades correspondientes a los módulos que lo integran. </strong>
            </p>
            <br />

            <p>Para los fines legales que le convengan se extiende la presente constancia, en la ciudad de Tapachula de C. y O., Chiapas a los doce días del mes de junio del dos mil veinticuatro.</p>
            <br />
            <p class="text-center">ATENTAMENTE</p>
            <br />
            <p class="text-center font-bold">“POR LA CONCIENCIA DE LA NECESIDAD DE SERVIR”</p>
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
    font-size: 1.05em !important;
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
    top: 13%;
    left: 14%;
    width: 71%;
    color: black;
    z-index: 1;
    text-align: justify;
    font-family: Arial, sans-serif;
}

.content h1 {
    margin-bottom: 20px;
    font-size: 1em;
    font-weight: bold;
    font-family: Arial, sans-serif;
}

.content p {
    margin: 10px 0;
    font-family: Arial, sans-serif;
}
</style>
