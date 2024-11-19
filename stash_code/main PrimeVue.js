import { createApp } from "vue";
import "./main.css";

// PrimeVue
import PrimeVue from "primevue/config";
//import Aura from '@primevue/themes/aura';
import Material from "@primevue/themes/material";
//import Lara from '@primevue/themes/lara';
//import Nora from '@primevue/themes/nora';

import App from "./App.vue";

const app = createApp(App);

// Do any configs before mount

app.use(PrimeVue);

app.use(PrimeVue, {
  theme: {
    preset: Material,
  },
});

app.mount("#app");
