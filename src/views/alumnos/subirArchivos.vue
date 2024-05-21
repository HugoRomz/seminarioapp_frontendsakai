<script setup>
import { ref, inject, onMounted } from 'vue';
import DocumentoApi from '../../api/DocumentosApi.js';
import Spinner from '../../components/Spinner.vue';
const loading = ref(null);

const toast = inject('toast');

const users = ref(null);
const cursoDocumentos = ref([]);

const loadDocumentos = async () => {
    loading.value = true;
    try {
        const response = await DocumentoApi.userCurso();
        users.value = response.data;
        const response2 = await DocumentoApi.getCursoDocumentos(users.value.usuario_id);
        cursoDocumentos.value = response2.data;
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    } finally {
        loading.value = false;
    }
};
onMounted(loadDocumentos);

const subirArchivos = async (event, documento) => {
    try {
        const file = event.files[0];

        const formData = new FormData();
        formData.append('documento', file);
        formData.append('documentoInfo', JSON.stringify(documento));
        await DocumentoApi.subirDocumentos(formData);
        toast.open({
            message: 'Archivo subido correctamente',
            type: 'success'
        });
    } catch (error) {
        console.error('Error al subir archivo:', error);
        toast.open({
            message: 'Por favor, completa todos los campos requeridos.',
            type: 'warning'
        });
    }
};
</script>

<template>
    <Spinner v-if="loading" />
    <div class="grid">
        <div v-for="(documento, index) in cursoDocumentos" :key="index" class="col-12 lg:col">
            <Card class="min-h-full">
                <template #title>{{ documento.det_doc_alumno.documento.nombre_documento }}</template>
                <template #content>
                    <FileUpload
                        name="documento"
                        @uploader="subirArchivos($event, documento)"
                        :accept="'application/pdf'"
                        :multiple="false"
                        :maxFileSize="1000000"
                        :fileLimit="1"
                        :invalidFileSizeMessage="'El tamaño del archivo debe ser menor a 1 MB'"
                        customUpload
                    >
                        <template #empty>
                            <div class="flex align-items-center justify-content-center flex-column">
                                <i class="pi pi-cloud-upload border-2 border-circle p-5 text-8xl text-400 border-400" />
                                <p class="mt-4 mb-0 text-center">Arrastra y suelta un archivo aquí o haz clic para seleccionar un archivo.</p>
                            </div>
                        </template>
                    </FileUpload>
                </template>
            </Card>
        </div>
    </div>
</template>
