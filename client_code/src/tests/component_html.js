// component_html
import { create } from "rollo/component";
import { html } from "rollo/html";

document.getElementById('app').classList.add('d-none')
create('div', {id: 'root', parent: document.body})


const component = create('div', {parent: root}, html`<div
  class="foo"
  foo="42"
  data-foo="42"
  bar
  data-bar
  style="background-color: pink"
>
  <h1>Hello from <span>foo</span>!</h1>
  <button class="btn btn-success" onclick="console.log('CLICKED')">
    Click
  </button>
</div>`)

console.log(component);