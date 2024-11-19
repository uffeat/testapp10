import "./bootstrap.scss";
import './main.css'

import { createApp } from 'vue'

import App from './App.vue'
import { create } from 'rollo/component'

create('div', {id: 'app', parent: document.body})

const app = createApp(App)
// Do any configs before mount
app.mount('#app')

if (import.meta.env.DEV) {
  let path = "";
  window.addEventListener("keydown", async (event) => {
    if (event.code === "KeyT" && event.shiftKey) {
      path = prompt("Path:", path);
      await import(`./tests/${path}.js`);
    }
  });
}

