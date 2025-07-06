import { useState, useEffect } from "react";
import {
  Box,
  Text,
  Select,
  NumberInput,
  Button,
  Stack,
  Textarea,
  Badge,
  Alert,
  Group,
  Collapse,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconInfoCircle,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { chunkText, getChunkingStrategies } from "../api";
import { ChunkingStrategy, StrategyInfo } from "../types";

interface ChunkingControlsProps {
  text: string;
  selectedStrategy: ChunkingStrategy;
  setSelectedStrategy: (strategy: ChunkingStrategy) => void;
  chunkSize: number;
  setChunkSize: (size: number) => void;
  chunkOverlap: number;
  setChunkOverlap: (overlap: number) => void;
  onChunksGenerated: (data: any) => void;
  onError: (error: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export default function ChunkingControls({
  text,
  selectedStrategy,
  setSelectedStrategy,
  chunkSize,
  setChunkSize,
  chunkOverlap,
  setChunkOverlap,
  onChunksGenerated,
  onError,
  loading,
  setLoading,
}: ChunkingControlsProps) {
  const [strategies, setStrategies] = useState<Record<string, StrategyInfo>>(
    {}
  );
  const [opened, { toggle }] = useDisclosure(false);

  useEffect(() => {
    const loadStrategies = async () => {
      try {
        const strategiesData = await getChunkingStrategies();
        setStrategies(strategiesData);
      } catch (error) {
        onError("Failed to load chunking strategies");
      }
    };
    loadStrategies();
  }, [onError]);

  const handleChunk = async () => {
    setLoading(true);

    try {
      const result = await chunkText({
        text,
        strategy: selectedStrategy,
        chunk_size: chunkSize,
        chunk_overlap: chunkOverlap,
      });

      onChunksGenerated(result);
    } catch (error: any) {
      onError(error.response?.data?.detail || "Failed to chunk text");
    } finally {
      setLoading(false);
    }
  };

  const strategyOptions = Object.entries(strategies).map(([key, strategy]) => ({
    value: key,
    label: strategy.name,
  }));

  const currentStrategy = strategies[selectedStrategy];

  return (
    <Box>
      <Text size="lg" fw={600} mb="md">
        Chunking Configuration
      </Text>

      <Stack gap="md">
        <Select
          label="Chunking Strategy"
          description="Select the chunking strategy to apply"
          data={strategyOptions}
          value={selectedStrategy}
          onChange={(value) => setSelectedStrategy(value as ChunkingStrategy)}
          disabled={loading}
        />

        <Group grow>
          <NumberInput
            label="Chunk Size"
            description="Target size for each chunk (characters)"
            value={chunkSize}
            onChange={(value) => setChunkSize(Number(value))}
            min={100}
            max={5000}
            step={100}
            disabled={loading}
          />

          <NumberInput
            label="Chunk Overlap"
            description="Overlap between chunks (characters)"
            value={chunkOverlap}
            onChange={(value) => setChunkOverlap(Number(value))}
            min={0}
            max={1000}
            step={50}
            disabled={loading}
          />
        </Group>

        {currentStrategy && (
          <Alert icon={<IconInfoCircle size={16} />} variant="light">
            <Group justify="space-between" align="center">
              <Text size="sm" fw={500}>
                {currentStrategy.name}
              </Text>
              <Button
                variant="subtle"
                size="xs"
                onClick={toggle}
                rightSection={
                  opened ? (
                    <IconChevronUp size={14} />
                  ) : (
                    <IconChevronDown size={14} />
                  )
                }
              >
                {opened ? "Hide" : "Show"} Details
              </Button>
            </Group>

            <Collapse in={opened} mt="sm">
              <Text size="sm" mb="sm">
                {currentStrategy.description}
              </Text>

              <Text size="xs" fw={500} c="green" mb="xs">
                Advantages:
              </Text>
              <Stack gap="xs" mb="sm">
                {currentStrategy.advantages.map((advantage, index) => (
                  <Badge key={index} variant="light" color="green" size="sm">
                    {advantage}
                  </Badge>
                ))}
              </Stack>

              <Text size="xs" fw={500} c="orange" mb="xs">
                Disadvantages:
              </Text>
              <Stack gap="xs" mb="sm">
                {currentStrategy.disadvantages.map((disadvantage, index) => (
                  <Badge key={index} variant="light" color="orange" size="sm">
                    {disadvantage}
                  </Badge>
                ))}
              </Stack>

              <Text size="xs" fw={500} c="blue" mb="xs">
                Use Cases:
              </Text>
              <Stack gap="xs">
                {currentStrategy.use_cases.map((useCase, index) => (
                  <Badge key={index} variant="light" color="blue" size="sm">
                    {useCase}
                  </Badge>
                ))}
              </Stack>
            </Collapse>
          </Alert>
        )}

        <Textarea
          label="Text Preview"
          description={`Document contains ${text.length} characters`}
          value={text.substring(0, 500) + (text.length > 500 ? "..." : "")}
          readOnly
          autosize
          minRows={3}
          maxRows={6}
        />

        <Button
          onClick={handleChunk}
          disabled={!text || loading}
          loading={loading}
          fullWidth
        >
          {loading ? "Generating Chunks..." : "Generate Chunks"}
        </Button>
      </Stack>
    </Box>
  );
}
