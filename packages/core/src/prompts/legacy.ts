import type { PromptContext } from "./base.js";
import { buildCodeSystemPrompt } from "./code.js";

const INSTRUCTIONS: Record<PromptContext["lang"], string> = {
  en: [
    "In addition to explaining the code, this is legacy code someone needs to work on. Also cover, as extra Markdown sections:",
    "4. **Likely intent** — what problem this code was probably written to solve.",
    "5. **What to check before touching it** — hidden assumptions, missing tests, implicit dependencies, anything risky to change blindly.",
    "6. **Modernization suggestions** — only if there are concrete, low-risk improvements; omit this section if there is nothing worth suggesting.",
  ].join("\n"),
  tr: [
    "Kodu açıklamanın yanında, bu üzerinde çalışılması gereken legacy bir kod. Ek Markdown bölümleri olarak şunları da ekle:",
    "4. **Muhtemel niyet** — bu kodun muhtemelen hangi problemi çözmek için yazıldığı.",
    "5. **Dokunmadan önce neye bakmalı** — gizli varsayımlar, eksik testler, örtük bağımlılıklar, körlemesine değiştirilmesi riskli olan her şey.",
    "6. **Modernizasyon önerileri** — sadece somut, düşük riskli iyileştirmeler varsa ekle; önerecek bir şey yoksa bu bölümü atla.",
  ].join("\n"),
};

export function buildLegacySystemPrompt(ctx: PromptContext): string {
  return [buildCodeSystemPrompt(ctx), INSTRUCTIONS[ctx.lang]].join("\n\n");
}
