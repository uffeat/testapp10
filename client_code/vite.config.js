import { defineConfig } from "vite";
import { resolve } from "path";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }) => {
  return {
    base: mode === "production" ? "./" : "",
    plugins: [vue()],
    build: {
      // Allow top-level await
      target: ["es2022", "edge89", "firefox89", "chrome89", "safari15"],
      emptyOutDir: true,
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
        components: resolve(__dirname, "src/components"),
        rollo: resolve(__dirname, "src/rollo"),
        rolloui: resolve(__dirname, "src/rolloui"),
        utils: resolve(__dirname, "src/utils"),
      },
    },
  };
});
