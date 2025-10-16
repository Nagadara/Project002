// frontend/src/components/EnhancedChatInterface.tsx

import React, { useCallback, useMemo, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Message, PDFFile } from "../types";
import { ChatMessage } from "./ChatMessage";
import { CompactPDFUploader } from "./CompactPDFUploader";

interface EnhancedChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => Promise<void> | void;
  isLoading: boolean;

  // ✅ 다중 파일 업로드 대응
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

  const canSendMessage =
    Boolean(inputValue.trim()) && !isLoading && anyReady;

  const placeholder = useMemo(() => {
    if (uploadedFiles.length === 0) {
      return "요약/검색할 PDF 파일을 업로드해주세요. ( •ᴗ• )";
    }
    if (!anyReady) {
      return "문서를 처리 중입니다… 잠시만요.";
    }
    return "메시지를 입력하세요… (Shift+Enter 줄바꿈, Enter 전송)";
  }, [uploadedFiles.length, anyReady]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!canSendMessage) return;

      const text = inputValue.trim();
      if (!text) return;

      setInputValue("");
      await onSendMessage(text);

      // 모바일/데스크톱 키보드 UX 보정
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

  return (
    <div className="flex flex-col h-full w-full">
      {/* 상단 업로더 영역: 아이콘 버튼 형태 (조용한 UI) */}
      <div className="flex items-center justify-end p-2">
        <CompactPDFUploader
          onFileUpload={onFileUpload}
          uploadedFile={null}      // 컴포넌트 시그니처 유지용 (내부에선 미사용)
          onRemoveFile={onRemoveFile}
        />
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((m) => (
          <ChatMessage
            key={m.id}
            message={m}
            // 필요 시 최신 업로드 정보가 system 메시지에 활용될 수 있음
            uploadedFile={m.type === "system" ? latestFile : undefined}
          />
        ))}
      </div>

      {/* 입력 영역 */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3">
        <div
          className={[
            "flex items-end gap-2 rounded-xl border px-3 py-2 bg-white",
            isLoading ? "opacity-90" : "",
          ].join(" ")}
        >
          <textarea
            ref={textareaRef}
            className="flex-1 resize-none outline-none placeholder-gray-400 text-sm max-h-40"
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading || (!anyReady && uploadedFiles.length > 0)}
          />

          <button
            type="submit"
            className={[
              "inline-flex items-center justify-center rounded-lg h-9 w-9 transition-colors",
              canSendMessage
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-200 text-gray-500 cursor-not-allowed",
            ].join(" ")}
            disabled={!canSendMessage}
            aria-label="Send message"
            title="전송"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* 힌트 영역 (선택) */}
        <div className="mt-2 text-xs text-gray-400">
          {uploadedFiles.length === 0
            ? "여러 PDF를 한 번에 드롭하거나, 업로드 아이콘을 눌러 선택할 수 있어요."
            : anyReady
            ? "문서가 준비되었습니다. 질문을 입력해 보세요."
            : "문서를 처리하고 있어요. 준비되면 자동으로 입력창이 활성화됩니다."}
        </div>
      </form>
    </div>
  );
};

export default EnhancedChatInterface;
