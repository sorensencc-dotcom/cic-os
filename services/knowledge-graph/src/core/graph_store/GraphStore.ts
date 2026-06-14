import { Node, validateNode } from "../models/Node";
import { Edge, validateEdge } from "../models/Edge";

export interface IGraphStore {
  createNode(node: Node): void;
  getNode(id: string): Node | null;
  findNodes(filter: Partial<Node>): Node[];

  createEdge(edge: Edge): void;
  getEdge(id: string): Edge | null;
  findEdges(filter: Partial<Edge>): Edge[];

  batchInsert(nodes: Node[], edges: Edge[]): void;

  getStats(): { nodeCount: number; edgeCount: number; lastIngestionAt: string | null };
}

export class InMemoryGraphStore implements IGraphStore {
  private nodes: Map<string, Node> = new Map();
  private edges: Map<string, Edge> = new Map();

  createNode(node: Node): void {
    if (!validateNode(node)) {
      throw new Error("Invalid node");
    }
    this.nodes.set(node.id, node);
  }

  getNode(id: string): Node | null {
    return this.nodes.get(id) || null;
  }

  findNodes(filter: Partial<Node>): Node[] {
    return Array.from(this.nodes.values()).filter((node) => {
      if (filter.type && node.type !== filter.type) return false;
      if (filter.createdAt && node.createdAt !== filter.createdAt) return false;
      return true;
    });
  }

  createEdge(edge: Edge): void {
    if (!validateEdge(edge)) {
      throw new Error("Invalid edge");
    }
    this.edges.set(edge.id, edge);
  }

  getEdge(id: string): Edge | null {
    return this.edges.get(id) || null;
  }

  findEdges(filter: Partial<Edge>): Edge[] {
    return Array.from(this.edges.values()).filter((edge) => {
      if (filter.srcId && edge.srcId !== filter.srcId) return false;
      if (filter.dstId && edge.dstId !== filter.dstId) return false;
      if (filter.type && edge.type !== filter.type) return false;
      return true;
    });
  }

  batchInsert(nodes: Node[], edges: Edge[]): void {
    for (const node of nodes) {
      this.createNode(node);
    }
    for (const edge of edges) {
      this.createEdge(edge);
    }
  }

  getStats(): { nodeCount: number; edgeCount: number; lastIngestionAt: string | null } {
    const allNodes = Array.from(this.nodes.values());
    const allEdges = Array.from(this.edges.values());

    const nodeTimestamps = allNodes.map((n) => n.createdAt).sort().reverse();
    const edgeTimestamps = allEdges.map((e) => e.createdAt).sort().reverse();
    const allTimestamps = [...nodeTimestamps, ...edgeTimestamps].sort().reverse();

    return {
      nodeCount: this.nodes.size,
      edgeCount: this.edges.size,
      lastIngestionAt: allTimestamps[0] || null,
    };
  }
}
