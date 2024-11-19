import { Modal } from "bootstrap";
import { create } from "rollo/component";

/* Shows a modal and returns a promise that resolves to the modal's value, 
when the modal hides. */
export function modal(
  {
    content,
    centered,
    dismissible = true,
    hooks = [],
    fade = true,
    scrollable,
    size,
    style,
    tag = "div",
    title,
  },
  ...buttons
) {
  // Create modal element
  const element = create(
    // Handle fade animation
    `div.modal${fade ? ".fade" : ""}`,
    { parent: document.body, attr_tabindex: "-1" },
    create(
      // Handle centered, scrollable and size
      `div.modal-dialog${scrollable ? ".modal-dialog-scrollable" : ""}${
        centered ? ".modal-dialog-centered" : ""
      }${size ? ".modal-" + size : ""}`,
      {},
      create(
        `${tag}.modal-content`,
        {},
        function add_header(fragment) {
          if (dismissible || title) {
            const header = create(
              `div.modal-header${style ? ".text-bg-" + style : ""}`
            );
            if (title) {
              if (typeof title === "string") {
                title = create(`h1.modal-title.fs-3.text`, {}, title);
              } else {
                title.classList.add("modal-title");
              }
              header.append(title);
            }
            if (dismissible) {
              header.append(
                create(
                  `button.btn-close${
                    ["danger", "primary", "secondary", "success"].includes(
                      style
                    )
                      ? ".btn-close-white"
                      : ""
                  }`,
                  {
                    data_bsDismiss: "modal",
                  }
                )
              );
            }
            this.append(header);
          }
        },
        // Handle body
        create(`div.modal-body`, {}, function add_content(fragment) {
          if (content) {
            if (typeof content === "string") {
              fragment.append(create("p", {}, content));
            } else {
              fragment.append(content);
            }
          }
        }),
        function add_footer(fragment) {
          if (buttons.length > 0) {
            const footer = create(`div.modal-footer`, {});
            /* Transform buttons */
            buttons.forEach((b) => {
              if (Array.isArray(b)) {
                let [text, value, style = ""] = b;
                if (style) {
                  style = `.btn-${style}`;
                }
                const button = create(
                  `button.btn${style}`,
                  {
                    onclick: (event) => {
                      event.target.closest(".modal").close(value);
                    },
                  },
                  text
                );
                footer.append(button);
              } else {
                footer.append(b);
              }
            });
            fragment.append(footer);
          }
        }
      )
    ),
    ...hooks
  );

  // Handle dismissible
  const config = {};
  if (!dismissible) {
    config.backdrop = "static";
    config.keyboard = false;
  }

  // Create Bootstrap Modal
  const modal = new Modal(element, config);

  // Ensure clean-up
  element.addEventListener("hidden.bs.modal", () => {
    modal.dispose();
    element.remove();
  });

  /* Give modal element a 'close' method that can set value 
  (on modal element) and close the modal */
  element.close = (value) => {
    element.value = value;
    modal.hide();
  };

  // Show the modal
  modal.show();

  // Enable closing by bubbling close custom event
  element.addEventListener("close", (event) => {
    event.stopPropagation();
    element.close(event.detail);
  });

  /* Return a promise that resolves to the modal element's value, 
  when the modal hides */
  return new Promise((resolve, reject) => {
    element.addEventListener("hide.bs.modal", (event) => {
      resolve(element.value);
    });
  });
}

/* Helper function for closing modal with a given value. 
Typically, called from within a button's click handler.
Use when conditional closing and/or flexibility re modal value is needed. */
export function close(value) {
  document.querySelector(".modal").close(value);
}

/*
EXAMPLES

// Hello World
await (async () => {
  const { modal } = await import("utils/modal");
  const result = await modal(
    { title: "Hello world!", content: "The modal function is awesome.", size: 'lg', style: 'primary' },
    ["OK", true, 'success'], ["Cancel", false, 'danger']
  );
  console.log("Modal result:", result);
})();

*/
