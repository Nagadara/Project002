import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../types';
import { ChatMessage } from './ChatMessage';
import { ChevronLeft, X } from 'lucide-react';

// 대화 히스토리 아이템: 파일 객체/메타 없음! 제목만 사용
interface ConversationHistoryItem {
  id: string;
  title: string;       // ← PDF 이름을 그대로 제목으로 사용
  messages: Message[];
}

interface HistoryPageProps {
  onClose?: () => void;
}

const HistoryPage = ({ onClose }: HistoryPageProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [allConversations, setAllConversations] = useState<ConversationHistoryItem[]>([]);

  useEffect(() => {
    // 히스토리: 제목만 있고 파일 메타/객체 없음
    const simulatedConversations: ConversationHistoryItem[] = [
      {
        id: 'conv-1',
        title: '과거_강의노트.pdf',
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
  }, [selectedConversationId]);

  const selectedConversation = allConversations.find(
    (conv) => conv.id === selectedConversationId
  );

  return (
  <div className="flex h-full flex-col w-full p-4 md:p-5 lg:p-6 overflow-y-auto"
    style={{ scrollbarGutter: 'stable' }}>      
    <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
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
            // Detail View
            <div className="space-y-4">
              {selectedConversation?.messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            // List View - Bookshelf
            <div className="bg-white border-l-8 border-r-8 border-t-8 border-yellow-700">
              {allConversations.map((conv) => {
                const firstTs = conv.messages[0]?.timestamp ?? new Date();
                return (
                  <React.Fragment key={conv.id}>
                    <div
                      onClick={() => setSelectedConversationId(conv.id)}
                      className="p-4 bg-white rounded-md shadow-md hover:bg-gray-50 cursor-pointer transition-colors transform hover:-translate-y-1 mx-4 my-4"
                    >
                      <h3 className="font-semibold text-gray-800">{conv.title}</h3>
                      <p className="text-xs text-gray-500">
                        {conv.messages.length} 메시지 • {new Date(firstTs).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="h-2 bg-yellow-700 shadow-inner"></div>
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
