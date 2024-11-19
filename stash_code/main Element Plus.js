import { createApp } from "vue";
import "./main.css";
// ElementPlus
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";

import App from "./App.vue";

const app = createApp(App);

// Do any configs before mount

app.use(ElementPlus, { zIndex: 3000 });

app.mount("#app");
