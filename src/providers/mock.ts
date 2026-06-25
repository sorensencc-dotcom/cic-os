import { Provider, ChatPayload, ChatResult } from "../core/modelRouter.js";
import { ModelSpec } from "../core/modelSpec.js";

class MockProvider implements Provider {
  async callChat(spec: ModelSpec, payload: ChatPayload): Promise<ChatResult> {
    return {
      raw: { mock: true },
      text: `[MOCK:${payload.model}] ${payload.messages.map(m => m.content).join(" ")}`,
      tokensUsed: { input: 1, output: 1 }
    };
  }
}

export const mockProvider = new MockProvider();
