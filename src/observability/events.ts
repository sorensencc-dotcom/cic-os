export interface EventPayload {
  eventName: "MODEL_CALL_START" | "MODEL_CALL_SUCCESS" | "MODEL_CALL_FAILURE" | "AUDIT_COMPARISON";
  model?: string;
  latencyMs?: number;
  tokensUsed?: { input: number; output: number };
  error?: string;
  agent?: string;
  [key: string]: any;
}

export function logEvent(payload: EventPayload): void {
  // Real implementation wires into CIC observability layer
  // Event emission placeholder
}
