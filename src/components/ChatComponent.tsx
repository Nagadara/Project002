// src/components/ChatComponent.tsx

import React, { useState } from 'react';

// 백엔드에서 받을 응답 데이터의 타입을 정의합니다.
interface ApiResponse {
  answer: string;
}

function ChatComponent(): React.ReactElement {
  // useState에 제네릭(<>)을 사용하여 상태 변수의 타입을 명시합니다.
  const [question, setQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // form 제출 이벤트의 타입을 명시합니다.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setAnswer('');

    try {
      // ✅ 백엔드 블루프린트 prefix('/api')에 맞춰 경로 수정
      const response = await fetch('http://localhost:5000/api/rag-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error('서버 응답 오류');
      }

      // 응답 데이터의 타입을 ApiResponse로 지정합니다.
      const data: ApiResponse = await response.json();
      setAnswer(data.answer);

    } catch (error) {
      console.error('API 요청 오류:', error);
      setAnswer('답변을 가져오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>RAG 챗봇 (TypeScript)</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="질문을 입력하세요..."
          style={{ padding: '10px', width: '300px' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '10px' }}>
          {loading ? '생각 중...' : '질문하기'}
        </button>
      </form>
      {answer && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
          <h3>답변:</h3>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default ChatComponent;
