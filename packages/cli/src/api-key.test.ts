import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const readFileMock = vi.fn();

vi.mock("node:fs/promises", () => ({
  readFile: readFileMock,
}));

const { resolveApiKey } = await import("./api-key.js");

// `= undefined` would stringify to the literal "undefined" for process.env, so delete is required here.
function setEnv(key: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

describe("resolveApiKey", () => {
  const originalUnravelKey = process.env.UNRAVEL_API_KEY;
  const originalAnthropicKey = process.env.ANTHROPIC_API_KEY;

  beforeEach(() => {
    readFileMock.mockReset();
    setEnv("UNRAVEL_API_KEY", undefined);
    setEnv("ANTHROPIC_API_KEY", undefined);
  });

  afterEach(() => {
    setEnv("UNRAVEL_API_KEY", originalUnravelKey);
    setEnv("ANTHROPIC_API_KEY", originalAnthropicKey);
  });

  it("prefers UNRAVEL_API_KEY over everything else", async () => {
    process.env.UNRAVEL_API_KEY = "unravel-key";
    process.env.ANTHROPIC_API_KEY = "anthropic-key";
    expect(await resolveApiKey()).toBe("unravel-key");
    expect(readFileMock).not.toHaveBeenCalled();
  });

  it("falls back to ANTHROPIC_API_KEY", async () => {
    process.env.ANTHROPIC_API_KEY = "anthropic-key";
    expect(await resolveApiKey()).toBe("anthropic-key");
    expect(readFileMock).not.toHaveBeenCalled();
  });

  it("falls back to the config file when no env vars are set", async () => {
    readFileMock.mockResolvedValue(JSON.stringify({ apiKey: "file-key" }));
    expect(await resolveApiKey()).toBe("file-key");
  });

  it("returns undefined when the config file is missing", async () => {
    readFileMock.mockRejectedValue(new Error("ENOENT"));
    expect(await resolveApiKey()).toBeUndefined();
  });

  it("returns undefined when the config file has invalid JSON", async () => {
    readFileMock.mockResolvedValue("not json");
    expect(await resolveApiKey()).toBeUndefined();
  });

  it("returns undefined when the config file has no apiKey field", async () => {
    readFileMock.mockResolvedValue(JSON.stringify({ other: "value" }));
    expect(await resolveApiKey()).toBeUndefined();
  });
});
