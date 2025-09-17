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
  // Bundle all dependencies to run without node_modules
  noExternal: [/.*/],
  // Allow file splitting for better organization
  splitting: true,
  format: ["esm", "cjs"],
  // Ensure all dependencies are bundled
  treeshake: false,
  
  // Missing configurations added:
  
  // 1. Environment variables handling
  env: {
    NODE_ENV: "production",
  },
  
  // 2. Better error handling and warnings
  silent: false,
  onSuccess: "echo 'Build completed successfully!'",
  
  // 3. Optimize for Node.js runtime
  esbuildOptions(options) {
    options.define = {
      ...options.define,
      "process.env.NODE_ENV": '"production"',
    };
  },
  
  // 4. Handle specific Node.js modules that shouldn't be bundled
  external: [
    // Keep these as external for better performance
    "fs",
    "path", 
    "crypto",
    "util",
    "events",
    "stream",
    "http",
    "https",
    "url",
    "querystring",
    "os",
    "child_process",
    "cluster",
    "worker_threads",
  ],

  // 6. Metafile for bundle analysis
  metafile: true,
  
  // 7. Watch mode for development
  watch: process.env.NODE_ENV === "development",
});