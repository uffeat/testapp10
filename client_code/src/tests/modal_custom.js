// modal_custom

import { create } from "rollo/component";
import { close, modal } from "rolloui/modal";

document.getElementById('app').classList.add('d-none')
create('div', {id: 'root', parent: document.body})

const form = create(
  "form.d-flex.flex-column.row-gap-3.pt-2",
  {
    noValidate: true,
    on_submit: (event) => {
      event.preventDefault();
      close(event.submitter?._value);
    },
  },
  create("h1", {}, "Enter secret agent number"),
  create("input.form-control", {
    placeholder: "00...",
    on_input: function (event) {
      this.closest("form").querySelector('button[type="submit"]').disabled =
        this.value !== "007";
    },
  }),
  create(
    "menu.d-flex.justify-content-end.column-gap-3.px-2.pt-2.m-0",
    {},
    create(
      "button.btn.btn-primary",
      { type: "submit", disabled: true, _value: true },
      "OK"
    ),
    create("button.btn.btn-primary", {}, "Cancel")
  )
);

const result = await modal({
  content: form,
  dismissible: false,
  size: "lg",
});

console.log("Modal result:", result);