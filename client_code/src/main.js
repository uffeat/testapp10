import "./bootstrap.scss";
import './main.css'

import { createApp } from 'vue'

import App from './App.vue'

import { create } from 'rollo/component'

const app_element = create('div', {id: 'app', parent: document.body})

import { FileInput } from "./rolloui/form/input/FileInput";


create('div', {id: 'root', parent: document.body})
const form = create(
  "form.d-flex.flex-column.row-gap-3.p-3",
  { parent: root, noValidate: true },
  create("h1", {}, "Hi"),
  FileInput({ label: "My file", name: "my_file", required: true }),
  FileInput({  label: "My files", name: "my_files", multiple: true, required: true }),
  FileInput({
    floating: true,
    label: "My file",
    name: "my_floating_file",
    required: true,
  }),
  FileInput({
    floating: true,
    label: "My files",
    multiple: true,
    name: "my_floating_files",
    required: true,
  })
);



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

