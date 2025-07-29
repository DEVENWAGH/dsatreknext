import { useState } from 'react';

export function useUploadFile({
  onUploadComplete,
  onUploadError,
  onUploadProgress,
} = {}) {
  const [uploadedFile, setUploadedFile] = useState();
  const [uploadingFile, setUploadingFile] = useState();
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  async function uploadFile(file) {
    setIsUploading(true);
    setUploadingFile(file);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();

      const uploadedFile = {
        key: `community/${Date.now()}-${file.name}`,
        url: result.url,
        name: file.name,
        size: file.size,
        type: file.type,
      };

      setUploadedFile(uploadedFile);
      onUploadComplete?.(uploadedFile);

      return uploadedFile;
    } catch (error) {
      onUploadError?.(error);
      throw error;
    } finally {
      setProgress(0);
      setIsUploading(false);
      setUploadingFile(undefined);
    }
  }

  return {
    isUploading,
    progress,
    uploadFile,
    uploadedFile,
    uploadingFile,
  };
}
