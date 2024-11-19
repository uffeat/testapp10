import { create } from "rollo/component";
import { base } from "./base";
import { ErrorFeedback } from "../ErrorFeedback";
import { create_id } from "../utils/create_id";

/* Returns checkbox-type input element with reactive type-aligned value prop. 
Use as base for building more specialized components. */
export function Check({ value, ...props }, ...children) {
  return base(
    {
      mixins: [
        /* Add mixin to provide external access to value state */
        class {
          get value() {
            return this.$.value;
          }
          set value(value) {
            this.$.value = value;
          }
        },
      ],
      type: "checkbox",
      $value: value,
      ...props,
    },
    function (fragment) {
      /* Add handler that updates value state */
      this.on.change = (event) => {
        this.$.value = this.checked ? true : null;
      };
      /* Add effect to set checked from value state */
      this.effects.add((data) => {
        this.checked = this.$.value ? true : false;
      }, "value");
    },
    ...children
  );
}

/* Returns checkbox-type input element with reactive type-aligned value prop.
Options for switch, label and error feedback. */
export function CheckInput(
  { name, label, required = false, toggle = false, value, ...props },
  ...children
) {
  const check = Check({ name, required, value });
  const error_feedback = required ? ErrorFeedback(check) : undefined;

  if (label) {
    label = create("label.form-check-label", {}, label);
    if (!check.id) {
      check.id = create_id();
    }
    label.attr.for = check.id;
  }

  const form_check = create(
    `div.form-check${toggle ? ".form-switch" : ""}`,
    {
      role: toggle ? "switch" : undefined,
    },
    check,
    label
  );

  return create(
    `div.d-flex.flex-column.align-items-start.row-gap-1`,
    props,
    form_check,
    error_feedback,
    ...children
  );
}
