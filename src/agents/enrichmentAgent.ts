import { BaseAgent } from "./baseAgent.js";
import { AgentRoutingProfile } from "./routingProfile.js";
import { ChatPayload } from "../core/modelRouter.js";

export class EnrichmentAgent extends BaseAgent {
  protected routingProfile = new AgentRoutingProfile(
    ["fugu-ultra", "claude-3.7"],
    ["gpt-4.1", "gemini-2.0"]
  );

  async enrich(doc: string) {
    const messages = this.buildEnrichmentPrompt(doc);
    const res = await this.llm(messages);
    return this.parseEnrichment(res.text);
  }

  private buildEnrichmentPrompt(doc: string): ChatPayload["messages"] {
    return [
      { role: "system", content: "You are an enrichment agent." },
      { role: "user", content: `Enrich this doc: ${doc}` }
    ];
  }

  private parseEnrichment(text: string): string {
    return text.trim();
  }
}
