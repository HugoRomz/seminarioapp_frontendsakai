<script>
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import FileUpload from 'primevue/fileupload';
import Button from 'primevue/button';

export default {
    components: {
        InputText,
        Textarea,
        FileUpload,
        Button
    },
    setup() {
        const form = ref({
            errorLocation: '',
            errorDescription: '',
            errorCause: '',
            errorPhoto: []
        });

        const onAdvancedUpload = (event) => {
            form.value.errorPhoto.push(...event.files);
        };

        const submitForm = () => {
            console.log(form.value);
            form.value = {
                errorLocation: '',
                errorDescription: '',
                errorCause: '',
                errorPhoto: []
            };
        };

        return {
            form,
            onAdvancedUpload,
            submitForm
        };
    }
};
</script>

<template>
    <div class="error-form">
        <h3>Reportar Errores</h3>
        <form @submit.prevent="submitForm">
            <div class="form-group">
                <label for="errorLocation">¿Dónde has encontrado el error?</label>
                <InputText v-model="form.errorLocation" id="errorLocation" required style="width: 100%" />
            </div>

            <div class="form-group">
                <label for="errorDescription">Descripción del error: </label>
                <Textarea v-model="form.errorDescription" id="errorDescription" required autoResize :rows="5" style="width: 100%" />
            </div>

            <div class="form-group">
                <label for="errorCause">¿Qué fue lo que genero el error?</label>
                <Textarea v-model="form.errorCause" id="errorCause" autoResize :rows="5" style="width: 100%" />
            </div>

            <div class="form-group">
                <label for="errorPhoto">Imagen del error (opcional)</label>
                <FileUpload name="demo[]" url="/api/upload" @upload="onAdvancedUpload" :multiple="true" accept="image/*" :maxFileSize="1000000">
                    <template #empty>
                        <span>Arrastra y suelta archivos aquí para subirlos.</span>
                    </template>
                </FileUpload>
            </div>

            <Button type="submit" label="Enviar" icon="pi pi-check" />
        </form>
    </div>
</template>

<style scoped>
.error-form {
    max-width: 400px;
    margin: auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    text-align: center; /* Center the title */
}

.form-group {
    margin-bottom: 15px;
}

label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    text-align: left; /* Ensure other text elements are left-aligned */
}

button {
    display: block;
    width: 100%;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

button:hover {
    background-color: #0056b3;
}
</style>
