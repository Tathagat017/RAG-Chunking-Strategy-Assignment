import { useState } from "react";
import { Container, Title, Paper, Grid, Box } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import PDFUploader from "./components/PDFUploader";
import ChunkingControls from "./components/ChunkingControls";
import ChunkVisualization from "./components/ChunkVisualization";
import { ChunkingStrategy, ChunkInfo } from "./types";

interface ExtractedText {
  filename: string;
  text: string;
  text_length: number;
}

function App() {
  const [extractedText, setExtractedText] = useState<ExtractedText | null>(
    null
  );
  const [chunks, setChunks] = useState<ChunkInfo[]>([]);
  const [selectedStrategy, setSelectedStrategy] =
    useState<ChunkingStrategy>("fixed");
  const [chunkSize, setChunkSize] = useState(1000);
  const [chunkOverlap, setChunkOverlap] = useState(200);
  const [loading, setLoading] = useState(false);
  const [strategyExplanation, setStrategyExplanation] = useState("");

  const handleTextExtracted = (data: ExtractedText) => {
    setExtractedText(data);
    setChunks([]);
    notifications.show({
      title: "Success",
      message: `Text extracted from ${data.filename}`,
      color: "green",
    });
  };

  const handleChunksGenerated = (data: {
    strategy: ChunkingStrategy;
    chunks: ChunkInfo[];
    total_chunks: number;
    strategy_explanation: string;
  }) => {
    setChunks(data.chunks);
    setStrategyExplanation(data.strategy_explanation);
    notifications.show({
      title: "Chunks Generated",
      message: `Generated ${data.total_chunks} chunks using ${data.strategy} strategy`,
      color: "blue",
    });
  };

  const handleError = (error: string) => {
    notifications.show({
      title: "Error",
      message: error,
      color: "red",
    });
  };

  return (
    <Container size="xl" py="xl">
      <Title order={1} ta="center" mb="xl">
        RAG Chunking Strategy Visualizer
      </Title>

      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper shadow="sm" p="md" radius="md">
            <PDFUploader
              onTextExtracted={handleTextExtracted}
              onError={handleError}
              loading={loading}
              setLoading={setLoading}
            />
          </Paper>

          {extractedText && (
            <Paper shadow="sm" p="md" radius="md" mt="md">
              <ChunkingControls
                text={extractedText.text}
                selectedStrategy={selectedStrategy}
                setSelectedStrategy={setSelectedStrategy}
                chunkSize={chunkSize}
                setChunkSize={setChunkSize}
                chunkOverlap={chunkOverlap}
                setChunkOverlap={setChunkOverlap}
                onChunksGenerated={handleChunksGenerated}
                onError={handleError}
                loading={loading}
                setLoading={setLoading}
              />
            </Paper>
          )}
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper shadow="sm" p="md" radius="md" h="100%">
            <ChunkVisualization
              chunks={chunks}
              originalText={extractedText?.text || ""}
              strategyExplanation={strategyExplanation}
              selectedStrategy={selectedStrategy}
            />
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}

export default App;
