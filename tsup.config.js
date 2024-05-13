import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  bundle: true,
  treeshake: true,
  format: "esm",
  dts: true
});