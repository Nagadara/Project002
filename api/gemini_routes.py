# api/gemini_routes.py

import os
import google.generativeai as genai
from flask import Blueprint, request, jsonify

gemini_bp = Blueprint('gemini_bp', __name__)

try:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("경고: GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.")
    else:
        genai.configure(api_key=api_key)
        print("Gemini API 키가 성공적으로 설정되었습니다.")
except Exception as e:
    print(f"Gemini API 키 설정 중 오류 발생: {e}")

# --- 새로운 Gemini 채팅 엔드포인트 ---
@gemini_bp.route('/gemini-chat', methods=['POST'])
def gemini_chat():
    try:
        data = request.get_json()
        prompt = data.get('prompt')

        if not prompt:
            return jsonify({"error": "프롬프트가 없습니다."}), 400

        # Gemini 모델 초기화
        model = genai.GenerativeModel('gemini-pro')
        
        # Gemini API 호출
        response = model.generate_content(prompt)

        # 생성된 답변을 JSON 형태로 프론트엔드에 반환
        return jsonify({"answer": response.text})

    except Exception as e:
        print(f"Gemini API 호출 중 오류 발생: {e}")
        return jsonify({"error": f"서버 내부 오류: {e}"}), 500