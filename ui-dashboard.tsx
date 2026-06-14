// ui-dashboard.tsx - React dashboard for CIC operator surface
import React, { useState, useEffect } from "react";

const ROADMAP_URL = process.env.REACT_APP_ROADMAP_URL || "http://localhost:3000";
const HARVESTER_URL = process.env.REACT_APP_HARVESTER_URL || "http://localhost:4000";
const INGESTION_URL = process.env.REACT_APP_INGESTION_URL || "http://localhost:8080";

interface ExternalEvent {
  id: string;
  repo: string;
  commit: string;
  impact_tags: string[];
  roadmap_items: number;
  docker_build: "pending" | "running" | "success" | "failed";
  timestamp: string;
}

interface ExtractorResult {
  repoId: string;
  duration_ms: number;
  extracted: {
    nodes: number;
    edges: number;
    security: number;
    patterns: number;
    impact: number;
  };
}

interface RoadmapItem {
  id: string;
  type: "todo" | "idea";
  title: string;
  priority: "high" | "medium" | "low";
  status: string;
  source: string;
  repo?: string;
  commit_sha?: string;
  tags: string[];
}

// ============================================================================
// EXTERNAL REPO UPDATES DASHBOARD
// ============================================================================

export function ExternalRepoUpdatesDashboard() {
  const [events, setEvents] = useState<ExternalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    repo: "",
    impactType: ""
  });

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  async function fetchEvents() {
    try {
      // Mock data for now
      setEvents([
        {
          id: "1",
          repo: "codeflow",
          commit: "abc123def456",
          impact_tags: ["mandatory_update.security"],
          roadmap_items: 3,
          docker_build: "success",
          timestamp: new Date().toISOString()
        }
      ]);
      setLoading(false);
    } catch (e) {
      console.error("Failed to fetch events:", e);
    }
  }

  return (
    <div className="dashboard">
      <h2>External Repo Updates</h2>

      <div className="filters">
        <label>
          Repo:
          <select
            value={filters.repo}
            onChange={(e) => setFilters({ ...filters, repo: e.target.value })}
          >
            <option value="">All</option>
            <option value="codeflow">CodeFlow</option>
          </select>
        </label>

        <label>
          Impact Type:
          <select
            value={filters.impactType}
            onChange={(e) => setFilters({ ...filters, impactType: e.target.value })}
          >
            <option value="">All</option>
            <option value="mandatory_update">Mandatory Update</option>
            <option value="workflow_improvement">Workflow Improvement</option>
            <option value="roadmap_idea">Roadmap Idea</option>
          </select>
        </label>
      </div>

      <table className="events-table">
        <thead>
          <tr>
            <th>Repo</th>
            <th>Commit</th>
            <th>Impact Tags</th>
            <th>Roadmap Items</th>
            <th>Docker Build</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6}>Loading...</td>
            </tr>
          ) : events.length === 0 ? (
            <tr>
              <td colSpan={6}>No events found</td>
            </tr>
          ) : (
            events.map((event) => (
              <tr key={event.id}>
                <td>
                  <code>{event.repo}</code>
                </td>
                <td>
                  <code>{event.commit.substring(0, 8)}</code>
                </td>
                <td>
                  {event.impact_tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </td>
                <td>{event.roadmap_items}</td>
                <td>
                  <span className={`status ${event.docker_build}`}>{event.docker_build}</span>
                </td>
                <td>{new Date(event.timestamp).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// EXTRACTOR RESULTS VIEW
// ============================================================================

export function ExtractorResultsView({ repoId }: { repoId: string }) {
  const [result, setResult] = useState<ExtractorResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("summary");

  useEffect(() => {
    fetchResult();
  }, [repoId]);

  async function fetchResult() {
    try {
      // Mock data for now
      setResult({
        repoId,
        duration_ms: 1234,
        extracted: {
          nodes: 42,
          edges: 125,
          security: 3,
          patterns: 7,
          impact: 15
        }
      });
      setLoading(false);
    } catch (e) {
      console.error("Failed to fetch result:", e);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (!result) return <div>No results found</div>;

  return (
    <div className="extractor-view">
      <h2>Extractor Results: {repoId}</h2>

      <div className="header">
        <div className="stat">
          <div className="value">{result.extracted.nodes}</div>
          <div className="label">Nodes</div>
        </div>
        <div className="stat">
          <div className="value">{result.extracted.edges}</div>
          <div className="label">Edges</div>
        </div>
        <div className="stat">
          <div className="value">{result.extracted.security}</div>
          <div className="label">Security Issues</div>
        </div>
        <div className="stat">
          <div className="value">{result.extracted.patterns}</div>
          <div className="label">Patterns</div>
        </div>
        <div className="stat">
          <div className="value">{result.extracted.impact}</div>
          <div className="label">Impact Entries</div>
        </div>
        <div className="stat">
          <div className="value">{result.duration_ms}ms</div>
          <div className="label">Duration</div>
        </div>
      </div>

      <div className="tabs">
        <button
          className={activeTab === "summary" ? "active" : ""}
          onClick={() => setActiveTab("summary")}
        >
          Summary
        </button>
        <button
          className={activeTab === "security" ? "active" : ""}
          onClick={() => setActiveTab("security")}
        >
          Security ({result.extracted.security})
        </button>
        <button
          className={activeTab === "patterns" ? "active" : ""}
          onClick={() => setActiveTab("patterns")}
        >
          Patterns ({result.extracted.patterns})
        </button>
        <button
          className={activeTab === "impact" ? "active" : ""}
          onClick={() => setActiveTab("impact")}
        >
          Impact ({result.extracted.impact})
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "summary" && (
          <div>
            <h3>Analysis Summary</h3>
            <p>Extraction completed in {result.duration_ms}ms</p>
            <p>
              Analyzed {result.extracted.nodes} files with {result.extracted.edges} dependencies.
            </p>
            <p>
              Found {result.extracted.security} security issues and {result.extracted.patterns} code
              patterns.
            </p>
          </div>
        )}
        {activeTab === "security" && (
          <div>
            <h3>Security Findings</h3>
            <p>Total: {result.extracted.security}</p>
            {/* Table would render findings here */}
          </div>
        )}
        {activeTab === "patterns" && (
          <div>
            <h3>Code Patterns</h3>
            <p>Total: {result.extracted.patterns}</p>
            {/* Table would render patterns here */}
          </div>
        )}
        {activeTab === "impact" && (
          <div>
            <h3>Blast Radius Analysis</h3>
            <p>Impact entries: {result.extracted.impact}</p>
            {/* Graph would render blast radius here */}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ROADMAP EXTERNAL ITEMS VIEW
// ============================================================================

export function RoadmapExternalItemsView() {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "",
    priority: "",
    repo: ""
  });

  useEffect(() => {
    fetchItems();
    const interval = setInterval(fetchItems, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [filters]);

  async function fetchItems() {
    try {
      // Mock data for now
      setItems([
        {
          id: "1",
          type: "todo",
          title: "Apply codeflow security scanner changes to CIC",
          priority: "high",
          status: "pending",
          source: "external",
          repo: "codeflow",
          commit_sha: "abc123def456",
          tags: ["mandatory_update.security"]
        },
        {
          id: "2",
          type: "idea",
          title: "Explore integrating codeflow blast radius improvements",
          priority: "medium",
          status: "open",
          source: "external",
          repo: "codeflow",
          tags: ["roadmap_idea.feature"]
        }
      ]);
      setLoading(false);
    } catch (e) {
      console.error("Failed to fetch items:", e);
    }
  }

  const filteredItems = items.filter(
    (item) =>
      (!filters.type || item.type === filters.type) &&
      (!filters.priority || item.priority === filters.priority) &&
      (!filters.repo || item.repo === filters.repo)
  );

  return (
    <div className="roadmap-view">
      <h2>Roadmap – External Repo Items</h2>

      <div className="filters">
        <label>
          Type:
          <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
            <option value="">All</option>
            <option value="todo">Todo</option>
            <option value="idea">Idea</option>
          </select>
        </label>

        <label>
          Priority:
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          >
            <option value="">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>

        <label>
          Repo:
          <select value={filters.repo} onChange={(e) => setFilters({ ...filters, repo: e.target.value })}>
            <option value="">All</option>
            <option value="codeflow">CodeFlow</option>
          </select>
        </label>
      </div>

      <table className="items-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Title</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Repo</th>
            <th>Commit</th>
            <th>Tags</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7}>Loading...</td>
            </tr>
          ) : filteredItems.length === 0 ? (
            <tr>
              <td colSpan={7}>No items found</td>
            </tr>
          ) : (
            filteredItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <span className={`type ${item.type}`}>{item.type}</span>
                </td>
                <td>{item.title}</td>
                <td>
                  <span className={`priority ${item.priority}`}>{item.priority}</span>
                </td>
                <td>{item.status}</td>
                <td>
                  <code>{item.repo}</code>
                </td>
                <td>
                  <code>{item.commit_sha?.substring(0, 8)}</code>
                </td>
                <td>
                  {item.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// VECTOR SUBSYSTEM OBS DASHBOARD
// ============================================================================

interface VectorCollectionMetrics {
  collection: string;
  healthy: boolean;
  pointCount: number | null;
  indexStatus: string | null;
  lastSearchLatencyMs: number | null;
  lastIndexLatencyMs: number | null;
}

export function VectorMetricsDashboard() {
  const [metrics, setMetrics] = useState<{
    chunks: VectorCollectionMetrics;
    context: VectorCollectionMetrics;
    skills: VectorCollectionMetrics;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function fetchMetrics() {
      try {
        const res = await fetch(`${INGESTION_URL}/vector/metrics`);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = await res.json();
        if (data.ok && active) {
          setMetrics(data);
          setError(null);
        } else if (active) {
          setError(data.error || "Failed to load metrics");
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : String(err));
        }
      }
    }

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="vector-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Vector Subsystem Health & Observability</h2>
        <span className={`status ${error ? 'failed' : 'success'}`}>
          {error ? `Offline: ${error}` : 'Connected'}
        </span>
      </div>

      {metrics && (
        <div className="header">
          {Object.entries(metrics).map(([key, m]) => (
            <div key={key} className="stat" style={{ borderLeft: `4px solid ${m.healthy ? '#10B981' : '#EF4444'}`, textAlign: 'left', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold', textTransform: 'capitalize', color: '#111827' }}>
                  {key} ({m.collection})
                </span>
                <span className={`status ${m.healthy ? 'success' : 'failed'}`}>
                  {m.healthy ? 'HEALTHY' : 'DOWN'}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase' }}>Points Count</div>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: '#1F2937' }}>
                    {m.pointCount !== null ? m.pointCount.toLocaleString() : 'N/A'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase' }}>Indexing Status</div>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: '#1F2937', textTransform: 'capitalize' }}>
                    {m.indexStatus || 'Unknown'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase' }}>Search Latency</div>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: '#1F2937' }}>
                    {m.lastSearchLatencyMs !== null ? `${m.lastSearchLatencyMs.toFixed(2)} ms` : 'No search yet'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase' }}>Index Latency</div>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: '#1F2937' }}>
                    {m.lastIndexLatencyMs !== null ? `${m.lastIndexLatencyMs.toFixed(2)} ms` : 'No index yet'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN APP
// ============================================================================

export default function App() {
  const [view, setView] = useState<"external-updates" | "extractor" | "roadmap" | "vector">("external-updates");

  return (
    <div className="app">
      <header>
        <h1>CIC Operator Console</h1>
        <nav>
          <button
            className={view === "external-updates" ? "active" : ""}
            onClick={() => setView("external-updates")}
          >
            External Repo Updates
          </button>
          <button
            className={view === "extractor" ? "active" : ""}
            onClick={() => setView("extractor")}
          >
            Extractor Results
          </button>
          <button
            className={view === "roadmap" ? "active" : ""}
            onClick={() => setView("roadmap")}
          >
            Roadmap Items
          </button>
          <button
            className={view === "vector" ? "active" : ""}
            onClick={() => setView("vector")}
          >
            Vector Metrics
          </button>
        </nav>
      </header>

      <main>
        {view === "external-updates" && <ExternalRepoUpdatesDashboard />}
        {view === "extractor" && <ExtractorResultsView repoId="codeflow" />}
        {view === "roadmap" && <RoadmapExternalItemsView />}
        {view === "vector" && <VectorMetricsDashboard />}
      </main>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: #f5f5f5;
          color: #333;
        }

        .app {
          min-height: 100vh;
        }

        header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        h1 {
          margin-bottom: 20px;
          font-size: 28px;
        }

        nav {
          display: flex;
          gap: 10px;
        }

        nav button {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.3s;
        }

        nav button:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        nav button.active {
          background: white;
          color: #667eea;
          font-weight: 600;
        }

        main {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard,
        .extractor-view,
        .roadmap-view {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        h2 {
          font-size: 24px;
          margin-bottom: 20px;
          color: #333;
        }

        h3 {
          font-size: 18px;
          margin-bottom: 12px;
          color: #555;
        }

        .filters {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;
        }

        .filters label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        th {
          background: #f9f9f9;
          padding: 12px;
          text-align: left;
          border-bottom: 2px solid #ddd;
          font-weight: 600;
        }

        td {
          padding: 12px;
          border-bottom: 1px solid #eee;
        }

        tr:hover {
          background: #f9f9f9;
        }

        code {
          background: #f5f5f5;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: "Monaco", "Courier New", monospace;
          font-size: 12px;
        }

        .tag {
          display: inline-block;
          background: #e0e7ff;
          color: #667eea;
          padding: 4px 8px;
          border-radius: 3px;
          font-size: 12px;
          margin-right: 4px;
        }

        .status {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 3px;
          font-size: 12px;
          font-weight: 600;
        }

        .status.success {
          background: #d4edda;
          color: #155724;
        }

        .status.running {
          background: #fff3cd;
          color: #856404;
        }

        .status.pending {
          background: #e2e3e5;
          color: #383d41;
        }

        .status.failed {
          background: #f8d7da;
          color: #721c24;
        }

        .type {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 3px;
          font-size: 12px;
          font-weight: 600;
        }

        .type.todo {
          background: #d4edda;
          color: #155724;
        }

        .type.idea {
          background: #d1ecf1;
          color: #0c5460;
        }

        .priority {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 3px;
          font-size: 12px;
          font-weight: 600;
        }

        .priority.high {
          background: #f8d7da;
          color: #721c24;
        }

        .priority.medium {
          background: #fff3cd;
          color: #856404;
        }

        .priority.low {
          background: #d1ecf1;
          color: #0c5460;
        }

        .header {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat {
          background: #f9f9f9;
          padding: 16px;
          border-radius: 6px;
          text-align: center;
          border: 1px solid #eee;
        }

        .stat .value {
          font-size: 32px;
          font-weight: 700;
          color: #667eea;
        }

        .stat .label {
          font-size: 12px;
          color: #999;
          margin-top: 8px;
        }

        .tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          border-bottom: 2px solid #eee;
        }

        .tabs button {
          background: none;
          border: none;
          padding: 12px 16px;
          cursor: pointer;
          font-size: 14px;
          color: #999;
          border-bottom: 3px solid transparent;
          transition: all 0.3s;
        }

        .tabs button:hover {
          color: #667eea;
        }

        .tabs button.active {
          color: #667eea;
          border-bottom-color: #667eea;
        }

        .tab-content {
          padding: 16px 0;
        }
      `}</style>
    </div>
  );
}
