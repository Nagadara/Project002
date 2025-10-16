import os
import chromadb
from chromadb.errors import NotFoundError
from typing import Dict, Optional

from langchain_community.vectorstores import Chroma
from langchain.text_splitter import CharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings

# 기본 설정
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(PROJECT_ROOT, "chroma_db")
collection_name = "pdf_collection"

embedding_function = HuggingFaceEmbeddings(
    model_name="jhgan/ko-sroberta-multitask",
    model_kwargs={'device': 'cpu'},
    encode_kwargs={'normalize_embeddings': False}
)
persistent_client = chromadb.PersistentClient(path=DB_PATH)

def _get_vectorstore() -> Chroma:
    """컬렉션을 로드(없으면 생성)"""
    return Chroma(
        client=persistent_client,
        collection_name=collection_name,
        embedding_function=embedding_function,
        persist_directory=DB_PATH
    )

def process_and_store_text(text: str, *, file_name: Optional[str] = None, metadata: Optional[Dict] = None):
    """
    텍스트를 청킹하여 기존 컬렉션에 **추가(upsert)** 합니다.
    (이제 컬렉션을 삭제하지 않음 → 다중 PDF 누적 지원)
    """
    vs = _get_vectorstore()

    text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    docs = text_splitter.create_documents([text])

    base_meta = metadata.copy() if metadata else {}
    if file_name:
        base_meta.setdefault("file_name", file_name)

    for d in docs:
        d.metadata = {**(d.metadata or {}), **base_meta}

    vs.add_documents(docs)
    try:
        vs.persist()
    except Exception:
        pass  # 환경에 따라 persist가 필요 없을 수 있음

def get_vector_store() -> Chroma:
    return _get_vectorstore()
