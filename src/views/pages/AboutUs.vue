<script setup>
import { onMounted, onBeforeUnmount } from 'vue';
import TerminalService from 'primevue/terminalservice';

onMounted(() => {
    TerminalService.on('command', commandHandler);
});

onBeforeUnmount(() => {
    TerminalService.off('command', commandHandler);
});

const commandHandler = (text) => {
    let response;
    let argsIndex = text.indexOf(' ');
    let command = argsIndex !== -1 ? text.substring(0, argsIndex).toLowerCase() : text.toLowerCase();

    switch (command) {
        case 'fecha':
            response = 'Hoy es: ' + new Date().toDateString();
            break;

        case 'saludo':
            response = 'Hola ' + text.substring(argsIndex + 1);
            break;

        case 'random':
            response = Math.floor(Math.random() * 100);
            break;

        case 'ls':
            response = 'main.js style.css .env';
            break;

        case 'pwd':
            response = '/home/romz/seminarioapp/sakai-vue';
            break;

        case 'whoami':
            response = 'You are the current user';
            break;

        case 'clear':
            response = 'No se puede limpiar porque no se como hacerlo :(';
            break;

        case 'help':
            response = 'Available commands: fecha, saludo, random, ls, pwd, whoami, clear, help';
            break;

        default:
            response = 'Unknown command: ' + command;
    }

    TerminalService.emit('response', response);
};
</script>
<template>
    <div class="flex align-items-center justify-content-center">
        <div class="px-4 py-8 md:px-6 lg:px-8 text-center w-full md:w-8">
            <div class="mb-3 font-bold text-6xl">
                <span class="text-blue-800"> Acerca de </span>
            </div>
            <div class="text-lg text-sm mb-6">SIGEST es una plataforma de gestión de seminarios y cursos en línea, que permite a los profesores y estudiantes interactuar de manera eficiente.</div>
            <div class="grid">
                <div class="col-12 md:col-4 mb-4 px-5">
                    <span class="p-3 shadow-2 mb-3 inline-block surface-card" style="border-radius: 10px">
                        <i class="pi pi-user text-4xl text-blue-800"></i>
                    </span>
                    <div class="text-lg mb-3 font-bold">Desarrollador</div>
                    <span class="text-lg text-sm line-height-3"> Hugo Rafael Rosales Meléndez </span>
                </div>
                <div class="col-12 md:col-4 mb-4 px-5">
                    <span class="p-3 shadow-2 mb-3 inline-block surface-card" style="border-radius: 10px">
                        <i class="pi pi-user text-4xl text-blue-800"></i>
                    </span>
                    <div class="text-lg mb-3 font-bold">Asesor de Proyecto</div>
                    <span class="text-lg text-sm line-height-3"> Jesús Arnulfo Zacarías Santos </span>
                </div>
                <div class="col-12 md:col-4 mb-4 px-5">
                    <span class="p-3 shadow-2 mb-3 inline-block surface-card" style="border-radius: 10px">
                        <i class="pi pi-user text-4xl text-blue-800"></i>
                    </span>
                    <div class="text-lg mb-3 font-bold">Desarrollador</div>
                    <span class="text-lg text-sm line-height-3"> Carlos Alberto Martinez Bonilla </span>
                </div>
            </div>
            <Inplace>
                <template #display></template>
                <template #content>
                    <div class="text-left">
                        <Terminal welcomeMessage="Esta es una terminal para hackear el sistema" prompt="root@SIGEST:~$" aria-label="PrimeVue Terminal Service" />
                    </div>
                </template>
            </Inplace>
        </div>
    </div>
</template>
