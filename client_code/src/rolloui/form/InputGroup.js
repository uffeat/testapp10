import { create } from "rollo/component";

export function InputGroup(props = {}, ...children) {
  return create("div.input-group", props, ...children);
}