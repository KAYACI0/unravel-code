// Model selection for the Language Model API, kept free of `vscode` imports so
// it can be unit tested. The provider passes real LanguageModelChat objects in;
// only the vendor and family names matter here.
//
// Any extension can register models with `lm.registerLanguageModelChatProvider`
// (the API docs name `copilot` and `openai` as example vendors), so what shows
// up depends on which extensions the user has. That is why the preference is a
// user setting rather than a fixed list.

/** Used when the user expressed no preference. Claude first because the
 * prompts were written and snapshot-tested against it; the rest are fallbacks
 * so the feature still works without it. */
const DEFAULT_PREFERENCE = ["claude", "gpt", ""];

export interface ModelLike {
  readonly vendor: string;
  readonly family: string;
}

function matches(model: ModelLike, wanted: string): boolean {
  if (wanted === "") return true;
  const needle = wanted.toLowerCase();
  return model.vendor.toLowerCase().includes(needle) || model.family.toLowerCase().includes(needle);
}

/**
 * @param preferred Free text from `unravelCode.lmPreferred`, matched against
 * both vendor and family, e.g. "openai", "gpt", "claude", "copilot". An empty
 * string means "no preference". A preference that matches nothing falls back
 * to the default order rather than failing — the user still gets an answer.
 */
export function pickModel<T extends ModelLike>(
  models: readonly T[],
  preferred = "",
): T | undefined {
  const wanted = preferred.trim();
  if (wanted !== "") {
    const match = models.find((model) => matches(model, wanted));
    if (match) return match;
  }

  for (const fallback of DEFAULT_PREFERENCE) {
    const match = models.find((model) => matches(model, fallback));
    if (match) return match;
  }
  return undefined;
}
