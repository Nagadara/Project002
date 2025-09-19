# api/chat_routes.py

from flask import Blueprint, request, jsonify
from rag_core.rag_pipeline import get_answer

# 'chat_bp'라는 이름의 Blueprint 객체 생성
chat_bp = Blueprint('chat_bp', __name__)

# @app.route 대신 @chat_bp.route를 사용
@chat_bp.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        question = data.get('question')

        if not question:
            return jsonify({"error": "질문이 없습니다."}), 400

        answer = get_answer(question)
        return jsonify({"answer": answer})

    except Exception as e:
        print(f"오류 발생: {e}")
        return jsonify({"error": "서버 내부 오류가 발생했습니다."}), 500

# 여기에 /chat_history, /delete_chat 등 채팅 관련 API를 계속 추가할 수 있음