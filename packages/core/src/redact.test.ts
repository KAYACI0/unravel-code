import { describe, expect, it } from "vitest";
import { redactSecrets } from "./redact.js";

describe("redactSecrets", () => {
  it("redacts an AWS access key", () => {
    const { text, redactedCount } = redactSecrets("key = AKIAIOSFODNN7EXAMPLE");
    expect(text).not.toContain("AKIAIOSFODNN7EXAMPLE");
    expect(text).toContain("[REDACTED]");
    expect(redactedCount).toBe(1);
  });

  it("redacts a classic GitHub personal access token", () => {
    const token = `ghp_${"a".repeat(36)}`;
    const { text, redactedCount } = redactSecrets(`export TOKEN=${token}`);
    expect(text).not.toContain(token);
    expect(redactedCount).toBe(1);
  });

  it("redacts a fine-grained GitHub token", () => {
    const token = `github_pat_${"a".repeat(30)}`;
    const { text, redactedCount } = redactSecrets(token);
    expect(text).not.toContain(token);
    expect(redactedCount).toBe(1);
  });

  it("redacts an Anthropic-style sk- key", () => {
    const key = `sk-ant-api03-${"a".repeat(30)}`;
    const { text, redactedCount } = redactSecrets(key);
    expect(text).not.toContain(key);
    expect(redactedCount).toBe(1);
  });

  it("redacts a Slack token", () => {
    const token = `xoxb-${"1".repeat(20)}`;
    const { text, redactedCount } = redactSecrets(token);
    expect(text).not.toContain(token);
    expect(redactedCount).toBe(1);
  });

  it("redacts a JWT", () => {
    const jwt =
      "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U";
    const { text, redactedCount } = redactSecrets(jwt);
    expect(text).not.toContain(jwt);
    expect(redactedCount).toBe(1);
  });

  it("redacts a PEM private key block", () => {
    const pem = [
      "-----BEGIN RSA PRIVATE KEY-----",
      "MIIEpAIBAAKCAQEA1234567890abcdef",
      "-----END RSA PRIVATE KEY-----",
    ].join("\n");
    const { text, redactedCount } = redactSecrets(pem);
    expect(text).not.toContain("MIIEpAIBAAKCAQEA1234567890abcdef");
    expect(redactedCount).toBe(1);
  });

  it("redacts a password assignment while keeping the key name", () => {
    const { text, redactedCount } = redactSecrets('password = "hunter2super"');
    expect(text).toBe('password = "[REDACTED]"');
    expect(redactedCount).toBe(1);
  });

  it("redacts an api_key assignment written with a colon", () => {
    const { text, redactedCount } = redactSecrets('api_key: "sk-ant-abcdefghijklmnopqrstuvwx"');
    expect(text).toBe('api_key: "[REDACTED]"');
    expect(redactedCount).toBe(1);
  });

  it("counts multiple distinct secrets", () => {
    const { redactedCount } = redactSecrets(`aws=AKIAIOSFODNN7EXAMPLE\npassword = "swordfish123"`);
    expect(redactedCount).toBe(2);
  });

  it("does not touch normal code", () => {
    const code = [
      "function add(a, b) {",
      "  return a + b;",
      "}",
      "const token = response.token;",
      "interface Props { password: string }",
    ].join("\n");
    const { text, redactedCount } = redactSecrets(code);
    expect(text).toBe(code);
    expect(redactedCount).toBe(0);
  });

  it("does not flag an unrelated variable containing 'secret' as a substring", () => {
    const { text, redactedCount } = redactSecrets('secretName = "not-a-real-secret"');
    expect(redactedCount).toBe(0);
    expect(text).toBe('secretName = "not-a-real-secret"');
  });
});
