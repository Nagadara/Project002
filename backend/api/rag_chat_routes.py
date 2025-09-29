# api/rag_chat_routes.py (새 파일)

from flask import Blueprint, request, jsonify
from rag_core.vector_db import get_vector_store
import google.generativeai as genai
import os

# .env에서 읽어온 GOOGLE_API_KEY로 Gemini 초기화
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

rag_chat_bp = Blueprint('rag_chat_bp', __name__)

@rag_chat_bp.route('/rag-chat', methods=['POST'])
def rag_chat():
    data = request.get_json()
    question = data.get('question')

    if not question:
        return jsonify({"error": "질문이 없습니다."}), 400

    try:
        # 1. 저장된 벡터 DB 로드
        vector_store = get_vector_store()
        retriever = vector_store.as_retriever()

        # 2. 질문과 관련된 문서 조각 검색
        relevant_docs = retriever.get_relevant_documents(question)
        context = "\n\n".join([doc.page_content for doc in relevant_docs])

        # 3. Gemini에 보낼 프롬프트 생성
        prompt = f"""
        당신은 주어진 문맥(Context)을 바탕으로 사용자의 질문에 답변하는 AI 어시스턴트입니다.
        문맥에서 답변의 근거를 찾을 수 없다면, "문서에서 관련 정보를 찾을 수 없습니다."라고 답변하세요.
        추측하거나 외부 지식을 사용하지 마세요.

        [Context]
        {context}

        [Question]
        {question}

        [Answer]
        """

        # 4. Gemini API 호출
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        
        return jsonify({"answer": response.text})

    except Exception as e:
        # 벡터 DB가 아직 준비되지 않았을 경우 등 예외 처리
        if "does not exist" in str(e):
             return jsonify({"error": "PDF 파일이 아직 처리되지 않았습니다. 먼저 파일을 업로드해주세요."}), 400
        return jsonify({"error": f"RAG 채팅 중 오류 발생: {e}"}), 500