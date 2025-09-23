# api/pdf_processor.py (새 파일)

import fitz # PyMuPDF
from flask import Blueprint, request, jsonify
from rag_core.vector_db import process_and_store_text

pdf_bp = Blueprint('pdf_bp', __name__)

@pdf_bp.route('/upload-pdf', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({"error": "파일이 없습니다."}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "파일이 선택되지 않았습니다."}), 400

    if file and file.filename.endswith('.pdf'):
        try:
            pdf_document = fitz.open(stream=file.read(), filetype="pdf")
            full_text = ""
            for page in pdf_document:
                full_text += page.get_text()
            
            # ★★★★★ 디버깅 코드 추가 ★★★★★
            print("\n--- 추출된 PDF 텍스트 (앞 500자) ---")
            print(full_text[:500])
            print("-------------------------------------\n")
            # ★★★★★★★★★★★★★★★★★★★★★★★

            process_and_store_text(full_text)
            return jsonify({"message": f"'{file.filename}' 파일 처리 완료."}), 200
        except Exception as e:
            return jsonify({"error": f"파일 처리 중 오류 발생: {e}"}), 500
    
    return jsonify({"error": "PDF 파일만 업로드 가능합니다."}), 400