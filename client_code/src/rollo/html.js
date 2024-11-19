/* TODO Consider using for defining effects */

/* Enables html linting via the VS Code plugin 'lit-html'. */
export function html(strings, ...values) {
  return strings.reduce(
    (result, str, i) => result + str + (values[i] || ""),
    ""
  );
}

/* 
EXAMPLE

const heading = html`<h1>Hello world!</h1>`
 */
