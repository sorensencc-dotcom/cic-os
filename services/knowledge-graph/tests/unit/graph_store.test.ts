import { InMemoryGraphStore } from "../../src/core/graph_store/GraphStore";
import { Node } from "../../src/core/models/Node";
import { Edge } from "../../src/core/models/Edge";
import { randomUUID } from "crypto";

describe("InMemoryGraphStore", () => {
  let store: InMemoryGraphStore;

  beforeEach(() => {
    store = new InMemoryGraphStore();
  });

  describe("createNode / getNode", () => {
    it("should create and retrieve a node", () => {
      const node: Node = {
        id: randomUUID(),
        type: "RunEvent",
        createdAt: new Date().toISOString(),
        labels: { agent_id: "agent-1" },
        properties: { status: "success" },
      };

      store.createNode(node);
      const retrieved = store.getNode(node.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.type).toBe("RunEvent");
      expect(retrieved?.labels.agent_id).toBe("agent-1");
    });

    it("should return null for non-existent node", () => {
      const retrieved = store.getNode("nonexistent-id");
      expect(retrieved).toBeNull();
    });
  });

  describe("findNodes", () => {
    it("should find nodes by type", () => {
      const node1: Node = {
        id: randomUUID(),
        type: "RunEvent",
        createdAt: new Date().toISOString(),
        labels: {},
        properties: {},
      };
      const node2: Node = {
        id: randomUUID(),
        type: "Signal",
        createdAt: new Date().toISOString(),
        labels: {},
        properties: {},
      };

      store.createNode(node1);
      store.createNode(node2);

      const runEvents = store.findNodes({ type: "RunEvent" });
      expect(runEvents.length).toBe(1);
      expect(runEvents[0].id).toBe(node1.id);
    });

    it("should return empty array if no matches", () => {
      const results = store.findNodes({ type: "NonExistentType" });
      expect(results).toEqual([]);
    });
  });

  describe("createEdge / getEdge", () => {
    it("should create and retrieve an edge", () => {
      const srcId = randomUUID();
      const dstId = randomUUID();
      const edge: Edge = {
        id: randomUUID(),
        srcId,
        dstId,
        type: "AGENT_EXECUTED_EVENT",
        createdAt: new Date().toISOString(),
        properties: {},
      };

      store.createEdge(edge);
      const retrieved = store.getEdge(edge.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.type).toBe("AGENT_EXECUTED_EVENT");
      expect(retrieved?.srcId).toBe(srcId);
    });

    it("should return null for non-existent edge", () => {
      const retrieved = store.getEdge("nonexistent-id");
      expect(retrieved).toBeNull();
    });
  });

  describe("findEdges", () => {
    it("should find edges by srcId", () => {
      const srcId = randomUUID();
      const dstId1 = randomUUID();
      const dstId2 = randomUUID();

      const edge1: Edge = {
        id: randomUUID(),
        srcId,
        dstId: dstId1,
        type: "AGENT_EXECUTED_EVENT",
        createdAt: new Date().toISOString(),
        properties: {},
      };
      const edge2: Edge = {
        id: randomUUID(),
        srcId: dstId1,
        dstId: dstId2,
        type: "EVENT_TOUCHES_REPO",
        createdAt: new Date().toISOString(),
        properties: {},
      };

      store.createEdge(edge1);
      store.createEdge(edge2);

      const results = store.findEdges({ srcId });
      expect(results.length).toBe(1);
      expect(results[0].id).toBe(edge1.id);
    });

    it("should find edges by type", () => {
      const srcId = randomUUID();
      const dstId = randomUUID();

      const edge1: Edge = {
        id: randomUUID(),
        srcId,
        dstId,
        type: "AGENT_EXECUTED_EVENT",
        createdAt: new Date().toISOString(),
        properties: {},
      };
      const edge2: Edge = {
        id: randomUUID(),
        srcId,
        dstId,
        type: "EVENT_EMITS_SIGNAL",
        createdAt: new Date().toISOString(),
        properties: {},
      };

      store.createEdge(edge1);
      store.createEdge(edge2);

      const results = store.findEdges({ type: "AGENT_EXECUTED_EVENT" });
      expect(results.length).toBe(1);
      expect(results[0].type).toBe("AGENT_EXECUTED_EVENT");
    });
  });

  describe("batchInsert", () => {
    it("should atomically insert nodes and edges", () => {
      const nodeId1 = randomUUID();
      const nodeId2 = randomUUID();

      const nodes: Node[] = [
        {
          id: nodeId1,
          type: "RunEvent",
          createdAt: new Date().toISOString(),
          labels: {},
          properties: {},
        },
        {
          id: nodeId2,
          type: "Signal",
          createdAt: new Date().toISOString(),
          labels: {},
          properties: {},
        },
      ];

      const edges: Edge[] = [
        {
          id: randomUUID(),
          srcId: nodeId1,
          dstId: nodeId2,
          type: "EVENT_EMITS_SIGNAL",
          createdAt: new Date().toISOString(),
          properties: {},
        },
      ];

      store.batchInsert(nodes, edges);

      expect(store.getNode(nodeId1)).toBeDefined();
      expect(store.getNode(nodeId2)).toBeDefined();
      expect(store.findEdges({ type: "EVENT_EMITS_SIGNAL" }).length).toBe(1);
    });
  });

  describe("getStats", () => {
    it("should return correct node and edge counts", () => {
      const node1: Node = {
        id: randomUUID(),
        type: "RunEvent",
        createdAt: new Date().toISOString(),
        labels: {},
        properties: {},
      };
      const node2: Node = {
        id: randomUUID(),
        type: "Signal",
        createdAt: new Date().toISOString(),
        labels: {},
        properties: {},
      };

      store.createNode(node1);
      store.createNode(node2);

      const edge: Edge = {
        id: randomUUID(),
        srcId: node1.id,
        dstId: node2.id,
        type: "EVENT_EMITS_SIGNAL",
        createdAt: new Date().toISOString(),
        properties: {},
      };

      store.createEdge(edge);

      const stats = store.getStats();
      expect(stats.nodeCount).toBe(2);
      expect(stats.edgeCount).toBe(1);
    });
  });
});
