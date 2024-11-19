// text_input

import { create } from "rollo/component";
import { TextInput } from "rolloui/form/input/TextInput";

document.getElementById('app').classList.add('d-none')
create('div', {id: 'root', parent: document.body})

const form = create(
  "form.d-flex.flex-column.row-gap-3",
  { parent: root, noValidate: true },
  TextInput({
    name: "my_name",
    min: 3,
    required: true,
    validations: [
      function (value) {
        if (value && value.toLowerCase() !== "rufus") {
          return "Not Rufus";
        }
      },
    ],
  }),
);