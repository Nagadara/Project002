export interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant' | 'system';
  timestamp: Date;
}

export interface PDFFile {
  file: File;
  name: string;
  size: number;
  pages?: number;
  uploadProgress: number;
  status: 'uploading' | 'processing' | 'ready' | 'error';
}