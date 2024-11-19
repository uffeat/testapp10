export function shadow_factory(parent, config, ...factories) {
  return class Shadow extends parent {
    constructor(...args) {
      super(...args);
      /* Init shadow-dom-enabled state */
      this.$.has_children = false;
      this.$.has_content = false;

      this.attachShadow({ mode: "open" });
      const slot = document.createElement("slot");
      this.shadowRoot.append(slot);

      slot.addEventListener("slotchange", (event) => {
        this.send_event("slotchange");
        /* Update state */
        this.$.has_children = this.children.length > 0;
        this.$.has_content = this.childNodes.length > 0;
      });
    }
  };
}