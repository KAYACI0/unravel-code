import { build, context } from "esbuild";

const watch = process.argv.includes("--watch");

/** @type {import("esbuild").BuildOptions} */
const extensionOptions = {
  entryPoints: ["src/extension.ts"],
  bundle: true,
  outfile: "dist/extension.js",
  format: "cjs",
  platform: "node",
  target: "node18",
  external: ["vscode"],
  sourcemap: true,
  minify: !watch,
};

/** @type {import("esbuild").BuildOptions} */
const webviewOptions = {
  entryPoints: ["src/webview/main.ts"],
  bundle: true,
  outfile: "dist/webview/main.js",
  format: "iife",
  platform: "browser",
  target: "es2020",
  sourcemap: true,
  minify: !watch,
};

if (watch) {
  const [extensionCtx, webviewCtx] = await Promise.all([
    context(extensionOptions),
    context(webviewOptions),
  ]);
  await Promise.all([extensionCtx.watch(), webviewCtx.watch()]);
  console.log("esbuild: watching for changes...");
} else {
  await Promise.all([build(extensionOptions), build(webviewOptions)]);
}
