export interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant' | 'system';
  timestamp: Date;
}

export interface PDFFile {
  file: File;
  id: string;
  name: string;
  size: number;
  pages?: number;
  uploadProgress: number;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  url?: string;
}

export interface ConversationHistoryItem {
  id: string;
  title: string;     // ← 여기에 PDF 파일명(=히스토리 제목)
  messages: Message[];
  // uploadedFile 제거!
  // fileName?: string;  // (선택) 제목과 동일한 값을 저장하고 싶다면
}
