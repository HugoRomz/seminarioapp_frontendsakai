<script setup></script>

<template>
    <section class="bg-unachBlue min-h-screen">
        <div class="flex flex-col items-center justify-center px-6 py-6 mx-auto md:h-screen lg:py-0">
            <div class="space-y-2 mb-8">
                <img src="../../assets/img/unachLogo.png" alt="Logo Unach" class="w-32" />
                <h1 class="text-2xl text-white font-bold tracking-[0.5rem]">SIGEST</h1>
            </div>
            <RouterView />
        </div>
    </section>
</template>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>
