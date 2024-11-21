/*  */
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

/* Uility for composing and registering non-autonomous web components on demand. */
const components = new (class Components {
  get registry() {
    return this.#registry;
  }
  #registry = new (class Registry {
    #registry = {};
    /*  */
    add = (tag, cls) => {
      customElements.define(`native-${tag}`, cls, {
        extends: tag,
      });
      this.#registry[tag] = cls;
      return cls;
    };
    /*  */
    get = (tag) => {
      return this.#registry[tag];
    };
  })();

  get factories() {
    return this.#factories;
  }
  #factories = new (class Factories {
    #registry = [];
    /* Registers conditional web component class factory */
    add = (condition, factory) => {
      this.#registry.push([condition, factory]);
    };
    /* Returns factories relevant for a given tag */
    get = (tag) => {
      return this.#registry
        .filter(([condition, factory]) => condition(tag))
        .map(([condition, factory]) => factory);
    };
  })();

  /* Returns instance of non-autonomous web component  */
  create = (arg, { parent, ...updates } = {}, ...args) => {
    /* Extract tag and css_classes from arg */
    const [tag, ...css_classes] = arg.split(".");
    const element = new (this.get(tag))();
    /* Add css classes */
    if (css_classes.length > 0) {
      /* NOTE Condition avoids adding empty class attr */
      element.classList.add(...css_classes);
    }
    element.update(updates);
    /* Parse args (children and hooks) */
    parent = parent && element.parentElement !== parent ? parent : undefined;
    const fragment = document.createElement("div");
    for (const arg of args) {
      if (arg === undefined) {
        continue;
      }
      if (typeof arg === "function") {
        arg.call(element, fragment, parent);
        continue;
      }
      fragment.append(arg);
    }
    /* Append children */
    element.append(...fragment.children);

    /* Add to parent */
    if (parent) {
      parent.append(element);
      parent.dispatchEvent(new CustomEvent("child", { detail: element }));
    } else {
    }
    return element;
  };

  /* Returns non-autonomous web component class. */
  get = (tag) => {
    let cls = this.registry.get(tag);
    if (cls) {
      return cls;
    }
    const native = document.createElement(tag).constructor;
    if (native === HTMLUnknownElement) {
      throw new Error(`Invalid tag: ${tag}`);
    }
    const factories = this.factories.get(tag);
    cls = this.author(native, ...factories);
    return this.registry.add(tag, cls);
  };

  /* Builds and returns web component class from native base and factories. */
  author = (native, ...factories) => {
    let cls = this.#base(native);
    const names = [cls.name];
    const chain = [native, cls];
    for (const factory of factories) {
      cls = factory(cls);
      if (names.includes(cls.name)) {
        console.warn(
          `Factory class names should be unique for better traceability. Got duplicate: ${cls.name}`
        );
      }
      names.push(cls.name);
      chain.push(cls);
    }
  
    cls.__chain__ = Object.freeze(chain.reverse())
    return cls;
  };

  /* Returns base factory to be used for all web components. */
  #base = (native) => {
    /* Base factory that 'Components' relies on */
    const cls = class ReactiveBase extends native {
      constructor(...args) {
        super(...args);
        /* Identify as web component. */
        this.setAttribute("web-component", "");

        //console.log(Object.getPrototypeOf(this).constructor)
        //console.log(Object.getOwnPropertyNames(this.constructor))

        console.log(this.constructor.__chain__)

        const chain = [];
        let proto = Object.getPrototypeOf(this).constructor;
        while (proto !== HTMLElement) {
          chain.push(proto);
          //console.log(proto)
          proto = Object.getPrototypeOf(proto);
        }

        console.log(chain);

        //console.log(proto)
        //console.log(proto.constructor)
        //console.log(Object.getOwnPropertyNames(proto))
      }

      connectedCallback() {
        super.connectedCallback && super.connectedCallback();
        this.$.connected = true;
        this.dispatchEvent(new Event("connected"));
      }

      disconnectedCallback() {
        super.disconnectedCallback && super.disconnectedCallback();
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

      /* Returns an object, from which single state items can be retrieved 
      and set to trigger effects. */
      get $() {
        return this.#reactive.$;
      }

      /* Returns controller for managing effects. */
      get effects() {
        return this.#reactive.effects;
      }

      /* Exposes reactive instance for full access */
      get reactive() {
        return this.#reactive;
      }
      #reactive = Reactive.create(null, { owner: this });

      /* Updates props and state. Chainable. */
      update = (updates) => {
        const props = Object.fromEntries(
          Object.entries(updates).filter(([key, value]) => !key.startsWith("$"))
        );
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
        const state = Object.fromEntries(
          Object.entries(updates)
            .filter(([key, value]) => key.startsWith("$"))
            .map(([key, value]) => [key.slice(1), value])
        );
        this.reactive.update(state);
        return this;
      };
    };
    return cls;
  };
})();

/* Factories */

components.factories.add(
  (tag) => true,
  (parent) => {
    function camel_to_kebab(camel) {
      return camel.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    }

    /* General factory for all components */
    const cls = class Component extends parent {
      constructor(...args) {
        super(...args);
      }

      /* Getter/setter interface to attributes. */
      get attribute() {
        return this.#attribute;
      }
      #attribute = new Proxy(this, {
        get(target, key) {
          key = camel_to_kebab(key);
          if (!target.hasAttribute(key)) {
            return null;
          }
          const value = target.getAttribute(key);
          if (value === "") {
            return true;
          }
          const number = Number(value);
          if (typeof number === "number" && number === number) {
            return number;
          }
          return value;
        },
        set(target, key, value) {
          if (value === undefined) return true;
          key = camel_to_kebab(key);
          if ([false, null].includes(value)) {
            /* Remove attr */
            target.removeAttribute(key);
            return true;
          }
          if (["", true].includes(value)) {
            /* Set no-value attr */
            target.setAttribute(key, "");
            return true;
          }
          /* Set value attr */
          if (!["number", "string"].includes(typeof value)) {
            throw new Error(`Invalid attr value: ${value}`);
          }
          target.setAttribute(key, value);
          return true;
        },
      });

      /* Getter/setter interface to css classes. */
      get css() {
        return this.#css;
      }
      #css = new Proxy(this, {
        get(target, css_class) {
          return target.classList.contains(css_class);
        },
        set(target, css_class, value) {
          if (value) {
            target.classList.add(css_class);
          } else {
            target.classList.remove(css_class);
          }
          return true;
        },
      });

      /* Getter/setter interface component-scoped css vars. */
      get __() {
        return this.#__;
      }
      #__ = new Proxy(this, {
        get(target, key) {
          /* 
      TODO 
      Perhaps provide additional ways to retrieve css var?
      Not sure, if the current approach is adequate, if css var has been set inline?
      Do some testing to check...  
      */
          return getComputedStyle(target).getPropertyValue(`--${key}`).trim();
        },
        set(target, key, value) {
          if (value) {
            target.style.setProperty(`--${key}`, value);
          } else {
            target.style.removeProperty(`--${key}`);
          }
          return true;
        },
      });

      /* Syntactic sugar for event handler registration. */
      get on() {
        return this.#on;
      }
      #on = new Proxy(this, {
        get() {
          throw new Error(`'on' is write-only.`);
        },
        set(target, type, handler) {
          target.addEventListener(type, handler);
          return true;
        },
      });

      /* Returns array of unique descendant elements that match ANY selectors. 
      Returns null, if no matches.
      A more versatile alternative to querySelectorAll with a return value 
      that array methods can be used directly on (unless null) */
      get = (...selectors) => {
        const elements = [
          ...new Set(
            selectors
              .map((selector) => [...this.querySelectorAll(selector)])
              .flat()
          ),
        ];
        return elements.lenght === 0 ? null : elements;
      };

      /* Dispatches custom event and returns detail. */
      send = (type, { detail, ...options } = {}) => {
        this.dispatchEvent(new CustomEvent(type, { detail, ...options }));
        /* NOTE If detail is mutable, it's handy to get it back, 
        since handler may have mutated it. This enables two-way communication 
        between event target and handler. */
        return detail;
      };
    };
    return cls;
  }
);

components.factories.add(
  (tag) => {
    const element = document.createElement(tag);
    try {
      element.attachShadow({ mode: "open" });
      return true;
    } catch {
      return false;
    }
  },
  (parent) => {
    /* Factory for components that support shadow dom */
    const cls = class Shadow extends parent {
      constructor(...args) {
        super(...args);
        /* Init shadow-dom-enabled state */
        this.$.has_children = false;
        this.$.has_content = false;

        this.attachShadow({ mode: "open" });
        const slot = document.createElement("slot");
        this.shadowRoot.append(slot);

        slot.addEventListener("slotchange", (event) => {
          this.send("slotchange");
          /* Update state */
          this.$.has_children = this.children.length > 0;
          this.$.has_content = this.childNodes.length > 0;
        });
      }
    };
    return cls;
  }
);

components.factories.add(
  (tag) => {
    const element = document.createElement(tag);
    return "textContent" in element;
  },
  (parent) => {
    /* Factory for components with 'textContent' prop */
    const cls = class Text extends parent {
      constructor(...args) {
        super(...args);
      }

      get text() {
        return this.textContent;
      }
      set text(text) {
        this.textContent = text;
      }
    };
    return cls;
  }
);

export const create = components.create;

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
