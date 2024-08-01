<script setup>
import { ref, inject, onMounted } from 'vue';
import DocumentoApi from '../../api/DocumentosApi.js';
import Spinner from '../../components/Spinner.vue';
const loading = ref(null);

const toast = inject('toast');

const users = ref(null);
const cursoDocumentos = ref([]);
const fileUploadRefs = ref([]);

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

const subirArchivos = async (event, documento, index) => {
    loading.value = true;
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
        loadDocumentos();
        fileUploadRefs.value[index].clear();
        // Reiniciar ventana
        location.reload();
    } catch (error) {
        console.error('Error al subir archivo:', error);
        toast.open({
            message: 'Por favor, completa todos los campos requeridos.',
            type: 'warning'
        });
    } finally {
        loading.value = false;
    }
};

// const getFullUrl = (fileName) => {
//     const baseUrl = import.meta.env.VITE_FILES_URL;
//     return fileName ? `${baseUrl}/Alumnos/${fileName}` : null;
// };

const openFilePreview = (url) => {
    if (url) {
        window.open(url, '_blank', 'width=1124,height=688');
    }
};
</script>

<template>
    <Spinner v-if="loading" />
    <Message severity="success" :closable="false">
        <!-- Verificar si users existe antes de acceder a su propiedad status -->
        {{
            users && users.status === 'ACTIVO'
                ? 'Tus documentos ya han sido aceptados. ¡Gracias por tu colaboración!'
                : 'Por favor, tenga en cuenta que todos los documentos que sean enviados estarán sujetos a revisión antes de ser aceptados. Agradecemos su paciencia y colaboración en este proceso.'
        }}
    </Message>
    <Message v-if="cursoDocumentos.filter((doc) => doc.status === 'RECHAZADO').length > 0" severity="error" :closable="false">
        Documentos que han sido rechazados:
        <ul>
            <li v-for="doc in cursoDocumentos.filter((doc) => doc.status === 'RECHAZADO')" :key="doc.det_doc_alumno.documento.nombre_documento">
                {{ doc.det_doc_alumno.documento.nombre_documento }}
            </li>
        </ul>
        Por favor, sube nuevos archivos para estos documentos.
    </Message>

    <!-- <Message v-if="documento.status === 'RECHAZADO'" severity="error" :closable="false">Tienes un documento que ha sido rechazado. Por favor, sube un nuevo archivo. </Message> -->
    <div class="grid">
        <div v-for="(documento, index) in cursoDocumentos" :key="index" class="col-12 lg:col">
            <Card class="min-h-full">
                <template #title
                    >{{ documento.det_doc_alumno.documento.nombre_documento }}
                    <Message v-if="!documento.url_file"> El documento debe ser subido en formato PDF y no debe exceder 1 MB. </Message>
                </template>
                <template #content>
                    <FileUpload
                        ref="fileUploadRefs"
                        name="documento"
                        @uploader="subirArchivos($event, documento, index)"
                        :accept="'application/pdf'"
                        :multiple="false"
                        :maxFileSize="1000000"
                        :fileLimit="1"
                        :invalidFileSizeMessage="'El tamaño del archivo debe ser menor a 1 MB'"
                        customUpload
                        :disabled="!!documento.url_file"
                    >
                        <template #empty>
                            <div class="flex align-items-center justify-content-center flex-column">
                                <i class="pi pi-cloud-upload border-2 border-circle p-5 text-8xl text-400 border-400" />
                                <p class="mt-4 mb-0 text-center">{{ documento.url_file ? 'Archivo subido' : 'Arrastra y suelta un archivo aquí o haz clic para seleccionar un archivo.' }}</p>
                            </div>
                        </template>
                    </FileUpload>
                </template>
                <template #footer>
                    <Button v-if="documento.url_file" @click="openFilePreview(documento.url_file)" class="w-full" label="Ver documento" icon="pi pi-eye" iconPos="right" />
                </template>
            </Card>
        </div>
    </div>
</template>
