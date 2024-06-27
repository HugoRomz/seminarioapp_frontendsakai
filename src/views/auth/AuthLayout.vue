<script setup></script>

<template>
    <div class="bg-custom flex flex-column align-items-center justify-content-center min-h-screen overflow-hidden p-4">
        <div class="text-center mb-4">
            <img src="../../assets/img/Escudoylogodorado.png" alt="Logo de la Unach" width="250" class="m-0" />
            <h1 class="text-3xl font-bold text-white text-center"><span class="tracking-wide">SIGES</span>T</h1>
        </div>
        <RouterView />
    </div>
</template>

<style scoped>
.p-stepper {
    flex-basis: 50rem;
}

.bg-custom {
    background-color: rgb(25, 45, 99);
}

.tracking-wide {
    letter-spacing: 0.5em;
}
</style>
