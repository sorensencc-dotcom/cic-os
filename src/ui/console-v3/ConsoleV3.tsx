/**
 * Phase 3.6: Operator Console v3 Root Component
 * Integrates accessibility (keyboard, live regions, focus order) with 6-panel dashboard
 * Polling → announcements wiring + keyboard controls
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ConsoleLiveRegions,
  useConsoleAnnouncements,
  PollingAnnouncements,
  AnnouncementEvent,
} from './live-regions';
import { installKeyboardHook, KeyboardHookCallbacks } from './keyboard-shortcuts';

// Panel component placeholders (with forwardRef support)
const HealthPanel = React.forwardRef<HTMLDivElement, { onRefresh?: () => void }>(
  ({ onRefresh }, ref) => (
    <div ref={ref} role="region" aria-labelledby="health-title" tabIndex={0} className="panel health-panel">
      <h2 id="health-title">Health</h2>
      <div>Services: OK</div>
      <button type="button" onClick={onRefresh}>Refresh</button>
    </div>
  )
);
HealthPanel.displayName = 'HealthPanel';

const PipelinesPanel = React.forwardRef<HTMLDivElement, { onRefresh?: () => void }>(
  ({ onRefresh }, ref) => (
    <div ref={ref} role="region" aria-labelledby="pipelines-title" tabIndex={0} className="panel pipelines-panel">
      <h2 id="pipelines-title">Pipelines</h2>
      <div>No active pipelines</div>
      <button type="button" onClick={onRefresh}>Refresh</button>
    </div>
  )
);
PipelinesPanel.displayName = 'PipelinesPanel';

const AgentsPanel = React.forwardRef<HTMLDivElement, { onRefresh?: () => void }>(
  ({ onRefresh }, ref) => (
    <div ref={ref} role="region" aria-labelledby="agents-title" tabIndex={0} className="panel agents-panel">
      <h2 id="agents-title">Agents</h2>
      <div>0 agents online</div>
      <button type="button" onClick={onRefresh}>Refresh</button>
    </div>
  )
);
AgentsPanel.displayName = 'AgentsPanel';

const AlertsPanel = React.forwardRef<HTMLDivElement, { onRefresh?: () => void }>(
  ({ onRefresh }, ref) => (
    <div ref={ref} role="region" aria-labelledby="alerts-title" tabIndex={0} className="panel alerts-panel">
      <h2 id="alerts-title">Alerts</h2>
      <div>No active alerts</div>
      <button type="button" onClick={onRefresh}>Refresh</button>
    </div>
  )
);
AlertsPanel.displayName = 'AlertsPanel';

const WorkspacePanel = React.forwardRef<HTMLDivElement, { onRefresh?: () => void }>(
  ({ onRefresh }, ref) => (
    <div ref={ref} role="region" aria-labelledby="workspace-title" tabIndex={0} className="panel workspace-panel">
      <h2 id="workspace-title">Workspace</h2>
      <div>User: operator</div>
      <button type="button" onClick={onRefresh}>Refresh</button>
    </div>
  )
);
WorkspacePanel.displayName = 'WorkspacePanel';

const ControlsPanel = () => (
  <div role="region" aria-labelledby="controls-title" className="panel controls-panel">
    <h2 id="controls-title">Controls</h2>
    <div>Ctrl+R: Refresh Health | Ctrl+Shift+R: Refresh All | P+N: Pause Pipeline | [ / ]: Navigate</div>
  </div>
);

/**
 * ConsoleV3: Main root component
 * Layout: Tier 1 (60/40), Tier 2 (33/33/33), Tier 3 (100%)
 * Integrates Phase 3.6 accessibility + polling + announcements
 */
export const ConsoleV3: React.FC = () => {
  const consoleRef = useRef<HTMLDivElement>(null);
  const { statusRef, alertRef, logRef, announce } = useConsoleAnnouncements();

  // Polling state
  const [healthStatus, setHealthStatus] = useState<PollingAnnouncements.HealthPollResult | null>(null);
  const [previousHealthStatus, setPreviousHealthStatus] = useState<PollingAnnouncements.HealthPollResult | null>(null);
  const [pipelines, setPipelines] = useState<PollingAnnouncements.PipelinePollResult[]>([]);
  const [previousPipelines, setPreviousPipelines] = useState<Map<string, string>>(new Map());
  const [alerts, setAlerts] = useState<PollingAnnouncements.AlertPollResult[]>([]);
  const [previousAlerts, setPreviousAlerts] = useState<PollingAnnouncements.AlertPollResult[]>([]);

  // Panel ref for focus navigation
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [focusedPanelIndex, setFocusedPanelIndex] = useState(0);

  // Health polling (10s)
  useEffect(() => {
    const pollHealth = async () => {
      try {
        // Mock data for now
        const newHealth: PollingAnnouncements.HealthPollResult = {
          status: 'OK',
          serviceCount: 5,
          timestamp: Date.now(),
        };

        const announcement = PollingAnnouncements.formatHealthAnnouncement(newHealth, previousHealthStatus);
        if (announcement) {
          announce(announcement);
        }

        setHealthStatus(newHealth);
        setPreviousHealthStatus(newHealth);
      } catch (e) {
        console.error('Health poll failed:', e);
      }
    };

    pollHealth();
    const interval = setInterval(pollHealth, 10000);
    return () => clearInterval(interval);
  }, [previousHealthStatus, announce]);

  // Pipelines polling (5s)
  useEffect(() => {
    const pollPipelines = async () => {
      try {
        const newPipelines: PollingAnnouncements.PipelinePollResult[] = [];

        const previousMap = new Map(previousPipelines);
        const announcements = PollingAnnouncements.formatPipelineAnnouncement(newPipelines, previousMap);
        announcements.forEach((a) => announce(a));

        setPipelines(newPipelines);
        const newMap = new Map(newPipelines.map((p) => [p.id, p.state]));
        setPreviousPipelines(newMap);
      } catch (e) {
        console.error('Pipelines poll failed:', e);
      }
    };

    pollPipelines();
    const interval = setInterval(pollPipelines, 5000);
    return () => clearInterval(interval);
  }, [announce]);

  // Alerts polling (3s)
  useEffect(() => {
    const pollAlerts = async () => {
      try {
        const newAlerts: PollingAnnouncements.AlertPollResult[] = [];

        const announcement = PollingAnnouncements.formatAlertAnnouncement(newAlerts, previousAlerts);
        if (announcement) {
          announce(announcement);
        }

        setAlerts(newAlerts);
        setPreviousAlerts(newAlerts);
      } catch (e) {
        console.error('Alerts poll failed:', e);
      }
    };

    pollAlerts();
    const interval = setInterval(pollAlerts, 3000);
    return () => clearInterval(interval);
  }, [announce]);

  // Keyboard shortcuts handler
  const handleKeyboardAction = useCallback<KeyboardHookCallbacks>({
    onRefresh: (target) => {
      if (target === 'health') {
        announce({ type: 'status', message: 'Health panel refreshed' });
      } else if (target === 'all') {
        announce({ type: 'status', message: 'All panels refreshed' });
      }
    },
    onPipeline: (action, pipelineNumber) => {
      announce({
        type: 'log',
        message: `Pipeline ${pipelineNumber} ${action}`,
      });
    },
    onAcknowledge: () => {
      announce({ type: 'status', message: 'Alert acknowledged' });
    },
    onFocusSearch: () => {
      announce({ type: 'status', message: 'Search input focused' });
    },
    onNavigatePanel: (direction) => {
      let nextIndex = focusedPanelIndex;
      if (direction === 'next') {
        nextIndex = (focusedPanelIndex + 1) % panelRefs.current.length;
      } else if (direction === 'prev') {
        nextIndex = (focusedPanelIndex - 1 + panelRefs.current.length) % panelRefs.current.length;
      }
      setFocusedPanelIndex(nextIndex);
      panelRefs.current[nextIndex]?.focus();
      announce({
        type: 'status',
        message: `Focused panel ${nextIndex + 1}`,
      });
    },
  }, [focusedPanelIndex, announce]);

  // Install keyboard hook on mount
  useEffect(() => {
    if (!consoleRef.current) return;

    const cleanup = installKeyboardHook(
      {
        onRefresh: handleKeyboardAction.onRefresh,
        onPipeline: handleKeyboardAction.onPipeline,
        onAcknowledge: handleKeyboardAction.onAcknowledge,
        onFocusSearch: handleKeyboardAction.onFocusSearch,
        onNavigatePanel: handleKeyboardAction.onNavigatePanel,
      },
      { target: consoleRef.current }
    );

    return cleanup;
  }, [handleKeyboardAction]);

  return (
    <div
      ref={consoleRef}
      className="console-v3"
      role="main"
      aria-label="Operator Console v3"
    >
      {/* Live regions (ARIA announcements for screen readers) */}
      <ConsoleLiveRegions ref={consoleRef} />

      {/* Tier 1: Health (60%) + Pipelines (40%) */}
      <div className="tier-1">
        <HealthPanel onRefresh={() => announce({ type: 'status', message: 'Health refreshed' })} />
        <PipelinesPanel onRefresh={() => announce({ type: 'status', message: 'Pipelines refreshed' })} />
      </div>

      {/* Tier 2: Agents (33%) + Alerts (33%) + Workspace (33%) */}
      <div className="tier-2">
        <AgentsPanel
          onRefresh={() => announce({ type: 'status', message: 'Agents refreshed' })}
          ref={(el) => {
            panelRefs.current[2] = el;
          }}
        />
        <AlertsPanel onRefresh={() => announce({ type: 'status', message: 'Alerts refreshed' })} />
        <WorkspacePanel onRefresh={() => announce({ type: 'status', message: 'Workspace refreshed' })} />
      </div>

      {/* Tier 3: Controls (100%) */}
      <ControlsPanel />

      {/* Styles */}
      <style>{`
        .console-v3 {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          padding: 16px;
          background: #f5f5f5;
          min-height: 100vh;
        }

        .tier-1 {
          display: grid;
          grid-template-columns: 60% 40%;
          gap: 16px;
          margin-bottom: 16px;
        }

        .tier-2 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .panel {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          outline: 2px solid transparent;
          outline-offset: 2px;
        }

        .panel:focus {
          outline: 2px solid #0066cc;
          box-shadow: 0 0 0 4px rgba(0, 102, 204, 0.1);
        }

        .panel h2 {
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
        }

        .panel button {
          background: #0066cc;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          margin-top: 12px;
        }

        .panel button:hover {
          background: #0052a3;
        }

        .controls-panel {
          background: #f0f0f0;
          font-size: 12px;
          color: #666;
        }
      `}</style>
    </div>
  );
};

ConsoleV3.displayName = 'ConsoleV3';

export default ConsoleV3;
