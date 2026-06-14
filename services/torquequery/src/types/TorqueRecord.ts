// TorqueQuery Record Types (Phase 26)

export interface TorqueMemoryEvent {
  id: string;
  type: string;
  agentId: string;
  timestamp: string;
  correlationId?: string;
  payload: unknown;
  createdAt: string;
  indexedAt?: string;
}

export interface TorqueSignal {
  id: string;
  eventId: string;
  signalType: string;
  value?: number;
  timestamp: string;
}

export interface TorqueCorrelation {
  id: string;
  correlationId: string;
  eventIds: string[];
  createdAt: string;
  resolvedAt?: string;
}

export interface TorqueAgent {
  id: string;
  agentId: string;
  lastSeen: string;
  eventCount: number;
}

export interface TorqueGovernanceHistory {
  id: string;
  proposalId: string;
  voteCount?: number;
  decision?: string;
  timestamp: string;
}

export interface TorqueAgentTimeline {
  id: string;
  agentId: string;
  eventId: string;
  sequence: number;
  timestamp: string;
}

export interface TorqueQueryResult {
  events: TorqueMemoryEvent[];
  signals: TorqueSignal[];
  correlations: TorqueCorrelation[];
  agents: TorqueAgent[];
}
