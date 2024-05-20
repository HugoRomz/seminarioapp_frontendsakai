<script setup>
import { ref, onMounted } from 'vue';
import DocumentoApi from '../../api/DocumentosApi.js';
import Spinner from '../../components/Spinner.vue';
const loading = ref(null);

const users = ref(null);
const cursoDocumentos = ref([]);

const loadDocumentos = async () => {
    loading.value = true;
    try {
        const response = await DocumentoApi.userCurso();
        users.value = response.data;
        const response2 = await DocumentoApi.getCursoDocumentos(users.value.usuario_id);
        cursoDocumentos.value = response2.data;
        console.log(cursoDocumentos.value);
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(loadDocumentos);
</script>

<template>
    <Spinner v-if="loading" />
    <div class="grid">
        <div v-for="(documento, index) in cursoDocumentos" :key="index" class="col-12 lg:col">
            <Card class="h-26rem">
                <template #title>{{ documento.det_doc_alumno.documento.nombre_documento }}</template>
                <template #content>
                    <FileUpload :name="'documento_' + documento.det_alumno_id" :url="documento.url_file" @upload="onAdvancedUpload($event)" :multiple="false" :accept="'image/*'" :maxFileSize="1000000" :fileLimit="1">
                        <template #empty>
                            <div class="flex align-items-center justify-content-center flex-column">
                                <i class="pi pi-cloud-upload border-2 border-circle p-5 text-8xl text-400 border-400" />
                                <p class="mt-4 mb-0">Drag and drop files to here to upload.</p>
                            </div>
                        </template>
                    </FileUpload>
                </template>
            </Card>
        </div>
    </div>
</template>
