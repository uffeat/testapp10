
# Vite:
npm create vite@latest
Perhaps:
npm i @rollup/plugin-dynamic-import-vars

# Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -
npm install stylelint stylelint-config-standard --save-dev


In .vscode/setting.json:
```
"files.associations": {
    "*.css": "tailwindcss"
  }
```
In all .css files:
```
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Font

Copy font files to public/fonts/iter
Ref in index.html:
```
<link rel="preconnect" href="/fonts/iter" />
<link rel="stylesheet" href="/fonts/iter/inter.css" />
```

## Tailwind UI
npm install @headlessui/vue @heroicons/vue
npm install @tailwindcss/forms



Perhaps:
npm install --save clsx


## Config
In tailwind.config.js:
```
import defaultTheme from "tailwindcss/defaultTheme";
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["InterVariable", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [forms],
};

```

# Bootstrap
npm i --save bootstrap @popperjs/core
npm i --save-dev sass
npm i bootstrap-icons
