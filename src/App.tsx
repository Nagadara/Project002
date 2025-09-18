import React, { useState, useEffect } from 'react';
import { EnhancedChatInterface } from './components/EnhancedChatInterface';
import { Message, PDFFile } from './types';
import pencilImage from './assets/pencil.png';
import { Zap, Shield, Clock } from 'lucide-react';
import { Routes, Route, Link } from 'react-router-dom';
import AboutPage from './components/AboutPage';

function App() {
  const [uploadedFile, setUploadedFile] = useState<PDFFile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 업로드 진행 시뮬레이션
  useEffect(() => {
    if (uploadedFile && uploadedFile.status === 'uploading') {
      const timer = setInterval(() => {
        setUploadedFile(prev => {
          if (!prev) return null;
          
          const newProgress = Math.min(prev.uploadProgress + Math.random() * 15, 100);
          
          if (newProgress >= 100) {
            clearInterval(timer);
            // 업로드 완료 후 처리 단계로 전환
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

  const handleFileUpload = (file: PDFFile) => {
    setUploadedFile(file);
    
    // 파일 업로드 메시지 추가
    const uploadMessage: Message = {
      id: Date.now().toString(),
      content: 'FILE_UPLOADED',
      type: 'system',
      timestamp: new Date()
    };
    setMessages([uploadMessage]);
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
    
    // AI 응답 시뮬레이션
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `PDF 문서 "${uploadedFile?.name}"에 대한 질문을 받았습니다: "${content}"\n\n죄송하지만, 현재는 실제 AI 분석 기능이 연결되어 있지 않습니다. 이 인터페이스는 UI 데모 버전입니다.\n\n실제 구현을 위해서는 다음과 같은 백엔드 서비스가 필요합니다:\n- PDF 텍스트 추출\n- 벡터 데이터베이스\n- LLM API 연동 (OpenAI, Claude 등)`,
        type: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500 + Math.random() * 1000);
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
              <footer className="text-center mt-8 text-gray-500 text-sm">\n                <p>🤖 AI 기반 PDF 분석 시스템 • 안전하고 빠른 문서 처리 • 24/7 서비스 제공</p>\n              </footer>
            </>
          } />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;