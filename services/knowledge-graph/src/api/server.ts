import express, { Express, Request, Response, NextFunction } from "express";
import { GraphStore } from "../core/graph_store/GraphStore";
import { schemaRoute } from "./routes/introspection/schema";
import { statsRoute } from "./routes/introspection/stats";

export function createServer(store: GraphStore): Express {
  const app = express();

  app.use(express.json());

  app.get("/health", (req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  app.get("/api/knowledge-graph/schema", schemaRoute);
  app.get("/api/knowledge-graph/stats", statsRoute(store));

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: err.message });
  });

  return app;
}

export async function startServer(store: GraphStore, port: number = 3100): Promise<void> {
  const app = createServer(store);
  app.listen(port, () => {
    console.log(`Knowledge Graph service listening on port ${port}`);
  });
}
