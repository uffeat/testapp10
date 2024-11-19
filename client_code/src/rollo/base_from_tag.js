export function base_from_tag(tag) {
  const base = document.createElement(tag).constructor;
  if (base !== HTMLUnknownElement) {
    return base;
  }
}