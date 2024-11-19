import { registry } from "rollo/registry";
import { base_factory } from "rollo/factories/base";
import { shadow_factory } from "rollo/factories/shadow";
import { base_from_tag } from "rollo/base_from_tag";
import { can_have_shadow } from "rollo/can_have_shadow";
import { create_class } from "rollo/create_class";
import { is_html } from "rollo/is_html";
import { is_node } from "rollo/is_node";



/* Util for authoring and instantiating web components derived from a common base
with reactive features. */
export const component = new (class {
  /* Creates, registers and returns web component derived from Base - and if relevant
  Shadow. Supports synthetic multiple-inheritance via factory functions. */
  author = ({ base = HTMLElement, config = {}, key }, ...factories) => {
    let cls;
    if (base === HTMLElement) {
      /* Handle autonomous */
      cls = create_class(
        base,
        config,
        base_factory,
        shadow_factory,
        ...factories
      );
      customElements.define(key, cls);
      registry.add(key, cls);
    } else if (typeof base === "string") {
      /* Handle non-autonomous */
      const tag = base;
      base = base_from_tag(tag);
      if (!base) {
        throw new Error(`Invalid tag: ${tag}`);
      }
      if (can_have_shadow(tag)) {
        factories = [base_factory, shadow_factory, ...factories];
      } else {
        factories = [base_factory, ...factories];
      }
      cls = create_class(base, config, ...factories);
      customElements.define(key || `native-${tag}`, cls, {
        extends: tag,
      });
      registry.add(key || tag, cls);
    } else {
      throw new Error(`Invalid base: ${base}`);
    }
    return cls;
  };

  /* Returns web component instance with rich in-line configuration options,
  incl. iife's and hooks.
  Inspired by React's createElement and hook concepts. */
  create = (arg, { compositions, mixins, ...props } = {}, ...args) => {
    /* Extract tag and css_classes from arg */
    const [tag, ...css_classes] = arg.split(".");
    const self = new (this.get(tag))(props, ...args);
    /* Apply any mixins */
    if (mixins) {
      mixins.forEach((mixin) => self.mixin(mixin, props, ...args));
    }
    /* Apply any compositions */
    if (compositions) {
      self.compose(...compositions);
    }
    /* Add css classes */
    if (css_classes.length > 0) {
      /* NOTE Condition avoids adding empty class attr */
      self.classList.add(...css_classes);
    }
    /* Set props */
    self.update(props);
    /* Parse args (children and hooks) */
    const deferred = [];
    const fragment = new (this.get("div"))();
    const hooks = [];
    for (const arg of args) {
      if (arg === undefined) {
        continue;
      }
      if (is_html(arg)) {
        fragment.add_html(arg);
        continue;
      }
      if (is_node(arg)) {
        fragment.append(arg);
        continue;
      }
      if (Array.isArray(arg)) {
        for (const node of arg) {
          if (!is_node(node)) {
            throw new Error(`Invalid node: ${node}`);
          }
          fragment.append(node);
        }
        continue;
      }
      if (typeof arg === "function") {
        hooks.push(arg);
        continue;
      }
      throw new Error(`Invalid arg: ${arg}`);
    }
    /* Call hooks */
    for (const hook of hooks) {
      const result = hook.call(self, fragment);
      if (typeof result === "function") {
        deferred.push(result);
      } 
    }
    /* Append children */
    self.append(...fragment.childNodes);
    /* Run deferred */
    deferred.forEach((hook) => hook.call(self));

    return self;
  };

  /* Returns registered Component. Creates and registers non-autonomous components 
  on-demand, if key corresponds to a native tag. */
  get = (key) => {
    if (!registry.get(key) && !key.includes("-")) {
      return this.author({ base: key });
    }
    return registry.get(key);
  };
})();




















/* Short-hands. */
export const create = component.create;
