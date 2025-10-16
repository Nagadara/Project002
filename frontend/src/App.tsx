// frontend/src/App.tsx

import React, { useCallback, useMemo, useState } from "react";
import EnhancedChatInterface from "./components/EnhancedChatInterface";
import { Message, PDFFile } from "./types";

// API 베이스: .env에 VITE_API_BASE가 있으면 사용, 아니면 상대경로(프록시/동일 오리진)
const API_BASE = import.meta.env.VITE_API_BASE ?? "";
const uploadUrl = `${API_BASE}/api/upload-pdf`.replace(/([^:]\/)\/+/g, "$1");

function App(): React.ReactElement {
  const [messages, setMessages] = useState<Message[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<PDFFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ------ 파일 업로드 처리 (단일 파일 콜백; 여러 번 호출됨) ------
  const handleFileUpload = useCallback(
    async (file: PDFFile) => {
      // 1) 상태에 'uploading'으로 등록
      setUploadedFiles((prev) => [
        ...prev,
        { ...file, uploadProgress: 0, status: "uploading" },
      ]);

      // 2) (선택) 시스템 메시지로 업로드 이벤트 기록
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-sys-upload`,
          type: "system",
          content: "FILE_UPLOADED",
          timestamp: new Date(),
        },
      ]);

      // 3) 업로드 요청 전송 (개별 파일 요청)
      try {
        const form = new FormData();
        form.append("file", file.file);

        const res = await fetch(`${API_BASE}/api/upload-pdf`, {
          method: "POST",
          body: form,
        });
        console.log("UPLOAD URL =>", uploadUrl);
        

        if (!res.ok) {
          // 에러 바디 파싱 시도
          let errMsg = "파일 업로드 실패";
          try {
            const errJson = await res.json();
            errMsg = errJson.error || errMsg;
          } catch {
            /* noop */
          }
          // 상태: error
          setUploadedFiles((prev) => {
            // 동일 파일(이름+크기+업로드 중) 찾기
            const idx = [...prev]
              .reverse()
              .findIndex(
                (f) =>
                  f.name === file.name &&
                  f.size === file.size &&
                  f.status === "uploading"
              );
            if (idx === -1) return prev;
            const realIdx = prev.length - 1 - idx;
            const next = [...prev];
            next[realIdx] = {
              ...next[realIdx],
              status: "error",
              uploadProgress: 0,
            } as PDFFile;
            return next;
          });
          throw new Error(errMsg);
        }

        // 성공: ready로 전환
        setUploadedFiles((prev) => {
          const idx = [...prev]
            .reverse()
            .findIndex(
              (f) =>
                f.name === file.name &&
                f.size === file.size &&
                f.status === "uploading"
            );
          if (idx === -1) return prev;
          const realIdx = prev.length - 1 - idx;
          const next = [...prev];
          next[realIdx] = {
            ...next[realIdx],
            status: "ready",
            uploadProgress: 100,
          } as PDFFile;
          return next;
        });
      } catch (e) {
        // (선택) 에러 토스트/메시지 처리 가능
        // 콘솔만 남겨둠
        console.error(e);
      }
    },
    [setUploadedFiles, setMessages]
  );

  // ------ 파일 제거(옵션; 현재 UI에선 보이지 않지만 시그니처 유지) ------
  const handleRemoveFile = useCallback(() => {
    setUploadedFiles([]);
  }, []);

  // ------ 메시지 전송 ------
  const handleSendMessage = useCallback(
    async (text: string) => {
      const userMsg: Message = {
        id: `${Date.now()}-user`,
        type: "user",
        content: text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const res = await fetch(`${API_BASE}/api/rag-chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: text }),
        });

        if (!res.ok) {
          const fallback: Message = {
            id: `${Date.now()}-assistant-error`,
            type: "assistant",
            content:
              "죄송해요. 답변을 가져오는 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, fallback]);
          return;
        }

        const data = await res.json();
        const answerText: string =
          data.answer ??
          data.text ??
          "응답 형식을 인식하지 못했어요. 백엔드를 확인해 주세요.";

        const botMsg: Message = {
          id: `${Date.now()}-assistant`,
          type: "assistant",
          content: answerText,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      } catch (err) {
        console.error(err);
        const fallback: Message = {
          id: `${Date.now()}-assistant-error2`,
          type: "assistant",
          content:
            "네트워크 오류가 발생했어요. 인터넷 연결이나 서버 상태를 확인해 주세요.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, fallback]);
      } finally {
        setIsLoading(false);
      }
    },
    [setMessages, setIsLoading]
  );

  // 최근 파일(선택적 용도)
  const latestFile = useMemo(
    () => (uploadedFiles.length ? uploadedFiles[uploadedFiles.length - 1] : undefined),
    [uploadedFiles]
  );

  return (
    <div className="h-screen w-full flex flex-col">
      {/* 헤더 (원하면 프로젝트 타이틀/로고 등 배치) */}
      <header className="px-4 py-3 border-b border-gray-200">
        <h1 className="text-lg font-semibold">PDF RAG Chat (Multi-Upload)</h1>
        <p className="text-xs text-gray-500">
          여러 PDF를 업로드해도 누적되어 검색됩니다.
        </p>
      </header>

      {/* 메인: 채팅 인터페이스 */}
      <main className="flex-1">
        <EnhancedChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          uploadedFiles={uploadedFiles}
          onFileUpload={handleFileUpload}
          onRemoveFile={handleRemoveFile}
        />
      </main>

      {/* 푸터(선택) */}
      <footer className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100">
        API: <code>{API_BASE || "(same-origin)"}</code>
        {latestFile ? (
          <span className="ml-2">
            • 최근 업로드: <b>{latestFile.name}</b> ({(latestFile.size / (1024 * 1024)).toFixed(1)}
            MB)
          </span>
        ) : null}
      </footer>
    </div>
  );
}

export default App;
