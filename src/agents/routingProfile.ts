import { getModelSpec } from "../core/modelRegistry.js";
import { RoutingError } from "../core/errors.js";

export class AgentRoutingProfile {
  constructor(
    private readonly preferredModels: string[],
    private readonly fallbackModels: string[] = []
  ) {}

  pickModel(): string {
    const candidates = [...this.preferredModels, ...this.fallbackModels]
      .map(name => {
        let score = 0;
        try {
          const spec = getModelSpec(name);
          score = spec.routing?.score ?? 0;
        } catch {
          // Model spec might be missing; score remains 0
        }
        return { name, score };
      })
      .filter(c => c.score > 0)
      .sort((a, b) => b.score - a.score);

    if (!candidates.length) {
      throw new RoutingError("No valid models configured for routing profile");
    }

    return candidates[0].name;
  }
}
