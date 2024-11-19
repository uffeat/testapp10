//import "./form.css";
import { Cancel as CancelIcon } from "rollo/icons/Cancel.js";
import { Upload as SelectIcon } from "rollo/icons/Upload.js";
import { create } from "rollo/component";
import { ErrorFeedback } from "../ErrorFeedback";
import { FormFloating } from "../FormFloating";
import { InputGroup } from "../InputGroup";
import { create_id } from "../utils/create_id";

export function FileInput(
  {
    accept,
    floating = false,
    label = null,
    multiple = false,
    name,
    placeholder = "No file selected",
    required = false,
    ...props
  } = {},
  ...children
) {
  const file_control = FileControl({ accept, multiple, name, required });
  const error_feedback = ErrorFeedback(file_control);
  const select_trigger = SelectTrigger(file_control);
  const clear_trigger = ClearTrigger(file_control);
  const selection_display = SelectionDisplay(file_control, {
    floating,
    placeholder,
  });

  const input_group = InputGroup(
    {},
    select_trigger,
    floating ? FormFloating({ label }, selection_display) : selection_display,
    clear_trigger
  );
  return create(
    "section",
    props,
    label && !floating ? Label(file_control, { text: label }) : undefined,
    input_group,
    error_feedback,
    file_control,
    ...children
  );
}

function ClearTrigger(file_input, props = {}, ...children) {
  return create(
    "button.btn.btn-outline-secondary",
    props,
    CancelIcon({ size: 24 }),
    function (fragment) {
      /* Add handler to reset file input value state */
      this.on.click = (event) => {
        event.preventDefault();
        file_input.$.value = null;
      };
    },
    ...children
  );
}

function FileControl(
  { accept, multiple = false, name, required = false, ...props } = {},
  ...children
) {
  return create(
    "input",
    {
      accept,
      display: "none",
      multiple,
      name,
      required,
      type: "file",
      $data_error: null,
      $data_visited: false,
      $value: null,
      mixins: [
        class {
          get value() {
            return this.$.value;
          }
        },
      ],
      ...props,
    },
    function (fragment) {
      /* Add handler to update value state from selected file(s) */
      this.on.change = (event) => {
        if (this.multiple) {
          this.$.value = this.files.length > 0 ? [...this.files] : null;
        } else {
          this.$.value = this.files.length > 0 ? this.files[0] : null;
        }
      };
      /* Add effect to update data_error state from value state */
      this.effects.add((data) => {
        if (this.required) {
          this.$.data_error = !this.$.value ? "Required" : null;
        }
      }, "value");
    },
    ...children
  );
}

function Label(input_element, props = {}, ...children) {
  return create(
    /* HACK Style as btn to avoid focus outline */
    "label.form-label.btn.p-0.mb-1",
    { attr_tabindex: "0", ...props },
    function (fragment) {
      if (!input_element.id) {
        input_element.id = create_id();
      }
      this.attr.for = input_element.id;
      /* Add handler to set data_visited state */
      /* Blur happens, when file selector opens; therefore flag needed to determine,
      if file selector has been opened previously . */
      let visited;
      const on_blur = (event) => {
        if (visited) {
          input_element.$.data_visited = true;
          this.removeEventListener("blur", on_blur);
        }
        visited = true;
      };
      this.on.blur = on_blur;
    },
    ...children
  );
}

function SelectionDisplay(
  file_input,
  { floating, placeholder, ...props },
  ...children
) {
  return create(
    "input.form-control",
    {
      attr_ariaLive: "polite",
      inert: true,
      ...props,
    },
    function (fragment) {
      /* Add effect to update selection display */
      file_input.effects.add((data) => {
        if (file_input.multiple) {
          if (file_input.$.value) {
            if (file_input.$.value.length === 1) {
              this.value = file_input.$.value[0].name;
            } else {
              this.value = `${file_input.$.value.length} files selected`;
            }
          } else {
            this.value = floating ? null : placeholder;
          }
        } else {
          const value = floating ? null : placeholder;
          this.value = file_input.$.value ? file_input.$.value.name : value;
        }
      }, "value");
      /* Add effect to handle error styling */
      file_input.effects.add(
        (data) => {
          this.css_class["is-invalid"] =
            file_input.$.data_error && file_input.$.data_visited;
        },
        ["data_error", "data_visited"]
      );
    },
    ...children
  );
}

function SelectTrigger(file_input, props = {}, ...children) {
  return create(
    "button.btn.btn-outline-secondary",
    props,
    SelectIcon(),
    function (fragment) {
      /* Add handler to open file selector */
      this.on.click = (event) => {
        event.preventDefault();
        file_input.click();
      };
      /* Add handler to set data_visited state */
      /* Blur happens, when file selector opens; therefore flag needed to determine,
      if file selector has been opened previously . */
      let visited;
      const on_blur = (event) => {
        if (visited) {
          file_input.$.data_visited = true;
          this.removeEventListener("blur", on_blur);
        }
        visited = true;
      };
      this.on.blur = on_blur;
    },
    ...children
  );
}
