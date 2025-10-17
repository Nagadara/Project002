// frontend/src/App.tsx

import React, { useCallback, useMemo, useState } from "react";
import EnhancedChatInterface from "./components/EnhancedChatInterface";
import { Message, PDFFile } from "./types";
import pencilImage from './assets/pencil.png';
import { Zap, Shield, Clock } from 'lucide-react';
import { Routes, Route} from 'react-router-dom';
import HistoryPage from "./components/HistoryPage";
import ChatComponent from './components/ChatComponent';

// API 베이스: .env에 VITE_API_BASE가 있으면 사용, 아니면 상대경로(프록시/동일 오리진)
const API_BASE = import.meta.env.VITE_API_BASE ?? "";
const uploadUrl = `${API_BASE}/api/upload-pdf`.replace(/([^:]\/)\/+/g, "$1");

function App(): React.ReactElement {
  const [messages, setMessages] = useState<Message[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<PDFFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistorySidebar, setShowHistorySidebar] = useState(false); // ✅ 사이드바 상태 추가

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

  const toggleHistorySidebar = () => {
    setShowHistorySidebar(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-blue-50 relative overflow-hidden">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <header className="text-center mb-8 relative">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div>
              <img src={pencilImage} alt="Pencil" className="w-16 h-16 text-white" />
            </div>
            <div className="text-center">
              <h1 className="font-bold text-black" style={{ fontFamily: 'NanumSinHonBuBu', fontSize: '38px' }}>
                니 필기 내꺼 ㅋ
              </h1>
              <p className="text-gray-600 font-bold" style={{ fontFamily: 'NanumSinHonBuBu', fontSize: '21px' }}>
                나의 비밀 요약 친구
              </p>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm">
              <Zap className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800 text-sm">빠른 분석</h3>
              <p className="text-xs text-gray-600">대용량 PDF도 빠르게 처리</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm">
              <Shield className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800 text-sm">안전한 처리</h3>
              <p className="text-xs text-gray-600">문서 보안 및 개인정보 보호</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm">
              <Clock className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800 text-sm">실시간 대화</h3>
              <p className="text-xs text-gray-600">즉시 질문하고 답변 받기</p>
            </div>
          </div>

          {/* History 버튼 */}
          <button 
            onClick={toggleHistorySidebar} 
            className="absolute top-6 left-[clamp(12px,10vw,200px)] text-black font-bold" 
            style={{ fontFamily: 'NanumSinHonBuBu', fontSize: '21px', letterSpacing: '0.063em' }}
          >
            대화기록
          </button>
        </header>

        {/* Main Content Area for Routing */}
        <Routes>
          <Route path="/" element={
            <>
              <div className="max-w-4xl mx-auto">
                <div className="h-[600px] lg:h-[700px]">
                  <EnhancedChatInterface
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    uploadedFiles={uploadedFiles}
                    onFileUpload={handleFileUpload}
                    onRemoveFile={handleRemoveFile}
                  />
                </div>
              </div>

              <footer className="text-center mt-8 text-gray-500 text-sm">
                <p>🤖 AI 기반 PDF 분석 시스템 • 안전하고 빠른 문서 처리 • 24/7 서비스 제공</p>
              </footer>
            </>
          } />
          <Route path="/chat" element={<ChatComponent />} />
        </Routes>
      </div>

      {/* History Sidebar */}
      <div className={`fixed top-0 left-0 h-full
                 w-[min(90vw,480px)]
                 bg-white transform transition-transform duration-300
                 ${showHistorySidebar ? 'translate-x-0 shadow-2xl' : '-translate-x-[calc(100%+12px)] shadow-none' }
                 overflow-hidden`}>
        <HistoryPage onClose={toggleHistorySidebar} />
      </div>
    </div>
  );
}

export default App;
