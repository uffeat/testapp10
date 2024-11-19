/* Executes a series of potentially async pipe functions passing in one 
function result to the next function and returns the final result. */
export async function run_pipe(arg, ...pipe) {
  for (const func of pipe) {
    arg = await func(arg);
  }
  return arg;
}

/* Executes a series of pipe functions passing in one function result 
to the next function and returns the final result.  */
export function run_pipe_sync(arg, ...pipe) {
  for (const func of pipe) {
    arg = func(arg);
  }
  return arg;
}

/*
Example:

const result = run_pipe_sync(
  2,
  (value) => 2 * value,
  (value) => 2 + value,
);

// result = 6
*/
