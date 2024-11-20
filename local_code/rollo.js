class Reactive {
  static create = (state, { name, owner } = {}) => {
    return new Reactive(state, { name, owner });
  };
  /* Helper for conditionally calling effect function. */
  static #call_effect = (effect, condition, ...args) => {
    if (!condition || condition(...args)) {
      effect(...args);
    }
  };
  #data = {};
  #effect_registry = new Map();
  #effect_controller;
  #name;
  #owner;
  #previous_data = {};

  constructor(state, { name, owner } = {}) {
    this.#name = name;
    this.#owner = owner;
    if (state) {
      this.#update_stores(state);
    }

    /* Enable reference in EffectController */
    const reactive = this;

    /* Storage util for, potentially conditional, effect functions. */
    this.#effect_controller = new (class EffectController {
      /* Returns number of registered effecs */
      get size() {
        return reactive.#effect_registry.size;
      }

      /* Adds and returns effect.
      NOTE Effects are stored as keys with condition as value. */
      add = (effect, condition) => {
        condition = this.#interpret_condition(condition);
        /* Register effect */
        reactive.#effect_registry.set(effect, condition);
        /* Call effect by passing in arg based on the full underlying data and 
        using the same stucture as when the effect is called reactively */
        Reactive.#call_effect(
          effect,
          condition,
          reactive.#create_effect_data(...Object.keys(reactive.#data)),
          reactive
        );
        /* Return effect, so that effects added with function expressions
        can be removed later */
        return effect;
      };

      /* Removes all effects. Use with caution. Chainable with respect to reactive. */
      clear = () => {
        this.reactive.#effect_registry = new Map();
        return reactive;
      };

      /* Tests, if effect is registered. */
      has = (effect) => {
        return reactive.#effect_registry.has(effect);
      };

      /* Removes effect. Chainable with respect to reactive. */
      remove = (effect) => {
        reactive.#effect_registry.delete(effect);
        return reactive;
      };

      /* Returns condition, potentially created from short-hand. */
      #interpret_condition = (condition) => {
        if (condition === undefined) return;
        if (typeof condition === "function") return condition;
        if (typeof condition === "string") {
          /* Create condition function from string short-hand:
          data must contain a key corresponding to the string short-hand. */
          const key = condition;
          condition = (data) => key in data;
        } else if (Array.isArray(condition)) {
          /* Create condition function from array short-hand:
          data must contain a key that is present in the array short-hand. */
          const keys = condition;
          condition = (data) => {
            for (const key of keys) {
              if (key in data) {
                return true;
              }
            }
            return false;
          };
        } else {
          /* By usage convention, assume single item plain object of the form: 
          {<required key>: <required current value>} */
          const key = Object.keys(condition)[0];
          const value = Object.values(condition)[0];
          condition = (data) => key in data && data[key].current === value;
        }
        return condition;
      };
    })();
  }

  /* Returns controller for managing effects. */
  get effects() {
    return this.#effect_controller;
  }

  /* Returns name, primarily for optional soft identification. */
  get name() {
    return this.#name;
  }

  /* Returns owner.
  NOTE The owner feature is provided for potential use in extension of or
  compositions with Reactive. */
  get owner() {
    return this.#owner;
  }

  /* Returns object,from which individual state items can be retrieved and set 
  reactively. */
  get $() {
    return this.#state;
  }

  #state = new Proxy(this, {
    get: (target, key) => {
      return this.#data[key];
    },
    set: (target, key, value) => {
      /* Handle function value */
      if (typeof value === "function") {
        value = value.call(this);
      }
      this.update({ [key]: value });
      return true;
    },
  });

  /* Clears state data without publication. Use with caution. Chainable. */
  clear = () => {
    this.#previous_data = this.#data;
    this.#data = {};
    return this;
  };

  /* Returns a shallowly frozen shallow copy of underlying state data as it was 
  before the most recent change. */
  get previous() {
    return Object.freeze({ ...this.#previous_data });
  }

  /* Returns a shallowly frozen shallow copy of underlying state data. */
  get state() {
    return Object.freeze({ ...this.#data });
  }

  /* Updates state from data (object). Chainable.
  Convenient for updating multiple state items in one go.
  Can reduce redundant effect calls. */
  update = (data) => {
    /* Detect changes */
    const changes = this.#get_changes(data);
    /* Abort if no change */
    if (!changes) return;
    /* Update data stores */
    this.#update_stores(changes);
    /* Call effects */
    this.#notify(this.#create_effect_data(...Object.keys(changes)), this);
    return this;
  };

  /* Creates and returns object of the form
  { <key>: { current: <current value>, previous: <previous value> }, <key>: ... }
  to be passed into effects/conditions. */
  #create_effect_data = (...keys) => {
    const data = {};
    for (const key of keys) {
      data[key] = {
        current: this.#data[key],
        previous: this.#previous_data[key],
      };
    }
    Object.freeze(data);
    return data;
  };

  /* Compares state data with 'data'. Returns null, if all items in 'data' 
  are present in state data; otherwise, an object with 'data' items that are 
  different from state data is returned. */
  #get_changes = (data) => {
    const changes = {};
    for (const [key, value] of Object.entries(data)) {
      if (!(key in this.#data) || !this.#is_equal(value, this.#data[key])) {
        changes[key] = value;
      }
    }
    return Object.keys(changes).length === 0 ? null : changes;
  };

  /* Returns Boolean result of simple equality comparison.
  NOTE Default function; may be changed by constructor arg. */
  #is_equal = (value_1, value_2) => value_1 === value_2;

  /* Publishes to effects subject to any conditions. Chainable */
  #notify = (...args) => {
    for (const [effect, condition] of this.#effect_registry) {
      Reactive.#call_effect(effect, condition, ...args);
    }
    return this;
  };

  /* Updates stores with 'data'. Chainable. */
  #update_stores = (data) => {
    this.#previous_data = this.#data;
    for (const [key, value] of Object.entries(data)) {
      this.#data[key] = value;
    }
    return this;
  };
}

const registry = {};


const factory = new (class Factory {
  static #can_have_shadow = (tag) => {
    const element = document.createElement(tag);
    try {
      element.attachShadow({ mode: "open" });
      return true;
    } catch {
      return false;
    }
  }


  #registry = {};
  get = (tag) => {
    if (tag in this.#registry) {
      return this.#registry[tag];
    }
    const WebComponent = this.#create(tag);
    this.#registry[tag] = WebComponent;
    return WebComponent;
  };
  #create = (tag) => {
    const base = document.createElement(tag).constructor;
    if (base === HTMLUnknownElement) {
      throw new Error(`Invalid tag: ${tag}`);
    }
    let WebComponent = class Base extends base {
      constructor() {
        super();
        /* Identify as web component. */
        this.setAttribute("web-component", "");
      }
      connectedCallback() {
        this.$.connected = true;
        this.dispatchEvent(new Event("connected"));
      }
      disconnectedCallback() {
        this.$.connected = false;
        this.dispatchEvent(new Event("disconnected"));
      }
      /* Provides external access to super. */
      get __super__() {
        return this.#__super__;
      }
      #__super__ = new Proxy(this, {
        get: (target, key) => {
          return super[key];
        },
        set: (target, key, value) => {
          super[key] = value;
          return true;
        },
      });
      /* Returns controller for managing subscriptions. */
      get effects() {
        return this.#reactive.effects;
      }
      /* Returns an object, from which single state items can be retrieved 
    and set to trigger effects. */
      get $() {
        return this.#reactive.$;
      }
      get reactive() {
        return this.#reactive;
      }
      #reactive = Reactive.create(null, { owner: this });
      get text() {
        return this.textContent;
      }
      set text(text) {
        this.textContent = text;
      }
      update = (props) => {
        for (const [key, value] of Object.entries(props)) {
          if (key.startsWith("_")) {
            this[key] = value;
          } else if (key in this) {
            this[key] = value;
          } else if (key in this.style) {
            this.style[key] = value;
          } else {
            throw new Error(`Invalid key: ${key}`);
          }
        }
      };
    };
    if (Factory.#can_have_shadow(tag)) {
      WebComponent = class ShadowBase extends WebComponent {
        constructor(...args) {
          super(...args);
          /* Init shadow-dom-enabled state */
          this.$.has_children = false;
          this.$.has_content = false;
          this.attachShadow({ mode: "open" });
          const slot = document.createElement("slot");
          this.shadowRoot.append(slot);
          slot.addEventListener("slotchange", (event) => {
            this.dispatchEvent(new Event("slotchange"));
            /* Update state */
            this.$.has_children = this.children.length > 0;
            this.$.has_content = this.childNodes.length > 0;
          });
        }
      };
    }
    customElements.define(`native-${tag}`, WebComponent, {
      extends: tag,
    });
    return WebComponent;
  };
})();

export const components = new (class Components {
  create = (arg, { parent, state, ...props } = {}, ...args) => {
    /* Extract tag and css_classes from arg */
    const [tag, ...css_classes] = arg.split(".");
    const element = new (factory.get(tag))();
    /* Add css classes */
    if (css_classes.length > 0) {
      /* NOTE Condition avoids adding empty class attr */
      element.classList.add(...css_classes);
    }
    element.update(props);
    if (state) {
      element.reactive.update(state);
    }
    /* Parse args (children and hooks) */
    const fragment = document.createElement("div");
    for (const arg of args) {
      if (arg === undefined) {
        continue;
      }
      if (typeof arg === "function") {
        arg.call(element, fragment);
        continue;
      }
      fragment.append(arg);
    }
    /* Append children */
    element.append(...fragment.children);
    if (parent && element.parentElement !== parent) {
      parent.append(element);
      parent.dispatchEvent(new CustomEvent("child", { detail: element }));
    }
    return element;
  };
})();

export const create_element = components.create;

/* Use with small source classes. */
export function compose(...sources) {
  for (const source of sources) {
    const composition = new source(this);
    if (!source.name) {
      throw new Error(
        `Composition class should be declared with a name or have a static 'name' prop.`
      );
    }
    Object.defineProperty(this, source.name, {
      enumerable: false,
      configurable: true,
      get: () => composition,
    });
  }
  return this;
}

/* Use with small source classes. */
export function mixin(source, ...args) {
  for (const [name, descriptor] of Object.entries(
    Object.getOwnPropertyDescriptors(source.prototype)
  )) {
    if (name === "__init__") {
      descriptor.value.call(this, ...args);
      continue;
    }
    Object.defineProperty(this, name, descriptor);
  }
  return this;
}

/* Private helpers */

function can_have_shadow(tag) {
  const element = document.createElement(tag);
  try {
    element.attachShadow({ mode: "open" });
    return true;
  } catch {
    return false;
  }
}



function camel_to_kebab(camel) {
  return camel.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
