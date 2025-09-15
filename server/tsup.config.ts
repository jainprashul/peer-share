import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "../build/server",
  target: "node18",
  platform: "node",
  bundle: true,
  minify: true,
  sourcemap: true,
  dts: true,
  clean: true,
});