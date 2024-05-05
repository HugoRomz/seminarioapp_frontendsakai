<script setup></script>

<template>
    <div class="bg-custom flex flex-column align-items-center justify-content-center min-h-screen overflow-hidden p-4">
        <div class="text-center mb-5">
            <img src="../../assets/img/unachLogo.png" alt="Image" width="150" class="" />
            <h1 class="text-2xl font-bold line-height-2 tracking-wide text-white text-center">SIGEST</h1>
        </div>
        <RouterView />
    </div>
</template>

<style scoped>
.p-stepper {
    flex-basis: 50rem;
}
.bg-custom {
    background-color: #00294f;
}
.tracking {
    letter-spacing: 0.05em;
}
.tracking-wide {
    letter-spacing: 0.5em;
}
</style>
