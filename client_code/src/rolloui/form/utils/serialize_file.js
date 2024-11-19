/* Returns object with serialized file data
with the structure: {content: <dataUrl>, name: <file.name>} */
export function serialize_file(file) {
  const fileReader = new FileReader();
  fileReader.readAsDataURL(file);
  return new Promise((resolve, reject) => {
    fileReader.addEventListener("load", (event) => {
      const content = fileReader.result;
      const serialized = {
        content,
        name: file.name,
      };
      resolve(serialized);
    });
    fileReader.addEventListener("error", (event) => {
      reject(new Error(`Could not serialize file: ${file.name}`));
    });
  });
}
