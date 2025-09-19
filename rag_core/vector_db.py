
import os
import chromadb
from langchain.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import CharacterTextSplitter

# 프로젝트 루트 디렉터리 경로를 찾음
# 이 파일(vector_db.py)의 디렉터리(rag_core)의 부모 디렉터리(my_rag_backend)
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(PROJECT_ROOT, "chroma_db")
DATA_PATH = os.path.join(PROJECT_ROOT, "data", "sample_data.txt")

# 1. 임베딩 모델 설정
model_name = "jhgan/ko-sroberta-multitask"
model_kwargs = {'device': 'cpu'}
encode_kwargs = {'normalize_embeddings': False}
embedding_function = HuggingFaceEmbeddings(
    model_name=model_name,
    model_kwargs=model_kwargs,
    encode_kwargs=encode_kwargs
)


# 2. ChromaDB 클라이언트 설정 (파일 기반)
persistent_client = chromadb.PersistentClient(path=DB_PATH) # 경로 수정
collection_name = "my_collection"

def setup_vector_db(): # file_path 인자를 받지 않도록 수정
    """문서 파일을 로드하여 벡터 DB에 저장합니다."""
    # ... (내부 로직은 거의 동일) ...
    # loader = TextLoader(file_path, encoding='utf-8') -> loader = TextLoader(DATA_PATH, encoding='utf-8')
    # persist_directory="./chroma_db" -> persist_directory=DB_PATH
# 컬렉션이 이미 존재하는지 확인하고, 없다면 생성
    try:
        persistent_client.get_collection(name=collection_name)
        print(f"'{collection_name}' 컬렉션이 이미 존재합니다.")
        vectorstore = Chroma(
            client=persistent_client,
            collection_name=collection_name,
            embedding_function=embedding_function,
        )
    except ValueError:
        print(f"'{collection_name}' 컬렉션을 새로 생성합니다.")
        # 문서 로드 및 분할
        loader = TextLoader(file_path, encoding='utf-8')
        documents = loader.load()
        text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        docs = text_splitter.split_documents(documents)

        # 벡터 DB에 저장
        vectorstore = Chroma.from_documents(
            documents=docs,
            embedding=embedding_function,
            persist_directory="./chroma_db",
            collection_name=collection_name,
            client=persistent_client
        )
        print("벡터 DB 설정 및 데이터 저장이 완료되었습니다.")

    return vectorstore

# 이 함수는 서버 시작 시 한번만 호출하거나, 데이터 추가 시 호출
if __name__ == '__main__':
    # 테스트용 데이터 파일 경로
    setup_vector_db('./sample_data.txt')