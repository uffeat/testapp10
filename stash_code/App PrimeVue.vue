<script setup>
import { ref } from "vue";
import AppHeader from 'components/AppHeader.vue'


import Button from "primevue/button"
import DatePicker from 'primevue/datepicker';

const date = ref();




</script>

<template>
  <AppHeader />
  
  <Button label="Submit"  ></Button>
  <DatePicker v-model="date" />
  

 


</template>

<style scoped></style>
