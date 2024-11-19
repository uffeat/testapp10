// foo_endpoint
import { server } from 'rollo/server'

await (async () => {
  
  const data = { email: "name@company.com", number: 42, accept: true };
  const result = await server.foo(data);
  console.log("Result:", result);
  alert(JSON.stringify(result))

})();