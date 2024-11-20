// file_input
import { create } from "rollo/component";
import { FileInput } from "rolloui/form/input/FileInput";

document.getElementById('app').classList.add('d-none')
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
