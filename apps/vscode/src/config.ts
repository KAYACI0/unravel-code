import type { Detail } from "@unravel-code/core";

export interface RawUnravelConfig {
  language: "auto" | "tr" | "en";
  detail: Detail;
  model: string;
  contextLines: number;
}

export function resolveLanguage(
  config: RawUnravelConfig["language"],
  envLanguage: string,
): "tr" | "en" {
  if (config !== "auto") return config;
  return envLanguage.toLowerCase().startsWith("tr") ? "tr" : "en";
}
