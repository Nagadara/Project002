import React from 'react';
import { User, Bot, FileText, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import { Message, PDFFile } from '../types';

interface ChatMessageProps {
  message: Message;
  uploadedFile?: PDFFile; 
}

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, uploadedFile }) => {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';
  
  if (isSystem && message.content === 'FILE_UPLOADED' && uploadedFile) {
    return (
      <div className="flex justify-center mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 max-w-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 text-sm truncate">{uploadedFile.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(uploadedFile.size)}</p>
              <div className="flex items-center gap-2 mt-1">
                {uploadedFile.status === 'ready' && (
                  <>
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">업로드 완료</span>
                  </>
                )}
                {(uploadedFile.status === 'uploading' || uploadedFile.status === 'processing') && (
                  <>
                    <Loader className="w-3 h-3 animate-spin text-blue-500" />
                    <span className="text-xs text-blue-600">
                      {uploadedFile.status === 'uploading' ? '업로드 중...' : '처리 중...'}
                    </span>
                  </>
                )}
                {uploadedFile.status === 'error' && (
                  <>
                    <AlertCircle className="w-3 h-3 text-red-500" />
                    <span className="text-xs text-red-600">오류 발생</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {(uploadedFile.status === 'uploading' || uploadedFile.status === 'processing') && (
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadedFile.uploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex gap-3 mb-6 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
        isUser 
          ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
          : 'bg-gradient-to-br from-purple-500 to-pink-500'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>
      
      <div className={`max-w-[75%] ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block p-4 rounded-2xl shadow-sm ${
          isUser 
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md' 
            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-md'
        }`}>
          <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</p>
        </div>
        <p className={`text-xs text-gray-500 mt-2 ${isUser ? 'text-right' : ''}`}>
          {message.timestamp.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>
    </div>
  );
};