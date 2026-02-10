import { defineConfig } from "vite";
import dtsBundleGeneratorPlugin from "vite-plugin-dts-bundle-generator";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  define: {},
  build: {
    lib: {
      entry: "./src/index.ts",
      formats: ["es"],
    },
    minify: false,
    sourcemap: true,
  },
  plugins: [
    // for xml2js
    nodePolyfills({
      globals: {},
      protocolImports: true,
    }),
    dtsBundleGeneratorPlugin({
      fileName: "svg-play.d.ts",
    }),
  ],
  // for xml2js
  resolve: {
    alias: {
      events: "events",
      stream: "stream-browserify",
      timers: "timers-browserify",
    },
  },
});
