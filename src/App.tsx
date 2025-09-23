// src/App.tsx

import { useState, useEffect } from 'react';
import { EnhancedChatInterface } from './components/EnhancedChatInterface';
import { Message, PDFFile } from './types';
import pencilImage from './assets/pencil.png';
import { Zap, Shield, Clock } from 'lucide-react';
import { Routes, Route, Link } from 'react-router-dom';
import AboutPage from './components/AboutPage';
import ChatComponent from './components/ChatComponent';

interface ApiResponse {
  answer: string;
}

function App() {
  const [uploadedFile, setUploadedFile] = useState<PDFFile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 🔄 기존 진행률/상태 시뮬레이션 로직은 유지
  useEffect(() => {
    if (uploadedFile && uploadedFile.status === 'uploading') {
      const timer = setInterval(() => {
        setUploadedFile(prev => {
          if (!prev) return null;
          
          const newProgress = Math.min(prev.uploadProgress + Math.random() * 15, 100);
          
          if (newProgress >= 100) {
            clearInterval(timer);
            // 업로드 완료 후 처리 단계로 전환(시뮬레이션)
            setTimeout(() => {
              setUploadedFile(prev => prev ? { ...prev, status: 'processing', uploadProgress: 0 } : null);
              
              // 처리 완료까지 시뮬레이션
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

  // ✅ 수정 포인트: 실제 백엔드로 업로드 호출 추가
  const handleFileUpload = async (file: PDFFile) => {
    setUploadedFile(file);
    
    // UI에 파일 업로드 시스템 메시지 추가(기존 유지)
    const uploadMessage: Message = {
      id: Date.now().toString(),
      content: 'FILE_UPLOADED',
      type: 'system',
      timestamp: new Date()
    };
    setMessages([uploadMessage]);

    // 실제 업로드 호출 (백엔드 블루프린트 prefix '/api')
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

      // 성공 시: (시뮬레이터가 이미 상태 전환을 수행하므로 여기서는 로깅만)
      // 필요하면 즉시 'processing'으로 전환하고 싶다면 아래 주석 해제 가능
      // setUploadedFile(prev => prev ? { ...prev, status: 'processing' } : prev);

    } catch (e) {
      console.error('PDF 업로드 오류:', e);
      // 실패 시 상태를 error로 표시
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
      // ✅ 백엔드 라우트는 /api/rag-chat
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

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <Link to="/about" className="text-blue-600 hover:underline">About</Link>
            <div className="flex items-center gap-4 mx-auto">
              <div>
                <img src={pencilImage} alt="Pencil" className="w-16 h-16 text-white" />
              </div>
              <div className="text-center">
                <h1 className="font-bold text-black" style={{ fontFamily: 'NanumSinHonBuBu', fontSize: '38px' }}>
                  니 필기 내꺼 ㅋ
                </h1>
                <p className="text-gray-600 font-bold" style={{ fontFamily: 'NanumSinHonBuBu', fontSize: '21px' }}>나의 비밀 요약 친구</p>
              </div>
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
        </header>

        {/* Main Content Area for Routing */}
        <Routes>
          <Route path="/" element={
            <>
              {/* Main Chat Interface */}
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

              {/* Footer */}
              <footer className="text-center mt-8 text-gray-500 text-sm">
                <p>🤖 AI 기반 PDF 분석 시스템 • 안전하고 빠른 문서 처리 • 24/7 서비스 제공</p>
              </footer>
            </>
          } />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/chat" element={<ChatComponent />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
