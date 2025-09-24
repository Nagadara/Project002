# app.py

import os
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS

# --- 해결책: 새로운 아키텍처에 맞는 Blueprint만 가져옵니다. ---
from api.pdf_processor import pdf_bp
from api.rag_chat_routes import rag_chat_bp
# -----------------------------------------------------------------

# .env 파일의 환경 변수를 로드합니다.
load_dotenv()

def create_app():
    """Flask 애플리케이션 팩토리 함수"""
    app = Flask(__name__)
    CORS(app) # CORS 설정

    # 새로운 Blueprint들을 앱에 등록합니다.
    app.register_blueprint(pdf_bp, url_prefix='/api')
    app.register_blueprint(rag_chat_bp, url_prefix='/api')

    # 기본 경로 라우트
    @app.route('/')
    def home():
        return "Flask 백엔드 서버가 실행 중입니다."

    return app

# 이 스크립트가 직접 실행될 때만 서버를 구동합니다.
if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)