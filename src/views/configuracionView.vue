<script setup>
import { ref, onMounted, inject } from 'vue';

import AuthAPI from '../api/AuthAPI';
import configuracionApi from '../api/configuracionApi';
const toast = inject('toast');

const user = ref(null);
const rolAdmin = ref(false);
const fileUploadRefs = ref([]);

const formError = ref({
    userId: null,
    errorLocation: '',
    errorDescription: '',
    errorCause: '',
    errorPhoto: []
});

onMounted(async () => {
    try {
        const response = await AuthAPI.auth();
        const { usuario_id, roles } = response.data;
        user.value = { usuario_id, roles };
        rolAdmin.value = roles.some((rol) => rol.nombre_rol === 'Administrador');
        formError.value.userId = user.value.usuario_id;
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
});
const submitForm = async () => {
    const { errorLocation, errorDescription, errorCause, errorPhoto } = formError.value;

    // Verificar que todos los campos requeridos estén completos
    if (errorLocation && errorDescription && errorCause) {
        try {
            // Verificar la estructura de errorPhoto si existe
            if (errorPhoto && Array.isArray(errorPhoto)) {
                const validPhotos = errorPhoto.every((photo) => photo.name && photo.type && photo.size && photo.base64 && photo.base64.startsWith('data:image'));

                if (!validPhotos) {
                    toast.open({
                        message: 'La estructura de las fotos del error es incorrecta.',
                        type: 'error'
                    });
                    return;
                }
            }
            // Enviar la solicitud al servidor
            const response = await configuracionApi.reporteError(formError.value);
            toast.open({
                message: 'Reporte de error enviado correctamente',
                type: 'success'
            });

            if (response.data) {
                formError.value.errorLocation = '';
                formError.value.errorDescription = '';
                formError.value.errorCause = '';
                formError.value.errorPhoto = [];
            }
        } catch (error) {
            toast.open({
                message: 'Error al enviar el reporte de error',
                type: 'error'
            });
        }
    } else {
        toast.open({
            message: 'Por favor, completa todos los campos.',
            type: 'error'
        });
    }
};

const convertirYSubirArchivo = async (event) => {
    const file = event.files[0];
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = function () {
        const base64data = reader.result;
        formError.value.errorPhoto.push({
            name: file.name,
            type: file.type,
            size: file.size,
            base64: base64data
        });
        toast.open({
            message: 'Archivo subido correctamente',
            type: 'success'
        });
    };

    reader.onerror = function (error) {
        toast.open({
            message: 'Error al cargar el archivo',
            type: 'error'
        });
        console.error('Error al leer el archivo:', error);
    };
};
</script>

<template>
    <card>
        <template #content>
            <Fieldset class="mb-3" legend="Reportar Errores" :toggleable="true" :collapsed="true">
                <div class="card p-fluid">
                    <form @submit.prevent="submitForm">
                        <div class="field">
                            <label for="errorLocation">¿Dónde has encontrado el error?</label>
                            <InputText v-model="formError.errorLocation" id="errorLocation" style="width: 100%" />
                        </div>

                        <div class="field">
                            <label for="errorDescription">Descripción del error: </label>
                            <Textarea v-model="formError.errorDescription" id="errorDescription" autoResize :rows="5" style="width: 100%" />
                        </div>

                        <div class="field">
                            <label for="errorCause">¿Qué fue lo que genero el error?</label>
                            <Textarea v-model="formError.errorCause" id="errorCause" autoResize :rows="5" style="width: 100%" />
                        </div>

                        <div class="field">
                            <label for="errorPhoto">Imagen del error (opcional)</label>
                            <FileUpload ref="fileUploadRefs" id="errorPhoto" @uploader="convertirYSubirArchivo($event)" :multiple="false" accept="image/*" :maxFileSize="1000000" customUpload :auto="true"> </FileUpload>
                        </div>

                        <Button type="submit" label="Enviar" icon="pi pi-check" />
                    </form>
                </div>
            </Fieldset>
            <Fieldset v-if="rolAdmin" legend="Configurar templates" :toggleable="true" :collapsed="true">
                <div class="card p-fluid">
                    <div class="field">
                        <label for="name1">Selecciona el membrete para la documentación</label>
                        <FileUpload ref="fileUploadRefs" name="documento" :multiple="false" accept="image/*" :maxFileSize="1000000">
                            <template #empty>
                                <p>Arrastra y suelta archivos aquí para subirlos.</p>
                            </template>
                        </FileUpload>
                    </div>
                </div>
            </Fieldset>
        </template>
    </card>
</template>
