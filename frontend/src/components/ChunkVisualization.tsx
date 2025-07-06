import React, { useState, useMemo } from "react";
import {
  Paper,
  Text,
  Tabs,
  ScrollArea,
  Badge,
  Group,
  Stack,
  Card,
  Table,
  JsonInput,
} from "@mantine/core";
import { IconEye, IconList, IconCode } from "@tabler/icons-react";
import type { ChunkingResponse } from "../types";

interface ChunkVisualizationProps {
  result: ChunkingResponse;
}

export const ChunkVisualization: React.FC<ChunkVisualizationProps> = ({
  result,
}) => {
  const [activeTab, setActiveTab] = useState<string>("visual");
  const [selectedChunk, setSelectedChunk] = useState<number | null>(null);

  const colors = [
    "#ffebee",
    "#e8f5e8",
    "#e3f2fd",
    "#fff3e0",
    "#f3e5f5",
    "#fce4ec",
    "#e0f2f1",
    "#e1f5fe",
    "#fff8e1",
    "#f9fbe7",
  ];

  const highlightedText = useMemo(() => {
    if (!result.chunks.length) return "";

    let highlighted = "";
    let lastIndex = 0;

    result.chunks.forEach((chunk, index) => {
      const color = colors[index % colors.length];
      const isSelected = selectedChunk === index;

      // Add any text before this chunk
      if (chunk.start_index > lastIndex) {
        highlighted += result.chunks[0].content.slice(
          lastIndex,
          chunk.start_index
        );
      }

      // Add the chunk with highlighting
      highlighted += `<span 
        style="background-color: ${color}; 
               padding: 2px 4px; 
               border-radius: 4px; 
               cursor: pointer;
               border: ${
                 isSelected ? "2px solid #228be6" : "1px solid transparent"
               };
               display: inline-block;
               margin: 1px;"
        data-chunk-id="${index}"
        title="Chunk ${index + 1} (${chunk.size} chars)"
      >${chunk.content}</span>`;

      lastIndex = chunk.end_index;
    });

    return highlighted;
  }, [result.chunks, selectedChunk]);

  const handleChunkClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const chunkId = target.getAttribute("data-chunk-id");
    if (chunkId !== null) {
      const id = parseInt(chunkId);
      setSelectedChunk(selectedChunk === id ? null : id);
    }
  };

  return (
    <Paper p="md" withBorder>
      <Stack>
        <Group justify="space-between">
          <Text size="lg" fw={500}>
            Chunking Results
          </Text>
          <Group>
            <Badge variant="light">{result.total_chunks} chunks</Badge>
            <Badge variant="light">{result.strategy}</Badge>
          </Group>
        </Group>

        <Text size="sm" c="dimmed">
          {result.strategy_explanation}
        </Text>

        <Tabs
          value={activeTab}
          onChange={(value) => setActiveTab(value || "visual")}
        >
          <Tabs.List>
            <Tabs.Tab value="visual" leftSection={<IconEye size={16} />}>
              Visual
            </Tabs.Tab>
            <Tabs.Tab value="details" leftSection={<IconList size={16} />}>
              Details
            </Tabs.Tab>
            <Tabs.Tab value="metadata" leftSection={<IconCode size={16} />}>
              Metadata
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="visual" pt="md">
            <Stack>
              <Text size="sm" c="dimmed">
                Click on chunks to highlight them. Each chunk is color-coded for
                easy identification.
              </Text>
              <ScrollArea h={400}>
                <div
                  dangerouslySetInnerHTML={{ __html: highlightedText }}
                  onClick={handleChunkClick}
                  style={{ lineHeight: 1.6, fontSize: "14px" }}
                />
              </ScrollArea>
              {selectedChunk !== null && (
                <Card withBorder>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>
                      Chunk {selectedChunk + 1} Details
                    </Text>
                    <Group>
                      <Text size="xs">
                        Size: {result.chunks[selectedChunk].size} chars
                      </Text>
                      <Text size="xs">
                        Start: {result.chunks[selectedChunk].start_index}
                      </Text>
                      <Text size="xs">
                        End: {result.chunks[selectedChunk].end_index}
                      </Text>
                      <Text size="xs">
                        Overlap:{" "}
                        {result.chunks[selectedChunk].overlap_with_previous}
                      </Text>
                    </Group>
                  </Stack>
                </Card>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="details" pt="md">
            <ScrollArea h={400}>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Chunk</Table.Th>
                    <Table.Th>Size</Table.Th>
                    <Table.Th>Start</Table.Th>
                    <Table.Th>End</Table.Th>
                    <Table.Th>Overlap</Table.Th>
                    <Table.Th>Preview</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {result.chunks.map((chunk, index) => (
                    <Table.Tr key={chunk.id}>
                      <Table.Td>
                        <Badge
                          variant="light"
                          style={{
                            backgroundColor: colors[index % colors.length],
                          }}
                        >
                          {index + 1}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{chunk.size}</Table.Td>
                      <Table.Td>{chunk.start_index}</Table.Td>
                      <Table.Td>{chunk.end_index}</Table.Td>
                      <Table.Td>{chunk.overlap_with_previous}</Table.Td>
                      <Table.Td>
                        <Text size="xs" lineClamp={2} style={{ maxWidth: 200 }}>
                          {chunk.content}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="metadata" pt="md">
            <ScrollArea h={400}>
              <Stack>
                {result.chunks.map((chunk, index) => (
                  <Card key={chunk.id} withBorder>
                    <Stack gap="xs">
                      <Group>
                        <Badge
                          variant="light"
                          style={{
                            backgroundColor: colors[index % colors.length],
                          }}
                        >
                          Chunk {index + 1}
                        </Badge>
                      </Group>
                      <JsonInput
                        value={JSON.stringify(chunk.metadata, null, 2)}
                        readOnly
                        autosize
                        minRows={2}
                        maxRows={10}
                      />
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </ScrollArea>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Paper>
  );
};
