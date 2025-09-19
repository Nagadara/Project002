from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.schema.runnable import RunnablePassthrough
from langchain.schema.output_parser import StrOutputParser
# 수정 전: from vector_db import setup_vector_db
# 수정 후: 현재 폴더(.)에 있는 vector_db 파일에서 setup_vector_db 함수를 가져옴
from .vector_db import setup_vector_db
import os
from dotenv import load_dotenv

load_dotenv()

# OpenAI API 키 설정
os.environ["GEMINI_API_KEY"] = os.getenv("GEMINI_API_KEY")

# 1. 벡터 DB 로드 및 Retriever 설정
vectorstore = setup_vector_db('./sample_data.txt') # 실제 데이터 파일 경로
retriever = vectorstore.as_retriever()

# 2. LLM 설정
llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0)

# 3. 프롬프트 템플릿 설정
template = """
당신은 질문에 대해 친절하게 답변하는 AI 어시스턴트입니다.
제공된 문맥(context) 정보를 사용하여 질문에 답변해 주세요.
문맥에서 답을 찾을 수 없다면, "정보를 찾을 수 없습니다."라고 답변하세요.

[Context]
{context}

[Question]
{question}

[Answer]
"""
prompt = PromptTemplate.from_template(template)

# 4. LangChain Expression Language (LCEL)을 이용한 RAG 체인 구성
rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

def get_answer(question):
    """질문을 받아 RAG 체인을 실행하고 답변을 반환합니다."""
    return rag_chain.invoke(question)

# 테스트
if __name__ == '__main__':
    question = "RAG 파이프라인이란 무엇인가요?"
    answer = get_answer(question)
    print("질문:", question)
    print("답변:", answer)