// check_input
import { create } from "rollo/component";
import { CheckInput } from "rolloui/form/input/CheckInput";

document.getElementById('app').classList.add('d-none')
create('div', {id: 'root', parent: document.body})

const form = create(
  "form.d-flex.flex-column.row-gap-3.p-3",
  { parent: root, noValidate: true },
  CheckInput({
    label: "Accept",
    name: "accept",
    required: true,
    toggle: true,
    value: true,
  }),
  CheckInput({ label: "Agree", name: "agree", required: false, value: true })
);
