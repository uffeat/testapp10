import { base } from "./base";


// TODO label and float

/* Returns text-family input element. Use for password- and text-type inputs */
export function TextInput(
  {
    max,
    min,
    name,
    required = false,
    type = "text",
    validations,
    value = null,
    ...props
  } = {},
  ...children
) {
  if (!["email", "password", "text", "textarea"].includes(type)) {
    throw new Error(`Unsupported type: ${type}`);
  }
  /* NOTE Allow "email" and "textarea", so that the component can be 
  used as base for these more specialized components */
  /* NOTE max/min not passed on as props */

  /* Inject max validation into validations */
  if (max) {
    const validate_max = (value) =>
      value && value.length > max ? "Too long" : null;
    if (validations) {
      validations = [validate_max, ...validations];
    } else {
      validations = [validate_max];
    }
  }
  /* Inject min validation into validations */
  if (min) {
    const validate_min = (value) =>
      value && value.length < min ? "Too short" : null;
    if (validations) {
      validations = [validate_min, ...validations];
    } else {
      validations = [validate_min];
    }
  }
  return base(
    {
      mixins: [
        /* Add mixin to provide external access to value state */
        class {
          get value() {
            return this.$.value;
          }
          set value(value) {
            if (value !== null) {
              value = value.trim();
              if (value === "") {
                value = null;
              }
            }
            this.$.value = this.__super__.value = value;
          }
        },
      ],
      name,
      required,
      type,
      validations,
      $value: value,
      ...props,
    },
    function (fragment) {
      /* Add handler that updates value state */
      this.on.input = (event) => {
        this.value = this.__super__.value;
      }
      
    },
    ...children
  );
}