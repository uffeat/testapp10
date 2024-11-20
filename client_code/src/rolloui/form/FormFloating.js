import { create } from "rollo/component";
import { create_id } from "rolloui/form/utils/create_id";

export function FormFloating({ label, ...props }, input_element, ...children) {
  input_element.placeholder = '';
  if (label) {
    label = create("label.form-check-label", {}, label);
    if (!input_element.id) {
      input_element.id = create_id();
    }
    label.attr.for = input_element.id;
  }
  return create(
    "div.form-floating",
    props,
    input_element,
    label,
    ...children
  );
}