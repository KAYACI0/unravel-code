import type { Detail, Lang, Mode } from "@unravel-code/core";

const MODES: readonly Mode[] = ["auto", "code", "regex", "legacy"];
const LANGS: readonly Lang[] = ["auto", "tr", "en"];
const DETAILS: readonly Detail[] = ["brief", "detailed"];

export class CliArgError extends Error {}

export interface CliOptions {
  mode: Mode;
  lang: Lang;
  detail: Detail;
  model?: string;
  languageId?: string;
  json: boolean;
  help: boolean;
}

function takeValue(argv: string[], index: number, flag: string): string {
  const value = argv[index];
  if (value === undefined) throw new CliArgError(`${flag} requires a value`);
  return value;
}

export function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    mode: "auto",
    lang: "auto",
    detail: "detailed",
    json: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case "-h":
      case "--help":
        options.help = true;
        break;
      case "--json":
        options.json = true;
        break;
      case "--mode": {
        const value = takeValue(argv, ++i, "--mode");
        if (!MODES.includes(value as Mode)) {
          throw new CliArgError(`--mode must be one of: ${MODES.join(", ")}`);
        }
        options.mode = value as Mode;
        break;
      }
      case "--lang": {
        const value = takeValue(argv, ++i, "--lang");
        if (!LANGS.includes(value as Lang)) {
          throw new CliArgError(`--lang must be one of: ${LANGS.join(", ")}`);
        }
        options.lang = value as Lang;
        break;
      }
      case "--detail": {
        const value = takeValue(argv, ++i, "--detail");
        if (!DETAILS.includes(value as Detail)) {
          throw new CliArgError(`--detail must be one of: ${DETAILS.join(", ")}`);
        }
        options.detail = value as Detail;
        break;
      }
      case "--model":
        options.model = takeValue(argv, ++i, "--model");
        break;
      case "--language-id":
        options.languageId = takeValue(argv, ++i, "--language-id");
        break;
      default:
        throw new CliArgError(`Unknown argument: ${arg}`);
    }
  }

  return options;
}
