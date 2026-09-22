// Model selection for the Language Model API, kept free of `vscode` imports so
// it can be unit tested. The provider passes real LanguageModelChat objects in;
// only the family name matters here.

/** Claude first: it is what the prompts were written and snapshot-tested
 * against. The rest are fallbacks so the feature still works without it. */
const FAMILY_PREFERENCE = ["claude", "gpt", ""];

export interface ModelLike {
  readonly family: string;
}

export function pickModel<T extends ModelLike>(models: readonly T[]): T | undefined {
  for (const wanted of FAMILY_PREFERENCE) {
    const match = models.find((model) => model.family.toLowerCase().includes(wanted));
    if (match) return match;
  }
  return undefined;
}
