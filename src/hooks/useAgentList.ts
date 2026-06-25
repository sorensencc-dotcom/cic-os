import { useState, useCallback, useEffect } from "react";
import { AgentListItem, AgentListResponse } from "../types/agents";
import { mockAgentsList } from "../mocks/agents";

export function useAgentList(options: { poll?: boolean; stream?: boolean } = {}): AgentListResponse {
  const { poll = true, stream = true } = options;
  const [agents, setAgents] = useState<AgentListItem[]>(mockAgentsList);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch("/api/agents");
      // const data = await response.json();
      // setAgents(data);
      setAgents(mockAgentsList);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load agents"));
    } finally {
      setLoading(false);
    }
  }, []);

  const snapshotAll = useCallback(async (): Promise<string> => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch("/api/agents/snapshot", { method: "POST" });
      // const data = await response.json();
      // return data.snapshotId;
      return `snapshot-${Date.now()}`;
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to snapshot agents");
    }
  }, []);

  useEffect(() => {
    if (poll) {
      const interval = setInterval(refresh, 5000);
      return () => clearInterval(interval);
    }
  }, [poll, refresh]);

  useEffect(() => {
    if (stream) {
      // TODO: Subscribe to WebSocket at /ws/agents/status
    }
  }, [stream]);

  return {
    agents,
    loading,
    error,
    refresh,
    snapshotAll,
  };
}
