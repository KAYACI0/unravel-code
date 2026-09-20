import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["packages/*/src/**/*.test.ts", "apps/*/src/**/*.test.ts"],
    // apps/*/src/test/** holds @vscode/test-electron suites that need a real
    // vscode module; those run via each app's own `test:e2e` script, not vitest.
    exclude: ["**/node_modules/**", "apps/*/src/test/**"],
  },
});
