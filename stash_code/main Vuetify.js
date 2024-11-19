import { createApp } from "vue";
import "./main.css";

// Vuetify
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

import App from "./App.vue";

const app = createApp(App);

// Do any configs before mount

const vuetify = createVuetify({
  components,
  directives,
});

app.use(vuetify);

app.mount("#app");
