<script setup>
import { ref, unref } from "vue";
import AppHeader from "components/AppHeader.vue";

const button_style =
  "rounded-md";

/*
const button_style =
  "rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";
*/
</script>

<template>
  <AppHeader />
  <button type="button" :class="button_style">Button text</button>
</template>

<style scoped>


button {
  @apply text-lg font-bold text-emerald-400;
}
</style>

