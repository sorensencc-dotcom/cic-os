import { getModelSpec, loadModelRegistry } from "./modelRegistry.js";
import { ModelSpec } from "./modelSpec.js";
import { openaiCompatibleProvider } from "../providers/openaiCompatible.js";
import { anthropicProvider } from "../providers/anthropic.js";
import { googleProvider } from "../providers/google.js";
import { ollamaProvider } from "../providers/ollama.js";
import { localProvider } from "../providers/local.js";
import { azureOpenAIProvider } from "../providers/azureOpenAI.js";
import { mockProvider } from "../providers/mock.js";
import { ProviderError, RoutingError } from "./errors.js";
import { logEvent } from "../observability/events.js";
import { AgentRoutingProfile } from "../agents/routingProfile.js";

export interface ChatPayload {
  model: string;
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  tools?: any[];
  stream?: boolean;
  maxTokens?: number;
  temperature?: number;
  requires?: {
    toolCalls?: boolean;
    vision?: boolean;
    streaming?: boolean;
    embeddings?: boolean;
  };
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

export class ModelRouter {
  constructor(private registry: Map<string, ModelSpec>) {}

  selectModel(profile: AgentRoutingProfile, payload: ChatPayload): ModelSpec {
    const mode = profile.mode ?? process.env.MAAL_MODE ?? "hybrid";

    const candidates = [
      ...profile["preferredModels"] || [],
      ...profile["fallbackModels"] || []
    ]
      .map(name => this.registry.get(name))
      .filter((m): m is ModelSpec => !!m);

    const filtered = this.filterByMode(candidates, mode)
      .filter(m => this.satisfiesRequires(m, payload.requires));

    if (!filtered.length) {
      throw new RoutingError("No models available for routing profile in current mode");
    }

    return filtered
      .map(m => ({
        spec: m,
        score: (m.routingBias ?? 0) + this.capabilityScore(m, payload.requires)
      }))
      .sort((a, b) => b.score - a.score)[0].spec;
  }

  private filterByMode(models: ModelSpec[], mode: string): ModelSpec[] {
    if (mode === "local") {
      return models.filter(m =>
        m.provider === "mock" ||
        m.provider === "ollama" ||
        m.provider === "local"
      );
    }
    return models;
  }

  private satisfiesRequires(m: ModelSpec, req?: ChatPayload["requires"]): boolean {
    if (!req) return true;
    if (req.toolCalls && !m.supports.toolCalls) return false;
    if (req.vision && !m.supports.vision) return false;
    if (req.streaming && !m.supports.streaming) return false;
    if (req.embeddings && !m.supports.embeddings) return false;
    return true;
  }

  private capabilityScore(m: ModelSpec, req?: ChatPayload["requires"]): number {
    if (!req) return 0;
    let score = 0;
    if (req.toolCalls && m.supports.toolCalls) score += 30;
    if (req.vision && m.supports.vision) score += 40;
    if (req.streaming && m.supports.streaming) score += 10;
    return score;
  }
}

const providers: Record<ModelSpec["type"], Provider> = {
  "openai-compatible": openaiCompatibleProvider,
  "anthropic": anthropicProvider,
  "google": googleProvider,
  "ollama": ollamaProvider,
  "local-gguf": localProvider,
  "azure-openai": azureOpenAIProvider,
  "mock": mockProvider
};

export async function callModel(
  payload: ChatPayload,
  agentName: string = "UnknownAgent"
): Promise<ChatResult> {
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
      error: err.message ?? String(err)
    });
    throw err;
  }
}
