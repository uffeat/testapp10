<script setup>
import { ref } from "vue";
import AppHeader from 'components/AppHeader.vue'

const modal_open = ref();


</script>

<template>
  <AppHeader />
  

  <v-btn @click="modal_open = true">
    <span class="text-blue-600">Open</span>
  </v-btn>


 

    <v-dialog
      v-model="modal_open"
      width="auto"
    >
      <v-card
        max-width="400"
        prepend-icon="mdi-update"
        text="Your application will relaunch automatically after the update is complete."
        title="Update in progress"
      >
        <template v-slot:actions>
          <v-btn
            class="ms-auto"
            text="Ok"
            @click="modal_open = false"
          ></v-btn>
        </template>
      </v-card>
    </v-dialog>



</template>

<style scoped></style>
