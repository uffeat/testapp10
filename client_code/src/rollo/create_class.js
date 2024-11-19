/* Creates class from base and factories (synthetic multiple inheritance). */
 export function create_class(base, config = {}, ...factories) {
  let cls = factories.shift()(base, config);
  for (const factory of factories) {
    const result = factory(cls, config, ...factories);
    if (result) {
      cls = result;
    }
  }
  Object.freeze(config);
  cls.__config__ = config;
  return cls;
}