import { createApp } from "vue";
import "./main.css";

// For Naive UI
import "vfonts/Lato.css";
import "vfonts/FiraCode.css";

import App from "./App.vue";

const app = createApp(App);

// Do any configs before mount

app.mount("#app");
