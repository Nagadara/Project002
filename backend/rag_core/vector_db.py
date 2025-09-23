import os
import chromadb
from chromadb.errors import NotFoundError

from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings


# 1. 임베딩 모델 설정
# --- 설정 (유지) ---
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(PROJECT_ROOT, "chroma_db")
collection_name = "pdf_collection" # 컬렉션 이름 변경

embedding_function = HuggingFaceEmbeddings(
    model_name="jhgan/ko-sroberta-multitask",
    model_kwargs={'device': 'cpu'},
    encode_kwargs={'normalize_embeddings': False}
)
persistent_client = chromadb.PersistentClient(path=DB_PATH)
# --------------------

def process_and_store_text(text: str):
    """
    주어진 텍스트를 처리하여 ChromaDB에 저장하는 함수
    """
    # 기존 컬렉션이 있다면 삭제 (매번 새로운 PDF로 대체)
    if collection_name in [c.name for c in persistent_client.list_collections()]:
        print(f"기존 '{collection_name}' 컬렉션을 삭제합니다.")
        persistent_client.delete_collection(name=collection_name)

    print(f"'{collection_name}' 컬렉션을 새로 생성합니다.")
    
    # 텍스트 분할
    text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    docs = text_splitter.create_documents([text])
    
    # 벡터 DB에 저장
    Chroma.from_documents(
        documents=docs,
        embedding=embedding_function,
        persist_directory=DB_PATH,
        collection_name=collection_name,
        client=persistent_client
    )
    print("PDF 텍스트 처리 및 벡터 DB 저장이 완료되었습니다.")

def get_vector_store() -> Chroma:
    """
    저장된 벡터 저장소를 로드하여 반환하는 함수
    """
    print("기존 벡터 저장소를 로드합니다.")
    vectorstore = Chroma(
        client=persistent_client,
        collection_name=collection_name,
        embedding_function=embedding_function,
    )
    return vectorstore