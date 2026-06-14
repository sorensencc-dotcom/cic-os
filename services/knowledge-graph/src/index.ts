import { InMemoryGraphStore } from "./core/graph_store/GraphStore";
import { startServer } from "./api/server";

const port = parseInt(process.env.KG_PORT || "3107", 10);

async function main() {
  console.log(`Initializing Knowledge Graph store (in-memory)`);
  const store = new InMemoryGraphStore();

  console.log(`Starting Knowledge Graph service on port ${port}`);
  await startServer(store, port);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
