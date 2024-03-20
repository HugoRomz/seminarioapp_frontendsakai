<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useUser } from '../stores/user';

const user = useUser();

const { onMenuToggle } = useLayout();

const outsideClickListener = ref(null);
const topbarMenuActive = ref(false);
const userMenuActive = ref(false); // Nueva referencia para el menú del usuario

onMounted(() => {
    bindOutsideClickListener();
});

onBeforeUnmount(() => {
    unbindOutsideClickListener();
});

const onTopBarMenuButton = () => {
    topbarMenuActive.value = !topbarMenuActive.value;
};

const topbarMenuClasses = computed(() => {
    return {
        'layout-topbar-menu-mobile-active': topbarMenuActive.value
    };
});

const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event)) {
                topbarMenuActive.value = false;
                userMenuActive.value = false; // Asegurarse de que el menú del usuario también se cierre
            }
        };
        document.addEventListener('click', outsideClickListener.value);
    }
};
const unbindOutsideClickListener = () => {
    if (outsideClickListener.value) {
        document.removeEventListener('click', outsideClickListener.value);
        outsideClickListener.value = null;
    }
};
const isOutsideClicked = (event) => {
    if (!topbarMenuActive.value && !userMenuActive.value) return true; // Actualizar la lógica para incluir userMenuActive

    const sidebarEl = document.querySelector('.layout-topbar-menu');
    const topbarEl = document.querySelector('.layout-topbar-menu-button');
    const userMenuBtnEl = document.querySelector('.layout-topbar-user-menu-button'); // Selector para el nuevo botón del menú del usuario
    const userMenuEl = document.querySelector('.layout-topbar-user-menu'); // Selector para el nuevo menú del usuario

    return !(
        sidebarEl.isSameNode(event.target) ||
        sidebarEl.contains(event.target) ||
        topbarEl.isSameNode(event.target) ||
        topbarEl.contains(event.target) ||
        userMenuBtnEl.isSameNode(event.target) ||
        userMenuBtnEl.contains(event.target) ||
        (userMenuEl && (userMenuEl.isSameNode(event.target) || userMenuEl.contains(event.target)))
    );
};
</script>
<template>
    <div class="layout-topbar">
        <router-link to="/" class="layout-topbar-logo">
            <span class="tracking-[0.3rem] text-3xl">SIGEST<strong class="text-xs tracking-normal">UNACH</strong></span>
        </router-link>

        <button class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle()">
            <i class="pi pi-bars"></i>
        </button>

        <button class="p-link layout-topbar-menu-button layout-topbar-button" @click="onTopBarMenuButton()">
            <i class="pi pi-ellipsis-v"></i>
        </button>

        <div class="layout-topbar-menu" :class="topbarMenuClasses">
            <button @click="user.logout" class="p-link layout-topbar-button">
                <i class="pi pi-sign-out"></i>
                <span>Logout</span>
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
