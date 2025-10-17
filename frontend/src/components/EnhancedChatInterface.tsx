// frontend/src/components/EnhancedChatInterface.tsx

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Send, Loader } from "lucide-react";
import { Message, PDFFile } from "../types";
import { ChatMessage } from "./ChatMessage";
import { CompactPDFUploader } from "./CompactPDFUploader";
import pencilImage from "../assets/pencil.png";

interface EnhancedChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => Promise<void> | void;
  isLoading: boolean;

  // ✅ 다중 파일 업로드 유지
  uploadedFiles: PDFFile[];

  // 업로더에서 단일 파일을 전달 (여러 번 호출됨)
  onFileUpload: (file: PDFFile) => void;

  // 선택: 파일 제거 (현 UI에선 숨겨져 있어도 시그니처 유지)
  onRemoveFile: () => void;
}

export const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  uploadedFiles,
  onFileUpload,
  onRemoveFile,
}) => {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 여러 파일 중 하나라도 준비되었는지
  const anyReady = useMemo(
    () => uploadedFiles.some((f) => f.status === "ready"),
    [uploadedFiles]
  );

  // 최근 업로드 파일 (system 메시지에서 필요하면 사용)
  const latestFile = useMemo(
    () => (uploadedFiles.length ? uploadedFiles[uploadedFiles.length - 1] : undefined),
    [uploadedFiles]
  );

  const canSendMessage = Boolean(inputValue.trim()) && !isLoading && anyReady;

  const placeholder = useMemo(() => {
    if (uploadedFiles.length === 0) {
      return "요약을 원하시는 PDF 파일을 업로드 해주세요. ( ᵕ·̮ᵕ )";
    }
    if (!anyReady) {
      return "문서 처리 중입니다...";
    }
    return "메시지를 입력하세요... (Shift+Enter 줄바꿈, Enter 전송)";
  }, [uploadedFiles.length, anyReady]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!canSendMessage) return;

      const text = inputValue.trim();
      if (!text) return;

      setInputValue("");
      await onSendMessage(text);

      // 포커스 유지
      textareaRef.current?.focus();
    },
    [canSendMessage, inputValue, onSendMessage]
  );

  // Enter 전송 / Shift+Enter 줄바꿈
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 입력창 자동 높이
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [inputValue]);

  return (
    <div
      className="flex flex-col h-full rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
      style={{
        backgroundColor: "#d7f5f5",
        backgroundImage:
          "linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 1px, transparent 1px), linear-gradient(to right, rgba(255, 0, 0, 0.3) 1px, transparent 1px)",
        backgroundSize: "100% 39px, 1px 100%",
        backgroundPosition: "0 0, 121px 0",
        backgroundRepeat: "repeat-y, no-repeat",
      }}
    >
      {/* 상단 스프링 */}
      <div className="h-8 flex justify-center items-center gap-5 px-4" style={{ paddingTop: 11 }}>
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="w-6 h-6 border-2 border-gray-200 rounded-full bg-blue-50" />
        ))}
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0">
        {messages.length === 0 && uploadedFiles.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="bg-white rounded-xl p-4 mt-6 text-center max-w-md">
              <img src={pencilImage} alt="Pencil" className="w-20 h-20 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-800 mb-3">AI PDF 챗봇에 오신 것을 환영합니다!</h3>
              <p className="text-gray-600 leading-relaxed">
                PDF 문서를 업로드하면 AI가 문서 내용을 분석하여
                <br />
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
                uploadedFile={message.type === "system" ? (latestFile ?? undefined) : undefined}
              />
            ))}

            {isLoading && (
              <div className="flex gap-3 mb-6">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-sm">
                  <Loader className="w-4 h-4 text-white animate-spin" />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 입력 영역 */}
      <div className="p-6 border-t border-gray-100">
        <div className="flex gap-3 items-center">
          {/* PDF 업로더 (다중 업로드: 내부 미리보기 미사용) */}
          <div className="w-12 h-12 flex-shrink-0">
            <CompactPDFUploader onFileUpload={onFileUpload} uploadedFile={null} onRemoveFile={onRemoveFile} />
          </div>

          {/* 메시지 입력 */}
          <form onSubmit={handleSubmit} className="flex-1 flex gap-3 items-center">
            <div className="flex-1 relative min-h-[48px] ml-2">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={!anyReady || isLoading}
                className={`w-full resize-none rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  !anyReady ? "bg-gray-50 text-gray-400" : "bg-white"
                }`}
                rows={1}
              />
            </div>
            <button
              type="submit"
              disabled={!canSendMessage}
              className={`p-3 rounded-xl transition-all duration-200 h-12 w-12 flex items-center justify-center flex-shrink-0 ${
                !canSendMessage
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              }`}
              aria-label="전송"
              title="전송"
            >
              {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
        </div>

        {/* 힌트/상태 */}
        {uploadedFiles.length === 0 ? (
          <div className="mt-3 text-xs text-gray-400">여러 PDF를 한 번에 드롭하거나, 업로드 아이콘을 눌러 선택할 수 있어요.</div>
        ) : anyReady ? (
          <div className="mt-3 flex items-center gap-2 text-green-600 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>문서가 준비되었습니다. 질문을 입력해보세요!</span>
          </div>
        ) : (
          <div className="mt-3 text-xs text-gray-400">문서를 처리하고 있어요. 준비되면 자동으로 입력창이 활성화됩니다.</div>
        )}
      </div>
    </div>
  );
};

export default EnhancedChatInterface;
