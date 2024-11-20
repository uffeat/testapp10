
import { Offcanvas } from "bootstrap";

import { create } from "rollo/component";


const ID = "Offcanvas";

/* Shows an offcanvas and returns a promise that resolves to the offcanvas' value, 
when the offcanvas hides */
export function offcanvas(
  {
    bodyScroll = false,
    content = null,
    dismissible = true,
    placement = "bottom",
    title = null,
  },
  ...buttons
) {
  // Check placement
  if (!["bottom", "end", "start", "top"].includes(placement)) {
    throw new Error(`Invalid placement: ${placement}`);
  }

  // Create offcanvas element
  const element = create(
    // Handle placement
    `div.offcanvas.offcanvas-${placement}.d-flex.flex-column`,
    { id: ID, parent: document.body },
    create(
      `header.offcanvas-header`,
      {},
      // Handle title
      function () {
        if (title) {
          if (typeof title === "string") {
            title = create("h1.fs-2.text", {}, title);
          }
          return title;
        }
      },

      create(`button.btn-close`, { type: "button" })
        .update_dataset({
          bsDismiss: "offcanvas",
        })
        .update_attrs({ "aria-label": "Close" })
    ),
    create(
      `main.offcanvas-body.flex-grow-1`,
      {},
      // Handle content
      function () {
        if (content) {
          if (typeof content === "string") {
            content = create("p", {}, content);
          }
          return content;
        }
      }
    ),
    function () {
      if (buttons.length > 0) {
        const menu = create(
          "menu.d-flex.justify-content-end.column-gap-3.p-3.m-0"
        );
        const footer = create(`footer`, {}, menu);
        for (const b of buttons) {
          if (Array.isArray(b)) {
            let [text, value, style] = b;
            style = style ? `.btn-${style}` : "";
            const button = create(
              `button.btn${style}`,
              {
                onclick: () => close(value),
              },
              text
            );
            menu.append(button);
          } else {
            footer.append(b);
          }
        }

        return footer;
      }
    }
  ).update_attrs({ tabindex: "-1" });

  // Handle dismissible
  const config = {};
  if (!dismissible) {
    config.backdrop = "static";
    config.keyboard = false;
  }
  // Handle scroll
  config.scroll = bodyScroll;

  // Create Bootstrap Offcanvas
  const offcanvas = new Offcanvas(element, config);

  // Ensure clean-up
  element.addEventListener("hidden.bs.offcanvas", () => {
    offcanvas.dispose();
    element.remove();
  });

  /* Give offcanvas element a 'close' method that can set value 
  (on offcanvas element) and close the offcanvas */
  element.close = (value) => {
    element.value = value;
    offcanvas.hide();
  };

  // Show the offcanvas
  offcanvas.show();

  // Enable closing by bubbling x-close custom event
  element.addEventListener("x-close", (event) => {
    event.stopPropagation();
    element.close(event.detail);
  });

  /* Return a promise that resolves to the offcanvas element's value, 
  when the offcanvas hides */
  return new Promise((resolve, reject) => {
    element.addEventListener("hide.bs.offcanvas", (event) => {
      resolve(element.value);
    });
  });
}

/* Helper function for closing offcanvas with a given value. */
export function close(value) {
  const element = document.getElementById(ID);
  element.close(value);
}

/*
# EXAMPLES

## Example: Hello World

*/
