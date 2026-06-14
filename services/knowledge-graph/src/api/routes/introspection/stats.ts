import { Request, Response } from "express";
import { IGraphStore } from "../../../core/graph_store/GraphStore";

export function statsRoute(store: IGraphStore) {
  return (req: Request, res: Response): void => {
    const stats = store.getStats();
    res.json({
      nodes: {
        total: stats.nodeCount,
      },
      edges: {
        total: stats.edgeCount,
      },
      lastIngestionAt: stats.lastIngestionAt,
    });
  };
}
