import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader } from 'lucide-react';
import { Message, PDFFile } from '../types';
import { ChatMessage } from './ChatMessage';
import { CompactPDFUploader } from './CompactPDFUploader';
import pencilImage from '../assets/pencil.png';

interface EnhancedChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  uploadedFile: PDFFile | null;
  onFileUpload: (file: PDFFile) => void;
  onRemoveFile: () => void;
}

export const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading,
  uploadedFile,
  onFileUpload,
  onRemoveFile
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading && uploadedFile?.status === 'ready') {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  const canSendMessage = uploadedFile?.status === 'ready' && !isLoading && inputValue.trim();

  return (
    <div className="flex flex-col h-full bg-[#d7f5f5] rounded-2xl shadow-xl border border-gray-100 overflow-hidden" style={{
      backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 1px, transparent 1px), linear-gradient(to right, rgba(255, 0, 0, 0.3) 1px, transparent 1px)`,
      backgroundSize: `100% 39px, 1px 100%`,
      backgroundPosition: `0 0, 121px 0`,
      backgroundRepeat: `repeat-y, no-repeat`
    }}>
      {/* Spring */}
      <div className="h-8 bg-[#d7f5f5] flex justify-center items-center gap-5 px-4" style={{ paddingTop: '11px' }}>
        {Array.from({ length: 18 }).map((_, i) => (
                        <div key={i} className="w-6 h-6 border-2 border-gray-200 rounded-full bg-blue-50"></div>        ))}
      </div>

      {/* Header */}

      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0">
        {messages.length === 0 && !uploadedFile ? (
          <div className="flex items-center justify-center h-full">
            <div className="bg-white rounded-xl p-4 mt-6 text-center max-w-md">
              <img src={pencilImage} alt="Pencil" className="w-20 h-20 text-gray-800 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-800 mb-3">AI PDF 챗봇에 오신 것을 환영합니다!</h3>
              <p className="text-gray-600 leading-relaxed">
                PDF 문서를 업로드하면 AI가 문서 내용을 분석하여<br />
                궁금한 점에 대해 정확하고 상세한 답변을 제공합니다.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                uploadedFile={message.type === 'system' ? (uploadedFile ?? undefined) : undefined}
              />
            ))}
            {isLoading && (
              <div className="flex gap-3 mb-6">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-sm">
                  <Loader className="w-4 h-4 text-white animate-spin" />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Input Area */}
      <div className="p-6 border-t border-gray-100">
        <div className="flex gap-3 items-center">
          {/* PDF Uploader */}
          <div className="w-12 h-12 flex-shrink-0">
            <CompactPDFUploader 
              onFileUpload={onFileUpload}
              uploadedFile={uploadedFile}
              onRemoveFile={onRemoveFile}
            />
          </div>
          
          {/* Message Input */}
          <form onSubmit={handleSubmit} className="flex-1 flex gap-3 items-center">
            <div className="flex-1 relative min-h-[48px] ml-2">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  !uploadedFile 
                    ? "요약을 원하시는 PDF 파일을 업로드 해주세요. ( ᵕ·̮ᵕ )♩( ᵕ·̮ᵕ )" 
                    : uploadedFile.status !== 'ready'
                    ? "문서 처리 중입니다..."
                    : "메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
                }
                disabled={!uploadedFile || uploadedFile.status !== 'ready' || isLoading}
                className={`w-full resize-none rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  !uploadedFile || uploadedFile.status !== 'ready' 
                    ? 'bg-gray-50 text-gray-400' 
                    : 'bg-white'
                }`}
              />
            </div>
            <button
              type="submit"
              disabled={!canSendMessage}
              className={`p-3 rounded-xl transition-all duration-200 h-12 w-12 flex items-center justify-center flex-shrink-0 ${
                !canSendMessage
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95'
              }`}
            >
              {isLoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
        
        {uploadedFile && uploadedFile.status === 'ready' && (
          <div className="mt-3 flex items-center gap-2 text-green-600 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>문서가 준비되었습니다. 질문을 입력해보세요!</span>
          </div>
        )}
      </div>
    </div>
  );
};