import React, { useState, useEffect, useCallback } from 'react';
import { EnhancedChatInterface } from './components/EnhancedChatInterface';
import { Message, PDFFile } from './types';

import pencilImage from './assets/pencil.png';
import { Zap, Shield, Clock } from 'lucide-react';
import { Routes, Route, Link } from 'react-router-dom';
import HistoryPage from './components/HistoryPage';

function App() {
  const [uploadedFiles, setUploadedFiles] = useState<PDFFile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistorySidebar, setShowHistorySidebar] = useState(false); // New state for sidebar

  // 업로드 진행 시뮬레이션
  useEffect(() => {
    const uploadingOrProcessingFiles = uploadedFiles.filter(f => f.status === 'uploading' || f.status === 'processing');
    if (uploadingOrProcessingFiles.length > 0) {
      const timer = setInterval(() => {
        setUploadedFiles(prevFiles => {
          return prevFiles.map(file => {
            if (file.status === 'uploading') {
              const newProgress = Math.min(file.uploadProgress + Math.random() * 15, 100);
              if (newProgress >= 100) {
                // 업로드 완료 후 처리 단계로 전환
                setTimeout(() => {
                  setUploadedFiles(currentFiles => currentFiles.map(f => f.id === file.id ? { ...f, status: 'processing', uploadProgress: 0 } : f));
                  // 처리 완료까지 시뮬레이션
                  setTimeout(() => {
                    setUploadedFiles(currentFiles => currentFiles.map(f => f.id === file.id ? { ...f, status: 'ready', uploadProgress: 100 } : f));
                  }, 2000);
                }, 500);
                return { ...file, uploadProgress: 100 };
              }
              return { ...file, uploadProgress: newProgress };
            }
            return file;
          });
        });
      }, 200);

      return () => clearInterval(timer);
    } else if (uploadedFiles.length === 0) {
      // If all files are removed, clear messages that are file-related
      setMessages(prevMessages => prevMessages.filter(msg => msg.content !== 'FILE_UPLOADED'));
    }
  }, [uploadedFiles]); // Depend on the entire array to trigger updates

  const handleFileUpload = useCallback((files: File[]) => {
    const newPdfFiles: PDFFile[] = files.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9), // Unique ID
      file,
      name: file.name,
      size: file.size,
      uploadProgress: 0,
      status: 'uploading'
    }));

    setUploadedFiles(prevFiles => [...prevFiles, ...newPdfFiles]);

    // 파일 업로드 메시지 추가 (각 파일에 대해)
    newPdfFiles.forEach(pdfFile => {
      const uploadMessage: Message = {
        id: `file-upload-${pdfFile.id}`,
        content: 'FILE_UPLOADED',
        type: 'system',
        timestamp: new Date(),
        fileId: pdfFile.id // Add fileId to message for linking
      };
      setMessages(prev => [...prev, uploadMessage]);
    });
  }, []);

  const handleRemoveFile = useCallback((fileId: string) => {
    setUploadedFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
    setMessages(prevMessages => prevMessages.filter(msg => msg.fileId !== fileId)); // Remove associated system message
  }, []);

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
        content: `PDF 문서에 대한 질문을 받았습니다: "${content}"\n\n죄송하지만, 현재는 실제 AI 분석 기능이 연결되어 있지 않습니다. 이 인터페이스는 UI 데모 버전입니다.\n\n실제 구현을 위해서는 다음과 같은 백엔드 서비스가 필요합니다:\n- PDF 텍스트 추출\n- 벡터 데이터베이스\n- LLM API 연동 (OpenAI, Claude 등)`,
        type: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500 + Math.random() * 1000);
  };

  const toggleHistorySidebar = () => {
    setShowHistorySidebar(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-blue-50 relative overflow-hidden"> {/* Added relative and overflow-hidden */}
      <div className="container mx-auto px-4 py-6">
        <div className={`transition-transform duration-300 ${showHistorySidebar ? 'ml-1/2' : 'ml-0'}`}> {/* Dynamic margin-left */}
          {/* Header */}
          <header className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Link to="/" className="flex items-center gap-4">
                <div>
                  <img src={pencilImage} alt="Pencil" className="w-16 h-16 text-white" />
                </div>
                <div className="text-center">
                  <h1 className="font-bold text-black" style={{ fontFamily: 'NanumSinHonBuBu', fontSize: '38px' }}>
                    니 필기 내꺼 ㅋ
                  </h1>
                  <p className="text-gray-600 font-bold" style={{ fontFamily: 'NanumSinHonBuBu', fontSize: '21px' }}>나의 비밀 요약 친구</p>
                </div>
              </Link>
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

          {/* History Link - Absolutely positioned */}
          <button onClick={toggleHistorySidebar} className="absolute top-6 left-[137px] text-black font-bold" style={{ fontFamily: 'NanumSinHonBuBu', fontSize: '21px', letterSpacing: '0.063em' }}>대화기록</button>

          {/* Main Content Area for Routing */}
          <Routes>
            <Route path="/" element={
              <>
                {/* Main Chat Interface */}
                <div className="max-w-4xl mx-auto h-[600px] lg:h-[700px]">
                  <EnhancedChatInterface
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    uploadedFiles={uploadedFiles}
                    onFileUpload={handleFileUpload}
                    onRemoveFile={handleRemoveFile}
                  />
                </div>

                {/* Footer */}
          <footer className="text-center mt-8 text-gray-500 text-sm">
            <p>🤖 AI 기반 PDF 분석 시스템 • 안전하고 빠른 문서 처리 • 24/7 서비스 제공</p>
          </footer>
              </>
            } />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </div>
      </div>

      {/* History Sidebar - Absolutely positioned */}
      <div className={`fixed top-0 left-0 h-full w-1/2 bg-white shadow-lg transform transition-transform duration-300 ${showHistorySidebar ? 'translate-x-0' : '-translate-x-full'}`}>
        <HistoryPage onClose={toggleHistorySidebar} />
      </div>
    </div>
  );
}

export default App;