import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from rag_core.rag_pipeline import get_answer
from api.chat_routes import chat_bp
from api.gemini_routes import gemini_bp

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(chat_bp, url_prefix='/api')
    app.register_blueprint(gemini_bp, url_prefix='/api')

    @app.route('/')
    def home():
        return "Flask 백엔드 서버가 실행 중입니다."

    return app

if __name__ == '__main__':
    # 서버 실행 (개발 모드)
    app.run(host='0.0.0.0', port=5000, debug=True)