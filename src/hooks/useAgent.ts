import { useState, useCallback, useEffect } from "react";
import { AgentDetail, LogEvent, ExecutionRecord, AgentDetailResponse } from "../types/agents";
import { mockAgentDetail, mockLogEvents, mockExecutions } from "../mocks/agents";

export function useAgent(
  id: string,
  options: { poll?: boolean; stream?: boolean } = {}
): AgentDetailResponse {
  const { poll = true, stream = true } = options;
  const [agent, setAgent] = useState<AgentDetail | null>(mockAgentDetail);
  const [logs, setLogs] = useState<LogEvent[]>(mockLogEvents);
  const [executions, setExecutions] = useState<ExecutionRecord[]>(mockExecutions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadAgent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API calls
      // const response = await fetch(`/api/agents/${id}`);
      // const data = await response.json();
      // setAgent(data);
      setAgent(mockAgentDetail);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load agent"));
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadLogs = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/agents/${id}/logs?limit=100`);
      // const data = await response.json();
      // setLogs(data);
      setLogs(mockLogEvents);
    } catch (err) {
      // Non-fatal error for logs
    }
  }, [id]);

  const loadExecutions = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/agents/${id}/executions?limit=100`);
      // const data = await response.json();
      // setExecutions(data);
      setExecutions(mockExecutions);
    } catch (err) {
      // Non-fatal error for executions
    }
  }, [id]);

  const invoke = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/agents/${id}/invoke`, {
      //   method: "POST",
      //   body: JSON.stringify({ skill: skillName, payload: {} }),
      // });
      // const data = await response.json();
      // Show toast with execution ID
    } catch (err) {
      // Handle error
    }
  }, [id]);

  const pause = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/agents/${id}/pause`, { method: "POST" });
      // Update agent status
    } catch (err) {
      // Handle error
    }
  }, [id]);

  const restart = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/agents/${id}/restart`, { method: "POST" });
      // Show toast with restart status
    } catch (err) {
      // Handle error
    }
  }, [id]);

  const snapshot = useCallback(async (): Promise<string> => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/agents/${id}/snapshot`, { method: "POST" });
      // const data = await response.json();
      // return data.snapshotId;
      return `snapshot-${Date.now()}`;
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to snapshot agent");
    }
  }, [id]);

  useEffect(() => {
    loadAgent();
    loadLogs();
    loadExecutions();
  }, [id, loadAgent, loadLogs, loadExecutions]);

  useEffect(() => {
    if (poll) {
      const interval = setInterval(() => {
        loadAgent();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [poll, loadAgent]);

  useEffect(() => {
    if (stream) {
      // TODO: Subscribe to WebSocket at /ws/agents/{id}/logs
      // TODO: Subscribe to WebSocket at /ws/agents/{id}/executions
    }
  }, [id, stream]);

  return {
    agent,
    logs,
    executions,
    loading,
    error,
    actions: {
      invoke,
      pause,
      restart,
      snapshot,
    },
  };
}
