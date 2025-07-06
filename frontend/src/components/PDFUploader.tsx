import React, { useState, useCallback } from "react";
import {
  Paper,
  Text,
  Button,
  Progress,
  Alert,
  Group,
  Stack,
} from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import type { FileWithPath } from "@mantine/dropzone";
import { IconUpload, IconFile, IconX } from "@tabler/icons-react";
import { uploadPDF } from "../api";

interface PDFUploaderProps {
  onTextExtracted: (text: string) => void;
}

export const PDFUploader: React.FC<PDFUploaderProps> = ({
  onTextExtracted,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleDrop = useCallback(
    async (files: FileWithPath[]) => {
      const file = files[0];
      if (!file) return;

      setUploading(true);
      setError(null);
      setUploadProgress(0);

      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + 10;
          });
        }, 200);

        const extractedText = await uploadPDF(file);

        clearInterval(progressInterval);
        setUploadProgress(100);

        setTimeout(() => {
          setUploadedFile(file.name);
          onTextExtracted(extractedText);
          setUploading(false);
          setUploadProgress(0);
        }, 500);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to upload PDF");
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [onTextExtracted]
  );

  const handleReset = () => {
    setUploadedFile(null);
    setError(null);
    onTextExtracted("");
  };

  return (
    <Paper p="md" withBorder>
      <Stack>
        <Text size="lg" fw={500}>
          Upload PDF Document
        </Text>

        {error && (
          <Alert color="red" icon={<IconX size={16} />}>
            {error}
          </Alert>
        )}

        {uploadedFile ? (
          <Paper p="md" withBorder style={{ backgroundColor: "#f8f9fa" }}>
            <Group justify="space-between">
              <Group>
                <IconFile size={20} />
                <Text size="sm" fw={500}>
                  {uploadedFile}
                </Text>
              </Group>
              <Button size="xs" variant="light" onClick={handleReset}>
                Upload New File
              </Button>
            </Group>
          </Paper>
        ) : (
          <Dropzone
            onDrop={handleDrop}
            accept={["application/pdf"]}
            maxSize={10 * 1024 * 1024} // 10MB
            disabled={uploading}
          >
            <Group
              justify="center"
              gap="xl"
              style={{ minHeight: 120, pointerEvents: "none" }}
            >
              <Dropzone.Accept>
                <IconUpload size={50} stroke={1.5} />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <IconX size={50} stroke={1.5} />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <IconFile size={50} stroke={1.5} />
              </Dropzone.Idle>

              <div>
                <Text size="xl" inline>
                  Drag PDF here or click to select
                </Text>
                <Text size="sm" c="dimmed" inline mt={7}>
                  Maximum file size: 10MB
                </Text>
              </div>
            </Group>
          </Dropzone>
        )}

        {uploading && (
          <Stack gap="xs">
            <Text size="sm">Uploading and extracting text...</Text>
            <Progress value={uploadProgress} animated />
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};
