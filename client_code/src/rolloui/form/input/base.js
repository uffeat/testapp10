import 'rolloui/form/form.css'
import { create } from "rollo/component";

export function base(
  {
    name,
    required = false,
    type = "text",
    validations,
    $value = null,
    ...props
  } = {},
  ...children
) {
  /* NOTE validations not passed on as prop item */
  return create(
    (() => {
      if (
        [
          "date",
          "datetime-local",
          "email",
          "file",
          "password",
          "text",
        ].includes(type)
      ) {
        return "input.form-control";
      } else if (["checkbox", "radio"].includes(type)) {
        return "input.form-check-input";
      } else if (type === "textarea") {
        return "textarea.form-control";
      } else if (type === "select") {
        return "select.form-select";
      } else {
        throw new Error(`Unsupported type: ${type}`);
      }
    })(),
    {
      name,
      required,
      /* Take into account that native select and textarea do not have a type prop */
      type: ["select", "textarea"].includes(type) ? undefined : type,
      $data_error: null,
      $data_visited: false,
      $value,
      ...props,
    },
    function (fragment) {
      /* Add effect to control "is-invalid" css class */
      this.effects.add(
        (data) => {
          this.css_class["is-invalid"] =
            this.$.data_error && this.$.data_visited;
        },
        ["data_error", "data_visited"]
      );
      /* Add effect to control custom validity */
      this.effects.add((data) => {
        this.setCustomValidity(this.$.data_error ? " " : "");
      }, "data_error");
      /* Add effect to set data_error state from required validation */
      this.effects.add((data) => {
        if (this.required) {
          this.$.data_error = this.$.value === null ? "Required" : null;
        }
      }, "value");
      /* Add effect to set data_error state from validations */
      if (validations) {
        this.effects.add((data) => {
          /* Abort, if required and value state is null */
          if (this.required && this.$.value === null) return;
          /* Run validations in order. 
          data_error state is successively set to validation result.
          Validation aborts, once a truthy validation result is received. */
          for (const validation of validations) {
            const message = validation.call(this, this.$.value);
            this.$.data_error = message;
            if (message) {
              break;
            }
          }
        }, "value");
      }
      /* Add handler to set data_visited state */
      const onblur = (event) => {
        this.$.data_visited = true;
        //this.removeEventListener('blur', onblur)
      }
      this.on.blur = onblur
      
    },
    ...children
  );
}
