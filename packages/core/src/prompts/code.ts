import { type PromptContext, buildSystemPreamble } from "./base.js";

const INSTRUCTIONS: Record<PromptContext["lang"], { detailed: string; brief: string }> = {
  en: {
    detailed: [
      "Explain the code in Markdown with this structure:",
      "1. **What it does** — 1-2 sentences summarizing the overall purpose.",
      "2. **Step by step** — walk through the flow in order, one short bullet per meaningful step.",
      "3. **Side effects & watch out for** — I/O, mutation, network calls, error handling gaps, anything a reader should be careful about.",
    ].join("\n"),
    brief: [
      "Explain the code briefly in Markdown with this structure:",
      "1. **What it does** — 1-2 sentences summarizing the overall purpose.",
      "2. **Summary** — exactly 3 bullet points covering the most important things to know.",
    ].join("\n"),
  },
  tr: {
    detailed: [
      "Kodu şu yapıda Markdown olarak açıkla:",
      "1. **Ne yapar** — genel amacı özetleyen 1-2 cümle.",
      "2. **Adım adım** — akışı sırayla, her anlamlı adım için kısa bir madde.",
      "3. **Yan etkiler ve dikkat edilecekler** — I/O, mutation, ağ çağrıları, eksik hata yönetimi, okuyucunun dikkat etmesi gereken her şey.",
    ].join("\n"),
    brief: [
      "Kodu Markdown olarak kısaca açıkla:",
      "1. **Ne yapar** — genel amacı özetleyen 1-2 cümle.",
      "2. **Özet** — bilinmesi gereken en önemli şeyleri kapsayan tam olarak 3 madde.",
    ].join("\n"),
  },
};

export function buildCodeSystemPrompt(ctx: PromptContext): string {
  const instructions = INSTRUCTIONS[ctx.lang][ctx.detail === "brief" ? "brief" : "detailed"];
  return [buildSystemPreamble(ctx), instructions].join("\n\n");
}
