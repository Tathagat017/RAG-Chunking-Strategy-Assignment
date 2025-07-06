import React, { useState, useEffect } from "react";
import {
  Paper,
  Text,
  Select,
  Slider,
  Button,
  Stack,
  Group,
  Accordion,
  List,
  Badge,
  LoadingOverlay,
} from "@mantine/core";
import { IconBrain, IconSettings, IconInfoCircle } from "@tabler/icons-react";
import { getChunkingStrategies, chunkText } from "../api";
import type {
  ChunkingStrategy,
  StrategyInfo,
  ChunkingResponse,
} from "../types";

interface ChunkingControlsProps {
  text: string;
  onChunkingResult: (result: ChunkingResponse) => void;
}

export const ChunkingControls: React.FC<ChunkingControlsProps> = ({
  text,
  onChunkingResult,
}) => {
  const [strategy, setStrategy] = useState<ChunkingStrategy>("fixed");
  const [chunkSize, setChunkSize] = useState(500);
  const [chunkOverlap, setChunkOverlap] = useState(50);
  const [strategies, setStrategies] = useState<Record<string, StrategyInfo>>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [loadingStrategies, setLoadingStrategies] = useState(true);

  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const strategiesData = await getChunkingStrategies();
        setStrategies(strategiesData);
      } catch (error) {
        console.error("Failed to fetch strategies:", error);
      } finally {
        setLoadingStrategies(false);
      }
    };

    fetchStrategies();
  }, []);

  const handleChunk = async () => {
    if (!text.trim()) return;

    setLoading(true);
    try {
      const result = await chunkText({
        text,
        strategy,
        chunk_size: chunkSize,
        chunk_overlap: chunkOverlap,
      });
      onChunkingResult(result);
    } catch (error) {
      console.error("Failed to chunk text:", error);
    } finally {
      setLoading(false);
    }
  };

  const strategyOptions = Object.entries(strategies).map(([key, info]) => ({
    value: key,
    label: info.name,
  }));

  const currentStrategy = strategies[strategy];

  return (
    <Paper p="md" withBorder pos="relative">
      <LoadingOverlay visible={loadingStrategies} />

      <Stack>
        <Group>
          <IconSettings size={20} />
          <Text size="lg" fw={500}>
            Chunking Configuration
          </Text>
        </Group>

        <Select
          label="Chunking Strategy"
          value={strategy}
          onChange={(value) => setStrategy(value as ChunkingStrategy)}
          data={strategyOptions}
          disabled={!text.trim()}
        />

        <Group grow>
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              Chunk Size: {chunkSize}
            </Text>
            <Slider
              value={chunkSize}
              onChange={setChunkSize}
              min={100}
              max={2000}
              step={50}
              disabled={!text.trim()}
            />
          </Stack>

          <Stack gap="xs">
            <Text size="sm" fw={500}>
              Chunk Overlap: {chunkOverlap}
            </Text>
            <Slider
              value={chunkOverlap}
              onChange={setChunkOverlap}
              min={0}
              max={Math.min(200, Math.floor(chunkSize * 0.5))}
              step={10}
              disabled={!text.trim()}
            />
          </Stack>
        </Group>

        <Button
          onClick={handleChunk}
          disabled={!text.trim() || loading}
          loading={loading}
          leftSection={<IconBrain size={16} />}
        >
          Apply Chunking Strategy
        </Button>

        {currentStrategy && (
          <Accordion variant="contained">
            <Accordion.Item value="strategy-info">
              <Accordion.Control icon={<IconInfoCircle size={16} />}>
                About {currentStrategy.name}
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="md">
                  <Text size="sm">{currentStrategy.description}</Text>

                  <div>
                    <Text size="sm" fw={500} mb="xs">
                      Advantages:
                    </Text>
                    <List size="sm">
                      {currentStrategy.advantages.map((advantage, index) => (
                        <List.Item key={index}>{advantage}</List.Item>
                      ))}
                    </List>
                  </div>

                  <div>
                    <Text size="sm" fw={500} mb="xs">
                      Disadvantages:
                    </Text>
                    <List size="sm">
                      {currentStrategy.disadvantages.map(
                        (disadvantage, index) => (
                          <List.Item key={index}>{disadvantage}</List.Item>
                        )
                      )}
                    </List>
                  </div>

                  <div>
                    <Text size="sm" fw={500} mb="xs">
                      Best Use Cases:
                    </Text>
                    <Group gap="xs">
                      {currentStrategy.use_cases.map((useCase, index) => (
                        <Badge key={index} variant="light" size="sm">
                          {useCase}
                        </Badge>
                      ))}
                    </Group>
                  </div>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        )}
      </Stack>
    </Paper>
  );
};
