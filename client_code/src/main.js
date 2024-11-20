import "./bootstrap.scss";
import './main.css'

import { createApp } from 'vue'

import App from './App.vue'
import { create } from 'rollo/component'

create('div', {id: 'app', parent: document.body})

import 'rolloui/form/form.css'

create('div.form-check.form-switch', {parent: document.body},
  create('input.form-check-input', {type: 'checkbox', role: "switch"})
)

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

