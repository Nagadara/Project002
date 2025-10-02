// src/App.tsx

import { useState, useEffect } from 'react';
import { EnhancedChatInterface } from './components/EnhancedChatInterface';
import { Message, PDFFile } from './types';
import pencilImage from './assets/pencil.png';
import { Zap, Shield, Clock } from 'lucide-react';
import { Routes, Route} from 'react-router-dom';
import HistoryPage from "./components/HistoryPage";
import ChatComponent from './components/ChatComponent';


interface ApiResponse {
  answer: string;
}

function App() {
  const [uploadedFile, setUploadedFile] = useState<PDFFile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistorySidebar, setShowHistorySidebar] = useState(false); // ✅ 사이드바 상태 추가

  // 🔄 기존 업로드 진행률 시뮬레이션 로직 유지
  useEffect(() => {
    if (uploadedFile && uploadedFile.status === 'uploading') {
      const timer = setInterval(() => {
        setUploadedFile(prev => {
          if (!prev) return null;
          const newProgress = Math.min(prev.uploadProgress + Math.random() * 15, 100);

          if (newProgress >= 100) {
            clearInterval(timer);
            setTimeout(() => {
              setUploadedFile(prev => prev ? { ...prev, status: 'processing', uploadProgress: 0 } : null);
              setTimeout(() => {
                setUploadedFile(prev => prev ? { ...prev, status: 'ready', uploadProgress: 100 } : null);
              }, 2000);
            }, 500);
            return { ...prev, uploadProgress: 100 };
          }
          return { ...prev, uploadProgress: newProgress };
        });
      }, 200);

      return () => clearInterval(timer);
    }
  }, [uploadedFile?.status]);

  const handleFileUpload = async (file: PDFFile) => {
    setUploadedFile(file);
    const uploadMessage: Message = {
      id: Date.now().toString(),
      content: 'FILE_UPLOADED',
      type: 'system',
      timestamp: new Date()
    };
    setMessages([uploadMessage]);

    try {
      const formData = new FormData();
      formData.append('file', file.file);

      const resp = await fetch('http://localhost:5000/api/upload-pdf', {
        method: 'POST',
        body: formData
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || '업로드 실패');
      }
    } catch (e) {
      console.error('PDF 업로드 오류:', e);
      setUploadedFile(prev => prev ? { ...prev, status: 'error' } : prev);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setMessages([]);
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      type: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/rag-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: content }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '서버 오류');
      }

      const data: ApiResponse = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.answer,
        type: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessageContent = (error instanceof Error) ? error.message : "답변을 가져오는 중 오류가 발생했습니다.";
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: errorMessageContent,
        type: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

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
                    uploadedFile={uploadedFile}
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
