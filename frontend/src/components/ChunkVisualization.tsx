import { useState } from "react";
import {
  Box,
  Text,
  ScrollArea,
  Stack,
  Card,
  Badge,
  Group,
  Divider,
  Button,
  Alert,
  Tabs,
  Code,
  Paper,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { IconInfoCircle, IconCopy, IconCheck } from "@tabler/icons-react";
import { useClipboard } from "@mantine/hooks";
import { ChunkInfo, ChunkingStrategy } from "../types";

interface ChunkVisualizationProps {
  chunks: ChunkInfo[];
  originalText: string;
  strategyExplanation: string;
  selectedStrategy: ChunkingStrategy;
}

export default function ChunkVisualization({
  chunks,
  originalText,
  strategyExplanation,
  selectedStrategy,
}: ChunkVisualizationProps) {
  const [selectedChunk, setSelectedChunk] = useState<number | null>(null);
  const clipboard = useClipboard({ timeout: 2000 });

  const getChunkColor = (index: number) => {
    const colors = [
      "blue",
      "green",
      "orange",
      "purple",
      "red",
      "teal",
      "pink",
      "indigo",
    ];
    return colors[index % colors.length];
  };

  const highlightText = (text: string, chunks: ChunkInfo[]) => {
    if (!chunks.length) return text;

    const parts = [];
    let lastIndex = 0;

    chunks.forEach((chunk, index) => {
      // Add text before chunk
      if (chunk.start_index > lastIndex) {
        parts.push(
          <span key={`before-${index}`}>
            {text.substring(lastIndex, chunk.start_index)}
          </span>
        );
      }

      // Add highlighted chunk
      parts.push(
        <span
          key={`chunk-${index}`}
          style={{
            backgroundColor: `var(--mantine-color-${getChunkColor(index)}-1)`,
            border:
              selectedChunk === index
                ? `2px solid var(--mantine-color-${getChunkColor(index)}-6)`
                : "none",
            padding: "2px 4px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={() =>
            setSelectedChunk(selectedChunk === index ? null : index)
          }
        >
          {text.substring(chunk.start_index, chunk.end_index)}
        </span>
      );

      lastIndex = chunk.end_index;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(<span key="after">{text.substring(lastIndex)}</span>);
    }

    return parts;
  };

  if (!chunks.length && !originalText) {
    return (
      <Box ta="center" py="xl">
        <Text c="dimmed" size="lg">
          Upload a PDF and generate chunks to see the visualization
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Text size="lg" fw={600} mb="md">
        Chunk Visualization
      </Text>

      {strategyExplanation && (
        <Alert icon={<IconInfoCircle size={16} />} mb="md" variant="light">
          <Text size="sm">{strategyExplanation}</Text>
        </Alert>
      )}

      {chunks.length > 0 && (
        <Group mb="md">
          <Badge variant="light" size="lg">
            {chunks.length} chunks generated
          </Badge>
          <Badge variant="light" size="lg">
            Strategy: {selectedStrategy}
          </Badge>
        </Group>
      )}

      <Tabs defaultValue="visual" mb="md">
        <Tabs.List>
          <Tabs.Tab value="visual">Visual Highlighting</Tabs.Tab>
          <Tabs.Tab value="chunks">Chunk Details</Tabs.Tab>
          <Tabs.Tab value="metadata">Metadata</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="visual" pt="md">
          {originalText && (
            <Paper p="md" style={{ maxHeight: "600px", overflow: "auto" }}>
              <Text
                size="sm"
                style={{ lineHeight: 1.6, whiteSpace: "pre-wrap" }}
              >
                {highlightText(originalText, chunks)}
              </Text>
            </Paper>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="chunks" pt="md">
          <ScrollArea style={{ height: "600px" }}>
            <Stack gap="md">
              {chunks.map((chunk, index) => (
                <Card
                  key={chunk.id}
                  shadow="sm"
                  p="md"
                  radius="md"
                  withBorder
                  style={{
                    borderLeft: `4px solid var(--mantine-color-${getChunkColor(
                      index
                    )}-6)`,
                    backgroundColor:
                      selectedChunk === index
                        ? `var(--mantine-color-${getChunkColor(index)}-0)`
                        : undefined,
                  }}
                >
                  <Group justify="space-between" mb="sm">
                    <Group>
                      <Badge color={getChunkColor(index)} variant="light">
                        Chunk {index + 1}
                      </Badge>
                      <Text size="sm" c="dimmed">
                        {chunk.size} characters
                      </Text>
                      {chunk.overlap_with_previous > 0 && (
                        <Badge color="orange" variant="light" size="sm">
                          {chunk.overlap_with_previous} overlap
                        </Badge>
                      )}
                    </Group>
                    <Group>
                      <Tooltip
                        label={clipboard.copied ? "Copied!" : "Copy chunk"}
                      >
                        <ActionIcon
                          variant="subtle"
                          onClick={() => clipboard.copy(chunk.content)}
                        >
                          {clipboard.copied ? (
                            <IconCheck size={16} />
                          ) : (
                            <IconCopy size={16} />
                          )}
                        </ActionIcon>
                      </Tooltip>
                      <Button
                        size="xs"
                        variant="light"
                        onClick={() =>
                          setSelectedChunk(
                            selectedChunk === index ? null : index
                          )
                        }
                      >
                        {selectedChunk === index ? "Deselect" : "Highlight"}
                      </Button>
                    </Group>
                  </Group>

                  <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                    {chunk.content.length > 300
                      ? `${chunk.content.substring(0, 300)}...`
                      : chunk.content}
                  </Text>

                  <Divider my="sm" />

                  <Group gap="xs">
                    <Text size="xs" c="dimmed">
                      Position: {chunk.start_index} - {chunk.end_index}
                    </Text>
                    {Object.keys(chunk.metadata).length > 0 && (
                      <Text size="xs" c="dimmed">
                        • Method: {chunk.metadata.method || "unknown"}
                      </Text>
                    )}
                  </Group>
                </Card>
              ))}
            </Stack>
          </ScrollArea>
        </Tabs.Panel>

        <Tabs.Panel value="metadata" pt="md">
          <ScrollArea style={{ height: "600px" }}>
            <Stack gap="md">
              {chunks.map((chunk, index) => (
                <Card key={chunk.id} shadow="sm" p="md" radius="md" withBorder>
                  <Group justify="space-between" mb="sm">
                    <Badge color={getChunkColor(index)} variant="light">
                      Chunk {index + 1} Metadata
                    </Badge>
                  </Group>

                  <Code block>
                    {JSON.stringify(
                      {
                        id: chunk.id,
                        size: chunk.size,
                        start_index: chunk.start_index,
                        end_index: chunk.end_index,
                        overlap_with_previous: chunk.overlap_with_previous,
                        metadata: chunk.metadata,
                      },
                      null,
                      2
                    )}
                  </Code>
                </Card>
              ))}
            </Stack>
          </ScrollArea>
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
}
