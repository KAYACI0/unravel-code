import { Readable } from "node:stream";
import { describe, expect, it } from "vitest";
import { readStdin } from "./stdin.js";

describe("readStdin", () => {
  it("concatenates chunks into a single string", async () => {
    const stream = Readable.from(["const ", "x = 1;"]);
    expect(await readStdin(stream)).toBe("const x = 1;");
  });

  it("returns an empty string for empty input", async () => {
    const stream = Readable.from([]);
    expect(await readStdin(stream)).toBe("");
  });

  it("decodes UTF-8 buffer chunks", async () => {
    const stream = Readable.from([Buffer.from("merhaba dünya", "utf8")]);
    expect(await readStdin(stream)).toBe("merhaba dünya");
  });
});
