<script setup>
import { computed, ref } from 'vue'
import { ArrowRightIcon } from '@heroicons/vue/24/outline'
import { user } from '@/state/user';



const navigation = [
  { name: 'About', href: '#' },
]


</script>

<template>
  <header class="flex items-center bg-emerald-600 py-4 px-6 text-white">
    <a href="#" class="">
      <h1 class="font-semibold text-xl">Snackwave</h1>
    </a>
    <nav class="ms-auto flex items-center justify-end gap-x-6">
      <a v-for="item in navigation" :key="item.name" :href="item.href">{{ item.name }}</a>
      <a v-if="user.email" class="flex items-center gap-x-1" @click="user.email = false">Log out
      </a>
      <a v-if="!user.email" class="flex items-center gap-x-1" @click="user.email = true">Log in
        <ArrowRightIcon class="size-4 text-white" />
      </a>
      
    </nav>

  </header>
</template>

<style scoped>
nav a {
  cursor: pointer;
}

</style>
