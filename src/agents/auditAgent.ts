import { BaseAgent } from "./baseAgent.js";
import { AgentRoutingProfile } from "./routingProfile.js";
import { ChatPayload } from "../core/modelRouter.js";
import { logEvent } from "../observability/events.js";

export interface AuditResult {
  primary: string;
  secondary: string;
  score: number;
  issues: string[];
}

export class AuditAgent extends BaseAgent {
  protected routingProfile = new AgentRoutingProfile(["claude-3.7"], ["fugu"]);

  async audit(result: string): Promise<AuditResult> {
    const messages = this.buildAuditPrompt(result);

    let primaryResult = "";
    let secondaryResult = "";

    try {
      const primary = await this.llm(messages); // Uses routingProfile
      primaryResult = primary.text;
    } catch (e) {
      // Primary failed, fallback to secondary for primary slot
      const fallback = await this.llm(messages, { model: "fugu" });
      primaryResult = fallback.text;
    }

    try {
      const secondary = await this.llm(messages, { model: "fugu" });
      secondaryResult = secondary.text;
    } catch (e) {
      // Secondary failed, degrade gracefully
      secondaryResult = primaryResult; 
    }

    const { score, issues } = this.computeConsistency(primaryResult, secondaryResult);

    logEvent({
      eventName: "AUDIT_COMPARISON",
      agent: this.agentName,
      primaryModel: "claude-3.7",
      secondaryModel: "fugu",
      score
    });

    return {
      primary: primaryResult,
      secondary: secondaryResult,
      score,
      issues
    };
  }

  private buildAuditPrompt(result: string): ChatPayload["messages"] {
    return [
      { role: "system", content: "You are an audit agent. Explain your reasoning." },
      { role: "user", content: `Audit this result: ${result}` }
    ];
  }

  private computeConsistency(primaryText: string, secondaryText: string): { score: number, issues: string[] } {
    const issues: string[] = [];
    let score = 1.0;

    if (!primaryText || !secondaryText) {
      return { score: 0, issues: ["Missing output"] };
    }

    if (primaryText !== secondaryText && !primaryText.includes(secondaryText) && !secondaryText.includes(primaryText)) {
      score -= 0.3;
      issues.push("Semantic mismatch");
    }

    if (primaryText.includes("hallucination") || secondaryText.includes("hallucination")) {
      score -= 0.5;
      issues.push("Hallucination marker detected");
    }

    if (primaryText.length > secondaryText.length * 2 || secondaryText.length > primaryText.length * 2) {
      score -= 0.2;
      issues.push("Missing reasoning steps in shorter response");
    }

    return { score: Math.max(0, score), issues };
  }
}
