import { AbortedError, type ExplainRequest, explain } from "@unravel-code/core";
import { resolveApiKey } from "./api-key.js";
import { CliArgError, parseArgs } from "./args.js";
import { readStdin } from "./stdin.js";

const HELP_TEXT = `unravel - explain selected code or a regex, step by step

Usage:
  echo 'const x = a?.b ?? c' | unravel --lang tr --detail brief
  unravel --mode regex --lang en < pattern.txt

Flags:
  --mode <auto|code|regex|legacy>   default: auto
  --lang <auto|tr|en>                default: auto (resolves to en)
  --detail <brief|detailed>          default: detailed
  --model <model-id>                 override the default model
  --language-id <id>                 e.g. typescript, python
  --json                             emit {"text": "..."} instead of streaming plain text
  -h, --help                         show this help

API key resolution order:
  1. UNRAVEL_API_KEY env var
  2. ANTHROPIC_API_KEY env var
  3. "apiKey" field in ~/.config/unravel-code/config.json
`;

const ABORT_EXIT_CODE = 130;

function describeError(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Unknown error.";
}

export async function runCli(argv: string[]): Promise<number> {
  let options: ReturnType<typeof parseArgs>;
  try {
    options = parseArgs(argv);
  } catch (err) {
    if (err instanceof CliArgError) {
      process.stderr.write(`${err.message}\n`);
      return 1;
    }
    throw err;
  }

  if (options.help) {
    process.stdout.write(HELP_TEXT);
    return 0;
  }

  const apiKey = await resolveApiKey();
  if (!apiKey) {
    process.stderr.write(
      'No API key found. Set UNRAVEL_API_KEY or ANTHROPIC_API_KEY, or add an "apiKey" field to ~/.config/unravel-code/config.json.\n',
    );
    return 1;
  }

  const code = await readStdin();
  if (!code.trim()) {
    process.stderr.write("No input received on stdin.\n");
    return 1;
  }

  const controller = new AbortController();
  const onSigint = () => controller.abort();
  process.once("SIGINT", onSigint);

  const request: ExplainRequest = {
    code,
    mode: options.mode,
    lang: options.lang,
    detail: options.detail,
    signal: controller.signal,
    ...(options.model !== undefined ? { model: options.model } : {}),
    ...(options.languageId !== undefined ? { languageId: options.languageId } : {}),
  };

  try {
    if (options.json) {
      let text = "";
      for await (const chunk of explain(request, { apiKey })) {
        text += chunk;
      }
      process.stdout.write(`${JSON.stringify({ text })}\n`);
    } else {
      for await (const chunk of explain(request, { apiKey })) {
        process.stdout.write(chunk);
      }
      process.stdout.write("\n");
    }
    return 0;
  } catch (err) {
    process.stderr.write(`${describeError(err)}\n`);
    return err instanceof AbortedError ? ABORT_EXIT_CODE : 1;
  } finally {
    process.off("SIGINT", onSigint);
  }
}
