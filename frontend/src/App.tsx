import React, { useState } from "react";
import { Container, Title, Text, Stack, Grid } from "@mantine/core";
import { PDFUploader } from "./components/PDFUploader";
import { ChunkingControls } from "./components/ChunkingControls";
import { ChunkVisualization } from "./components/ChunkVisualization";
import type { ChunkingResponse } from "./types";

function App() {
  const [extractedText, setExtractedText] = useState<string>("");
  const [chunkingResult, setChunkingResult] = useState<ChunkingResponse | null>(
    null
  );

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="sm">
            RAG Chunking Strategy Visualizer
          </Title>
          <Text c="dimmed" size="lg">
            Upload a PDF document and experiment with different chunking
            strategies to understand how they affect text segmentation for RAG
            applications.
          </Text>
        </div>

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="md">
              <PDFUploader onTextExtracted={setExtractedText} />
              <ChunkingControls
                text={extractedText}
                onChunkingResult={setChunkingResult}
              />
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            {chunkingResult && <ChunkVisualization result={chunkingResult} />}
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}

export default App;
