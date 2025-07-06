export type ChunkingStrategy = "fixed" | "recursive" | "document" | "semantic";

export interface ChunkInfo {
  id: number;
  content: string;
  start_index: number;
  end_index: number;
  size: number;
  overlap_with_previous: number;
  metadata: Record<string, any>;
}

export interface StrategyInfo {
  name: string;
  description: string;
  advantages: string[];
  disadvantages: string[];
  use_cases: string[];
}

export interface ChunkingRequest {
  text: string;
  strategy: ChunkingStrategy;
  chunk_size: number;
  chunk_overlap: number;
}

export interface ChunkingResponse {
  strategy: ChunkingStrategy;
  chunks: ChunkInfo[];
  total_chunks: number;
  strategy_explanation: string;
}
