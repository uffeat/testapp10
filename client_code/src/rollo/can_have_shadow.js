export function can_have_shadow(tag) {
  const element = document.createElement(tag);
  try {
    element.attachShadow();
    return true;
  } catch {
    return false;
  }
}