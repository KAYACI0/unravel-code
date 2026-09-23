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

/** @type {import("esbuild").BuildOptions} */
const settingsWebviewOptions = {
  entryPoints: ["src/webview/settingsMain.ts"],
  bundle: true,
  outfile: "dist/webview/settings.js",
  format: "iife",
  platform: "browser",
  target: "es2020",
  sourcemap: true,
  minify: !watch,
};

if (watch) {
  const [extensionCtx, webviewCtx, settingsCtx] = await Promise.all([
    context(extensionOptions),
    context(webviewOptions),
    context(settingsWebviewOptions),
  ]);
  await Promise.all([extensionCtx.watch(), webviewCtx.watch(), settingsCtx.watch()]);
  console.log("esbuild: watching for changes...");
} else {
  await Promise.all([
    build(extensionOptions),
    build(webviewOptions),
    build(settingsWebviewOptions),
  ]);
}
