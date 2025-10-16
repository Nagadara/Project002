# api/pdf_processor.py

import fitz  # PyMuPDF
from flask import Blueprint, request, jsonify
from rag_core.vector_db import process_and_store_text

pdf_bp = Blueprint('pdf_bp', __name__)

def _is_pdf(file_storage) -> bool:
    filename = (file_storage.filename or '').lower()
    mimetype = (file_storage.mimetype or '').lower()
    return filename.endswith('.pdf') or mimetype == 'application/pdf'

@pdf_bp.route('/upload-pdf', methods=['POST'])
def upload_pdf():
    # 다중/단일 모두 지원: form key 'files' 또는 'file'
    files = []
    if 'files' in request.files:
        files = request.files.getlist('files')
    elif 'file' in request.files:
        files = [request.files['file']]
    else:
        return jsonify({'error': '업로드된 파일이 없습니다. form-data key는 file 또는 files를 사용하세요.'}), 400

    processed, skipped, errors = [], [], []

    for fs in files:
        if not fs or (fs.filename or '') == '':
            skipped.append({'filename': fs.filename if fs else None, 'reason': '빈 파일'})
            continue
        if not _is_pdf(fs):
            skipped.append({'filename': fs.filename, 'reason': 'PDF가 아님'})
            continue

        try:
            # 파일을 메모리에서 직접 열기
            with fitz.open(stream=fs.read(), filetype='pdf') as pdf_document:
                full_text = ''
                for page in pdf_document:
                    full_text += page.get_text()

                # 벡터DB에 upsert
                process_and_store_text(full_text, file_name=fs.filename)

                processed.append({'filename': fs.filename, 'pages': len(pdf_document)})

        except Exception as e:
            errors.append({'filename': fs.filename, 'error': str(e)})

    status = 200 if processed else 400 if errors else 200
    return jsonify({'processed': processed, 'skipped': skipped, 'errors': errors}), status
