import app_origins from "rollo/meta/app_origins";

const app_origin =
  window.location.hostname === "localhost"
    ? app_origins.development
    : app_origins.production;
const api_origin = `${app_origin}/_/api`;

let submission_id = 0;

/* Calls server endpoint. */
const server = new Proxy(
  {},
  {
    get: (_, name) => {
      return async (data = {}) => {
        const url = `${api_origin}/${name}`;
        // Add __submission_id__ to data
        data.__submission_id__ = `${name}/${submission_id}`;
        submission_id++;

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        // Handle server-side error
        if ("__error__" in result) {
          throw new Error(result.__error__);
        }
        return result;
      };
    },
  }
);

export { server };

/*
EXAMPLE

const result = await server.foo({ email: "name@company.com", number: 42, accept: true });
*/
