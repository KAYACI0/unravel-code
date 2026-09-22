// Provider backed by VS Code's Language Model API, so Unravel can run on
// whatever model the editor already has — including GitHub Copilot's free
// tier — without asking anyone for an API key.
//
// This file is the reason core stays editor-agnostic: `vscode.lm` cannot be
// imported there, so the shell builds the provider and injects it.

import { LanguageModelUnavailableError } from "@unravel-code/core";
import type { Provider, StreamCompletionRequest } from "@unravel-code/core";
import * as vscode from "vscode";
import { pickModel } from "./lmModelPick.js";

// Shown in the editor's consent dialog, so it has to read like a sentence a
// user can act on rather than an internal label.
const JUSTIFICATION = "Unravel uses a language model to explain the code you selected.";

function translateError(err: unknown): Error {
  if (err instanceof vscode.LanguageModelError) {
    // NoPermissions means the user declined the consent dialog; Blocked and
    // NotFound mean this model will not serve us at all. All three are
    // actionable by the user, so pass the editor's own wording through.
    return new LanguageModelUnavailableError(`${err.code} — ${err.message}`);
  }
  return err instanceof Error ? err : new Error(String(err));
}

export function createVsCodeLmProvider(): Provider {
  return {
    async *stream(req: StreamCompletionRequest): AsyncGenerator<string> {
      const models = await vscode.lm.selectChatModels();
      const model = pickModel(models);
      if (!model) throw new LanguageModelUnavailableError();

      // The Language Model API has no system role — only User and Assistant —
      // so the system prompt rides as a leading user turn. The prompt already
      // frames the selection as data rather than instructions, which is what
      // keeps that safe.
      const messages = [
        vscode.LanguageModelChatMessage.User(req.system),
        vscode.LanguageModelChatMessage.User(req.userMessage),
      ];

      // Core cancels with an AbortSignal; the editor wants a CancellationToken.
      const cancellation = new vscode.CancellationTokenSource();
      const onAbort = () => cancellation.cancel();
      if (req.signal?.aborted) cancellation.cancel();
      req.signal?.addEventListener("abort", onAbort, { once: true });

      try {
        const response = await model.sendRequest(
          messages,
          { justification: JUSTIFICATION },
          cancellation.token,
        );
        for await (const fragment of response.text) {
          yield fragment;
        }
      } catch (err) {
        throw translateError(err);
      } finally {
        req.signal?.removeEventListener("abort", onAbort);
        cancellation.dispose();
      }
    },
  };
}
