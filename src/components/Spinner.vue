<script setup></script>

<template>
    <div class="spinner-overlay">
        <span class="loader"></span>
    </div>
</template>

<style scoped>
.spinner-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.7);
    z-index: 9999;
}
.loader {
    width: 48px;
    height: 48px;
    position: relative;
}
.loader::before,
.loader::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 48em;
    height: 48em;
    background-image: radial-gradient(circle 10px, #d4b012 100%, transparent 0), radial-gradient(circle 10px, #d4b012 100%, transparent 0), radial-gradient(circle 10px, #d4b012 100%, transparent 0),
        radial-gradient(circle 10px, #d4b012 100%, transparent 0), radial-gradient(circle 10px, #d4b012 100%, transparent 0), radial-gradient(circle 10px, #d4b012 100%, transparent 0), radial-gradient(circle 10px, #d4b012 100%, transparent 0),
        radial-gradient(circle 10px, #d4b012 100%, transparent 0);
    background-position: 0em -18em, 0em 18em, 18em 0em, -18em 0em, 13em -13em, -13em -13em, 13em 13em, -13em 13em;
    background-repeat: no-repeat;
    font-size: 0.5px;
    border-radius: 50%;
    animation: blast 1s ease-in infinite;
}
.loader::after {
    font-size: 1px;
    background: #d4b012;
    animation: bounce 1s ease-in infinite;
}

@keyframes bounce {
    0%,
    100% {
        font-size: 0.75px;
    }
    50% {
        font-size: 1.5px;
    }
}
@keyframes blast {
    0%,
    40% {
        font-size: 0.5px;
    }
    70% {
        opacity: 1;
        font-size: 4px;
    }
    100% {
        font-size: 6px;
        opacity: 0;
    }
}
</style>
