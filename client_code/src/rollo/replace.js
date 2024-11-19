import { create } from "rollo/component";

/* Replaces native element with its non-autonomous web component counterpart. */
export function element_to_component(element) {
  const component = create(element.tagName.toLowerCase());
  Array.from(element.attributes).forEach((attr) =>
    component.setAttribute(attr.name, attr.value)
  );
  component.append(...element.childNodes);
  element.replaceWith(component);
}

/* Replaces native descendants with non-autonomous web component counterparts. */
export function convert_descendants(element) {
  const descendants = [...element.querySelectorAll("*")];
  if (descendants.length === 0) {
    if (!element.tagName.includes("-")) {
      element_to_component(element);
    }
  } else {
    for (const descendant of [...descendants]) {
      if (!descendant.tagName.includes("-")) {
        element_to_component(descendant);
      }
      convert_descendants(descendant);
    }
  }
}