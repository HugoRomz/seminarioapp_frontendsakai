<script setup>
import { ref, onMounted } from 'vue';
import DocumentoApi from '../../api/DocumentosApi.js';

const loading = ref(null);
const users = ref(null);

onMounted(async () => {
    loading.value = true;
    try {
        const response = await DocumentoApi.userCurso();
        users.value = response.data;
        // const cursoDocumentos = await DocumentoApi.getCursoDocumentos(users.value.usuario_id);
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="card">
        <h1>{{ users }}</h1>
        <FileUpload name="demo[]" url="/api/upload" @upload="onAdvancedUpload($event)" :multiple="false" accept="image/*" :maxFileSize="1000000" :fileLimit="1">
            <template #empty>
                <div class="flex align-items-center justify-content-center flex-column">
                    <i class="pi pi-cloud-upload border-2 border-circle p-5 text-8xl text-400 border-400" />
                    <p class="mt-4 mb-0">Arrastra y suelta archivos aquí para subirlos</p>
                </div>
            </template>
        </FileUpload>
    </div>
</template>
