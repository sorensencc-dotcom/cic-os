import { callModel, ChatPayload } from "../core/modelRouter.js";
import { getModelSpec } from "../core/modelRegistry.js";
import { ModelSpec } from "../core/modelSpec.js";
import { AgentRoutingProfile } from "./routingProfile.js";

export abstract class BaseAgent {
  protected abstract routingProfile: AgentRoutingProfile;
  protected agentName: string = this.constructor.name;

  protected async llm(messages: ChatPayload["messages"], opts: Partial<{ model: string; temperature: number; maxTokens: number }> = {}) {
    const modelName = opts.model ?? this.routingProfile.pickModel();
    const spec = getModelSpec(modelName);

    const payload: ChatPayload = {
      model: modelName,
      messages: this.formatMessagesForModel(messages, spec),
      temperature: opts.temperature,
      maxTokens: opts.maxTokens ?? spec.maxTokens
    };

    return callModel(payload, this.agentName);
  }

  protected formatMessagesForModel(messages: ChatPayload["messages"], spec: ModelSpec): ChatPayload["messages"] {
    let result = [...messages];

    if (!spec.supports.toolCalls) {
      result = this.stripToolCallInstructions(result);
    }

    if (!spec.supports.vision) {
      result = this.stripImageContent(result);
    }

    result = this.normalizeSystemPrompts(result, spec);
    result = this.normalizeMessageRoles(result, spec);

    return result;
  }

  private stripToolCallInstructions(messages: ChatPayload["messages"]): ChatPayload["messages"] {
    return messages.map(m => {
      if (m.role === "system") {
        return { ...m, content: m.content.replace(/Use tools to.+/gi, "").replace(/<tools>[\s\S]*?<\/tools>/gi, "") };
      }
      return m;
    });
  }

  private stripImageContent(messages: ChatPayload["messages"]): ChatPayload["messages"] {
    // In a full implementation, this parses multi-part content
    return messages;
  }

  private normalizeSystemPrompts(messages: ChatPayload["messages"], spec: ModelSpec): ChatPayload["messages"] {
    // Basic normalization: specific handling per provider is done in the provider itself
    // We just return them cleanly.
    return messages;
  }

  private normalizeMessageRoles(messages: ChatPayload["messages"], spec: ModelSpec): ChatPayload["messages"] {
    return messages;
  }
}
