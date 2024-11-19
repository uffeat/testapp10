import { create } from "rollo/component";
import { create_id } from "./utils/create_id";

export function Label(input_element, props = {}, ...children) {
  return create(
    "label.form-label",
    props,
    function (fragment) {
      if (!input_element.id) {
        input_element.id = create_id();
      }
      this.attr.for = input_element.id;
    },
    ...children
  );
}