import { getModelSpec } from "./modelRegistry.js";
import { ModelSpec } from "./modelSpec.js";
import { openaiCompatibleProvider } from "../providers/openaiCompatible.js";
import { anthropicProvider } from "../providers/anthropic.js";
import { googleProvider } from "../providers/google.js";
import { ollamaProvider } from "../providers/ollama.js";
import { localProvider } from "../providers/local.js";
import { azureOpenAIProvider } from "../providers/azureOpenAI.js";
import { ProviderError } from "./errors.js";
import { logEvent } from "../observability/events.js";

export interface ChatPayload {
  model: string;
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  tools?: any[];
  stream?: boolean;
  maxTokens?: number;
  temperature?: number;
}

export interface ChatResult {
  raw: any;
  text: string;
  tokensUsed?: {
    input: number;
    output: number;
  };
}

export interface Provider {
  callChat(spec: ModelSpec, payload: ChatPayload): Promise<ChatResult>;
}

const providers: Record<ModelSpec["type"], Provider> = {
  "openai-compatible": openaiCompatibleProvider,
  "anthropic": anthropicProvider,
  "google": googleProvider,
  "ollama": ollamaProvider,
  "local-gguf": localProvider,
  "azure-openai": azureOpenAIProvider
};

export async function callModel(payload: ChatPayload, agentName: string = "UnknownAgent"): Promise<ChatResult> {
  const spec = getModelSpec(payload.model);
  const provider = providers[spec.type];
  if (!provider) {
    throw new ProviderError(`No provider for type: ${spec.type}`);
  }

  logEvent({
    eventName: "MODEL_CALL_START",
    model: spec.name,
    agent: agentName
  });

  const startTime = Date.now();
  try {
    const result = await provider.callChat(spec, payload);
    const latencyMs = Date.now() - startTime;

    logEvent({
      eventName: "MODEL_CALL_SUCCESS",
      model: spec.name,
      agent: agentName,
      latencyMs,
      tokensUsed: result.tokensUsed
    });

    return result;
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    logEvent({
      eventName: "MODEL_CALL_FAILURE",
      model: spec.name,
      agent: agentName,
      latencyMs,
      error: err.message
    });
    throw err;
  }
}
