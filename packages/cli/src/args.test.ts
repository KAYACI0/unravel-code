import { describe, expect, it } from "vitest";
import { CliArgError, parseArgs } from "./args.js";

describe("parseArgs", () => {
  it("returns defaults when no flags are given", () => {
    expect(parseArgs([])).toEqual({
      mode: "auto",
      lang: "auto",
      detail: "detailed",
      json: false,
      help: false,
    });
  });

  it("parses all known flags", () => {
    expect(
      parseArgs([
        "--mode",
        "regex",
        "--lang",
        "tr",
        "--detail",
        "brief",
        "--model",
        "claude-sonnet-5",
        "--language-id",
        "python",
        "--json",
      ]),
    ).toEqual({
      mode: "regex",
      lang: "tr",
      detail: "brief",
      model: "claude-sonnet-5",
      languageId: "python",
      json: true,
      help: false,
    });
  });

  it("recognizes -h and --help", () => {
    expect(parseArgs(["-h"]).help).toBe(true);
    expect(parseArgs(["--help"]).help).toBe(true);
  });

  it("rejects an invalid --mode value", () => {
    expect(() => parseArgs(["--mode", "bogus"])).toThrow(CliArgError);
  });

  it("rejects an invalid --lang value", () => {
    expect(() => parseArgs(["--lang", "de"])).toThrow(CliArgError);
  });

  it("rejects an invalid --detail value", () => {
    expect(() => parseArgs(["--detail", "verbose"])).toThrow(CliArgError);
  });

  it("rejects a flag missing its value", () => {
    expect(() => parseArgs(["--model"])).toThrow(CliArgError);
  });

  it("rejects an unknown flag", () => {
    expect(() => parseArgs(["--nope"])).toThrow(CliArgError);
  });
});
