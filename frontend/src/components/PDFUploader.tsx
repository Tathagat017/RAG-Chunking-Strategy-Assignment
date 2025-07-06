import { useState } from "react";
import { Group, Text, Button, Box, Progress, Alert } from "@mantine/core";
import { Dropzone, PDF_MIME_TYPE } from "@mantine/dropzone";
import {
  IconUpload,
  IconFile,
  IconX,
  IconAlertCircle,
} from "@tabler/icons-react";
import { uploadPDF } from "../api";

interface PDFUploaderProps {
  onTextExtracted: (data: any) => void;
  onError: (error: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export default function PDFUploader({
  onTextExtracted,
  onError,
  loading,
  setLoading,
}: PDFUploaderProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const result = await uploadPDF(selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        onTextExtracted(result);
        setSelectedFile(null);
        setUploadProgress(0);
        setLoading(false);
      }, 500);
    } catch (error: any) {
      setLoading(false);
      setUploadProgress(0);
      onError(error.response?.data?.detail || "Failed to upload PDF");
    }
  };

  return (
    <Box>
      <Text size="lg" fw={600} mb="md">
        Upload PDF Document
      </Text>

      <Dropzone
        onDrop={handleFileSelect}
        onReject={() => onError("Please select a valid PDF file")}
        maxSize={10 * 1024 ** 2} // 10MB
        accept={PDF_MIME_TYPE}
        disabled={loading}
        mb="md"
      >
        <Group
          justify="center"
          gap="xl"
          mih={220}
          style={{ pointerEvents: "none" }}
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
              Upload a PDF document to extract text for chunking analysis
            </Text>
          </div>
        </Group>
      </Dropzone>

      {selectedFile && (
        <Alert icon={<IconAlertCircle size={16} />} mb="md">
          <Text size="sm">
            Selected: <strong>{selectedFile.name}</strong> (
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </Text>
        </Alert>
      )}

      {loading && <Progress value={uploadProgress} mb="md" animated />}

      <Button
        onClick={handleUpload}
        disabled={!selectedFile || loading}
        loading={loading}
        fullWidth
      >
        {loading ? "Extracting Text..." : "Extract Text from PDF"}
      </Button>
    </Box>
  );
}
