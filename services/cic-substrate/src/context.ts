import { searchHybrid, HybridSearchOptions } from './retrieval';

export interface ContextTaskOptions {
  namespace: string;
  task: string;
  embedding?: number[];
  max_context_tokens?: number;
}

const TYPE_PREFERENCE: Record<string, number> = {
  'SYSTEM': 4,
  'LIVING': 3,
  'STATE': 2,
  'SCRATCH': 1
};

export async function getContextForTask(options: ContextTaskOptions) {
  const { namespace, task, embedding, max_context_tokens = 4000 } = options;

  // 1. Run hybrid search
  const searchResult = await searchHybrid({
    namespace,
    query: task,
    embedding,
    max_results: 50 // Pull extra to allow for greedy packing
  });

  // 2. Sort by fused score and type preference
  // searchHybrid already sorts by fused score.
  // We'll further refine the sort by type preference if scores are close, 
  // but RRF usually dominates. Let's incorporate type preference.
  searchResult.sort((a, b) => {
    // Primary: Type Preference (as required: SYSTEM > LIVING > STATE > SCRATCH)
    // Actually, prompt says: "Greedily pack chunks into a token budget. Prefer types in this order..."
    // Let's sort primarily by fused score, but we can bucket by type or boost.
    // Easiest is to sort by type preference first, then by fused score.
    const typeDiff = (TYPE_PREFERENCE[b.type] || 0) - (TYPE_PREFERENCE[a.type] || 0);
    if (typeDiff !== 0) return typeDiff;
    
    // Secondary: Fused Score
    return b.fused_score - a.fused_score;
  });

  // 3. Greedily pack chunks
  const packedChunks = [];
  let currentTokens = 0;

  for (const chunk of searchResult) {
    // Approximate token count: chars / 4
    const contentToPack = `Title: ${chunk.title}\n${chunk.body}`;
    const estimatedTokens = Math.ceil(contentToPack.length / 4);

    if (currentTokens + estimatedTokens <= max_context_tokens) {
      packedChunks.push(chunk);
      currentTokens += estimatedTokens;
    } else {
      // If one chunk is too big, skip and try next smaller chunk
      continue;
    }
  }

  return {
    chunks: packedChunks,
    token_count: currentTokens
  };
}
