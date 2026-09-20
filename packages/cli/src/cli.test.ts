import type { ExplainOptions, ExplainRequest } from "@unravel-code/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const explainMock = vi.fn<(req: ExplainRequest, opts: ExplainOptions) => AsyncIterable<string>>();
const resolveApiKeyMock = vi.fn<() => Promise<string | undefined>>();
const readStdinMock = vi.fn<() => Promise<string>>();

vi.mock("@unravel-code/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@unravel-code/core")>();
  return { ...actual, explain: explainMock };
});

vi.mock("./api-key.js", () => ({ resolveApiKey: resolveApiKeyMock }));
vi.mock("./stdin.js", () => ({ readStdin: readStdinMock }));

const { runCli } = await import("./cli.js");
const { AbortedError } = await import("@unravel-code/core");

async function* chunks(values: string[]): AsyncGenerator<string> {
  for (const value of values) yield value;
}

describe("runCli", () => {
  function spyOnWrite(stream: NodeJS.WriteStream) {
    return vi.spyOn(stream, "write").mockImplementation(() => true);
  }

  let stdoutSpy: ReturnType<typeof spyOnWrite>;
  let stderrSpy: ReturnType<typeof spyOnWrite>;

  beforeEach(() => {
    explainMock.mockReset();
    resolveApiKeyMock.mockReset();
    readStdinMock.mockReset();
    resolveApiKeyMock.mockResolvedValue("test-key");
    readStdinMock.mockResolvedValue("const x = 1;");
    explainMock.mockReturnValue(chunks(["hello", " world"]));
    stdoutSpy = spyOnWrite(process.stdout);
    stderrSpy = spyOnWrite(process.stderr);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
  });

  it("prints help and exits 0 for --help without calling explain", async () => {
    const code = await runCli(["--help"]);
    expect(code).toBe(0);
    expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("Usage:"));
    expect(explainMock).not.toHaveBeenCalled();
  });

  it("exits 1 with a clear message for invalid flags", async () => {
    const code = await runCli(["--mode", "bogus"]);
    expect(code).toBe(1);
    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining("--mode must be one of"));
  });

  it("exits 1 with a clear message when no API key is found", async () => {
    resolveApiKeyMock.mockResolvedValue(undefined);
    const code = await runCli([]);
    expect(code).toBe(1);
    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining("No API key found"));
    expect(explainMock).not.toHaveBeenCalled();
  });

  it("exits 1 when stdin is empty", async () => {
    readStdinMock.mockResolvedValue("   ");
    const code = await runCli([]);
    expect(code).toBe(1);
    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining("No input received"));
  });

  it("streams explanation chunks to stdout as they arrive", async () => {
    const code = await runCli([]);
    expect(code).toBe(0);
    expect(stdoutSpy).toHaveBeenCalledWith("hello");
    expect(stdoutSpy).toHaveBeenCalledWith(" world");
  });

  it("forwards parsed flags, stdin code, and the resolved key to explain", async () => {
    await runCli([
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
    ]);
    expect(explainMock).toHaveBeenCalledWith(
      expect.objectContaining({
        code: "const x = 1;",
        mode: "regex",
        lang: "tr",
        detail: "brief",
        model: "claude-sonnet-5",
        languageId: "python",
      }),
      { apiKey: "test-key" },
    );
  });

  it("emits a single JSON line when --json is passed", async () => {
    const code = await runCli(["--json"]);
    expect(code).toBe(0);
    expect(stdoutSpy).toHaveBeenCalledWith(`${JSON.stringify({ text: "hello world" })}\n`);
  });

  it("exits 1 and writes the error message when explain throws", async () => {
    // biome-ignore lint/correctness/useYield: must reject on the first `next()` like a real async generator would
    explainMock.mockImplementation(async function* explode() {
      throw new Error("network down");
    });
    const code = await runCli([]);
    expect(code).toBe(1);
    expect(stderrSpy).toHaveBeenCalledWith("network down\n");
  });

  it("exits 130 when the request is aborted", async () => {
    // biome-ignore lint/correctness/useYield: must reject on the first `next()` like a real async generator would
    explainMock.mockImplementation(async function* aborted() {
      throw new AbortedError();
    });
    const code = await runCli([]);
    expect(code).toBe(130);
  });

  it("aborts the signal passed to explain when SIGINT fires mid-stream", async () => {
    let capturedSignal: AbortSignal | undefined;
    let releaseSecondChunk!: () => void;
    const secondChunkGate = new Promise<void>((resolve) => {
      releaseSecondChunk = resolve;
    });

    explainMock.mockImplementation(async function* gated(req) {
      capturedSignal = req.signal;
      yield "partial";
      await secondChunkGate;
      yield "more";
    });

    const runPromise = runCli([]);

    for (let i = 0; i < 30; i++) await Promise.resolve();

    expect(capturedSignal?.aborted).toBe(false);
    process.emit("SIGINT");
    expect(capturedSignal?.aborted).toBe(true);

    releaseSecondChunk();
    await runPromise;
  });
});
