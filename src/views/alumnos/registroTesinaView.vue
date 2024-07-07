<script setup>
import { ref, inject, onMounted, watch } from 'vue';
import { FilterMatchMode } from 'primevue/api';
import TesinaApi from '../../api/TesinaApi';
import Spinner from '../../components/Spinner.vue';


const projectTitle = ref('');
const projectDescription = ref('');
const projectFile = ref(null);
const nombreTesina = ref('');
const areaTesina = ref('');
const reseniaTesina = ref('');
const fechaRegistro = ref(new Date());

const projects = ref([
    { title: 'Thesis: Artificial Intelligence', description: 'Research on the applications of AI in various industries.' },
    { title: 'Project: Web Development', description: 'Building a responsive and accessible website.' },
    { title: 'Thesis: Renewable Energy', description: 'Exploring the potential of renewable energy sources.' }
]);

const submitProject = () => {
    // Lógica para enviar el proyecto
};
</script>

<template>
    <div class="grid">
        <!-- Formulario de registro de tesina -->
        <div class="col-12 lg:col-4">
            <div class="card">
                <h3>Registro de Tesina</h3>
                <div class="p-fluid">
                    <div class="field">
                        <label for="nombre_tesina">Nombre de la Tesina</label>
                        <InputText id="nombre_tesina" v-model="nombreTesina" />
                    </div>
                    <div class="field">
                        <label for="area_tema">Área de la Tesina</label>
                        <InputText id="area_tema" v-model="areaTesina" />
                    </div>
                    <div class="field">
                        <label for="resenia_tema">Reseña de la Tesina</label>
                        <Textarea id="resenia_tema" v-model="reseniaTesina" rows="3" />
                    </div>
                    <div class="field">
                        <label for="fecha_invitacion">Fecha de Registro</label>
                        <Calendar id="fecha_invitacion" v-model="fechaRegistro" showIcon />
                    </div>
                    <div class="field">
                        <label for="usuario_id_invitado">Compañero(s)</label>
                        <Chips v-model="value" separator=","  />
                    </div>
                    <div class="field">
                        <label for="projectFile">Archivo del Proyecto</label>
                        <FileUpload ref="fileUploadRefs" id="projectFile" @uploader="SubirArchivo($event)" :multiple="false" accept="image/*" :maxFileSize="1000000" customUpload :auto="true" />
                    </div>
                    <Button label="Enviar Proyecto" class="p-mt-2" @click="submitProject" />
                </div>
            </div>
        </div>

        <!-- Lista de proyectos y tesis -->
        <div class="col-12 lg:col-8">
            <div class="card">
                <h3>Projects and Theses</h3>
                <div class="grid">
                    <div v-for="project in projects" :key="project.title" class="col-12 md:col-4">
                        <div class="card">
                            <h4>{{ project.title }}</h4>
                            <p>{{ project.description }}</p>
                            <Button label="View" class="p-button-text p-mr-2" />
                            <Button label="Upload" class="p-button-text" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
.card {
    padding: 1rem;
    margin-bottom: 1rem;
    border: 1px solid #ccc;
    border-radius: 0.5rem;
}
</style>
