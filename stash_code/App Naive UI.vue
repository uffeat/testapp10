<script setup>
import { NButton } from 'naive-ui'
import AppHeader from 'components/AppHeader.vue'
</script>

<template>
  <AppHeader />
  <n-button>naive-ui</n-button>
  <button>Click</button>
  <button type="button"
    class="rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Button
    text</button>
</template>

<style scoped></style>
