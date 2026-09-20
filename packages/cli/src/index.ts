import { runCli } from "./cli.js";

runCli(process.argv.slice(2))
  .then((code) => {
    process.exitCode = code;
  })
  .catch((err: unknown) => {
    process.stderr.write(`${err instanceof Error ? err.message : "Unknown error."}\n`);
    process.exitCode = 1;
  });
