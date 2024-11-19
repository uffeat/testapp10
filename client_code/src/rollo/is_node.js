export function is_node(arg) {
  return (
    arg instanceof HTMLElement || ["number", "string"].includes(typeof arg)
  );
}