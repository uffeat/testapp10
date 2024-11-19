export function camel_to_kebab(camel) {
  return camel.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

export function camel_to_snake(camel) {
  const kebab = this.camel_to_kebab(camel);
  const snake = kebab.replace("-", "_");
  return snake;
}

export function capitalize(text) {
  if (text.length > 0) {
    text = text[0].toUpperCase() + text.slice(1);
  }
  return text;
}

export function has_upper(text) {
  return text !== text.toLowerCase();
}

export function kebab_to_camel(kebab) {
  return kebab.replace(/-([a-z])/g, function (match, capture) {
    return capture.toUpperCase();
  });
}

export function pascal_to_camel(pascal) {
  if (pascal.length === 0) return pascal;
  return pascal[0].toLowerCase() + pascal.slice(1);
}

export function pascal_to_kebab(pascal) {
  return pascal
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-/, "");
}

export function snake_to_camel(snake) {
  const kebab = snake.replace("_", "-");
  return this.kebab_to_camel(kebab);
}

export function starts_with_upper(text) {
  return /^[A-Z]/.test(text.charAt(0));
}