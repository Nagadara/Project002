import React, { useState, useEffect, useRef } from 'react';
import { Message, PDFFile } from '../types';
import { ChatMessage } from './ChatMessage';
import { ChevronLeft, X, Send, Trash2 } from 'lucide-react'; // For back button icon

// Define a type for a single conversation history item
interface ConversationHistoryItem {
  id: string;
  title: string; // e.g., file name
  messages: Message[];
  uploadedFile?: PDFFile; // Optional, if a file was associated with the conversation
}

interface HistoryPageProps {
  onClose?: () => void;
}

const HistoryPage = ({ onClose }: HistoryPageProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [allConversations, setAllConversations] = useState<ConversationHistoryItem[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading historical data with multiple conversations
    const simulatedConversations: ConversationHistoryItem[] = [
      {
        id: 'conv-1',
        title: '과거_강의노트.pdf',
        uploadedFile: {
          id: 'history-pdf-1',
          name: '과거_강의노2.pdf',
          size: 1024 * 1024 * 5, // 5MB
          uploadProgress: 100,
          status: 'ready',
          url: '#'
        },
        messages: [
          {
            id: 'hist-1-msg-1',
            content: '안녕하세요! 이전에 업로드했던 "과거_강의노트.pdf"에 대해 질문해주세요.',
            type: 'assistant',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
          },
          {
            id: 'hist-1-msg-2',
            content: '이 문서의 주요 요점을 요약해 줄 수 있나요?',
            type: 'user',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60)
          },
          {
            id: 'hist-1-msg-3',
            content: '네, "과거_강의노트.pdf"의 주요 요점은 다음과 같습니다:\n\n1.  **핵심 개념:** 인공지능의 기본 원리와 머신러닝 알고리즘.\n2.  **주요 이론:** 딥러닝의 신경망 구조와 학습 방법.\n3.  **응용 분야:** 자연어 처리 및 컴퓨터 비전에서의 활용 사례.\n\n더 궁금한 점이 있으신가요?',
            type: 'assistant',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 2)
          },
        ]
      },
      {
        id: 'conv-2',
        title: '프로젝트_기획서_v1.pdf',
        uploadedFile: {
          id: 'history-pdf-2',
          name: '프로젝트_기획서_v1.pdf',
          size: 1024 * 1024 * 8, // 8MB
          uploadProgress: 100,
          status: 'ready',
          url: '#'
        },
        messages: [
          {
            id: 'hist-2-msg-1',
            content: '프로젝트 기획서에 대해 질문해주세요.',
            type: 'assistant',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5)
          },
          {
            id: 'hist-2-msg-2',
            content: '핵심 목표는 무엇인가요?',
            type: 'user',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5 + 1000 * 30)
          },
          {
            id: 'hist-2-msg-3',
            content: '핵심 목표는 사용자 경험 개선과 시장 점유율 확대입니다.',
            type: 'assistant',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5 + 1000 * 60)
          },
        ]
      },
      {
        id: 'conv-3',
        title: '연구_논문_최종.pdf',
        uploadedFile: {
          id: 'history-pdf-3',
          name: '연구_논문_최종.pdf',
          size: 1024 * 1024 * 12, // 12MB
          uploadProgress: 100,
          status: 'ready',
          url: '#'
        },
        messages: [
          {
            id: 'hist-3-msg-1',
            content: '연구 논문에 대해 궁금한 점을 물어보세요.',
            type: 'assistant',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10)
          },
          {
            id: 'hist-3-msg-2',
            content: '이 논문의 주요 기여는 무엇인가요?',
            type: 'user',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10 + 1000 * 45)
          },
          {
            id: 'hist-3-msg-3',
            content: '이 논문은 새로운 알고리즘을 제안하여 기존 방법론의 한계를 극복하고, 실험을 통해 그 효율성을 입증했습니다.',
            type: 'assistant',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10 + 1000 * 90)
          },
        ]
      },
    ];
    setAllConversations(simulatedConversations);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversationId, allConversations]); 

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversationId) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      content: newMessage,
      type: 'user',
      timestamp: new Date(),
    };

    setAllConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.id === selectedConversationId
          ? { ...conv, messages: [...conv.messages, userMessage] }
          : conv
      )
    );
    setNewMessage('');

    setTimeout(() => {
      const assistantResponse: Message = {
        id: `msg-${Date.now()}-assistant`,
        content: `"${userMessage.content}"에 대한 답변입니다.`,
        type: 'assistant',
        timestamp: new Date(),
      };
      setAllConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.id === selectedConversationId
            ? { ...conv, messages: [...conv.messages, assistantResponse] }
            : conv
        )
      );
    }, 1000); 
  };

  const triggerDeleteConfirmation = (conversationId: string) => {
    setConversationToDelete(conversationId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (conversationToDelete) {
      setAllConversations(prev => prev.filter(conv => conv.id !== conversationToDelete));
      setSelectedConversationId(null);
      setShowDeleteConfirm(false);
      setConversationToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setConversationToDelete(null);
  };


  const selectedConversation = allConversations.find(
    (conv) => conv.id === selectedConversationId
  );


  const bookStyles = [
    {
      border: 'border-l-4 border-black',
      lineColor: 'red',
    },
    {
      border: 'border-l-4 border-black',
      lineColor: 'green',
    },
    {
      border: 'border-l-4 border-black',
      lineColor: 'blue',
    },
  ];


  return (
    <div className="flex flex-col h-full p-4 relative"> 
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"> 


        <header className="text-center py-4 border-b border-gray-100 relative">
          {selectedConversationId && (
            <button
              onClick={() => setSelectedConversationId(null)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
          )}
          <h2 className="font-bold text-black" style={{ fontFamily: 'NanumSinHonBuBu', fontSize: '24px' }}>
            {selectedConversationId ? selectedConversation?.title : '과거 대화 기록'}
          </h2>
          
          {selectedConversationId && (
            <button
              onClick={() => triggerDeleteConfirmation(selectedConversationId)}
              className="absolute right-14 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <Trash2 className="w-6 h-6 text-red-500" />
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          )}
        </header>

        {/* Messages/List Area */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0 bg-blue-50">
          {selectedConversationId ? (
            // ===== Detail View =====
            <>
              <div className="bg-white rounded-xl shadow-md p-4 flex flex-col">
                <div className="relative flex-1 overflow-y-auto pr-2">
                  <div className="absolute inset-y-0 left-1/2 w-px bg-gray-300 transform -translate-x-1/2"></div>
                  <div className="space-y-4">
                    {selectedConversation?.messages.map((message) => (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        uploadedFile={
                          message.type === 'system'
                            ? selectedConversation?.uploadedFile
                            : undefined
                        }
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* New message input area */}
                <div className="mt-4 flex items-center border-t pt-4 gap-3">
                  <div className="flex-1 relative min-h-[48px]">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newMessage.trim()) {
                          handleSendMessage();
                        }
                      }}
                      placeholder="메시지를 입력하세요..."
                      className="w-full resize-none rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className={`p-3 rounded-xl transition-all duration-200 h-12 w-12 flex items-center justify-center flex-shrink-0 ${
                      !newMessage.trim()
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            // ===== List View =====
            <div className="bg-blue-50 border-l-8 border-r-8 border-t-8 border-gray-300">
              {allConversations.map((conv, index) => {
                const style = bookStyles[index % bookStyles.length];
                return (
                  <React.Fragment key={conv.id}>
                    <div
                      onClick={() => setSelectedConversationId(conv.id)}
                      className={`relative p-4 rounded-md shadow-lg cursor-pointer transition-all duration-200 transform hover:-translate-y-1 hover:shadow-xl mx-4 my-4 ${style.border} hover:brightness-105`}
                      style={{ backgroundColor: 'black' }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerDeleteConfirmation(conv.id);
                        }}
                        className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="px-2 py-1 rounded-xl" style={{ background: `linear-gradient(to left, ${style.lineColor} 12px, white 12px)` }}>
                        <h3 className={`font-bold text-xl text-black truncate`} style={{ fontFamily: 'NanumSinHonBuBu' }}>{conv.title}</h3>
                        <p className={`text-base text-black opacity-80`} style={{ fontFamily: 'NanumSinHonBuBu' }}>
                          {conv.messages.length} 메시지 •{' '}
                          {new Date(conv.messages[0].timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-300 shadow-inner"></div>
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-2xl">
          <div className="bg-white p-8 rounded-xl shadow-2xl text-center mx-4">
            <p className="text-lg mb-6">정말 이 채팅 기록을 지우실 건가요? (˘̩̩̩ε˘̩ƪ)</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={cancelDelete}
                className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors font-bold"
              >
                취소
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-bold"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;