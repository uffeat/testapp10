export const registry = new (class {
  #components = {};

  add = (key, cls) => {
    if (this.get(key)) {
      throw new Error(`A component with key '${key}' already registered.`);
    }
    this.#components[key] = cls;
  };

  get = (key) => {
    return this.#components[key];
  };
})();