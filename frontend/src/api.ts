import axios from "axios";
import { ChunkingRequest, ChunkingResponse, StrategyInfo } from "./types";

const API_BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const uploadPDF = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/upload-pdf", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const chunkText = async (
  request: ChunkingRequest
): Promise<ChunkingResponse> => {
  const response = await api.post("/chunk-text", request);
  return response.data;
};

export const getChunkingStrategies = async (): Promise<
  Record<string, StrategyInfo>
> => {
  const response = await api.get("/chunking-strategies");
  return response.data;
};
