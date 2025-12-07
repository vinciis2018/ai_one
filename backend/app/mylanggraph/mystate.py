
from typing import List, Optional, Dict, Any
from langgraph.graph import MessagesState

class AssistantState(MessagesState):
    query: str
    user_id: str
    teacher_id: Optional[str]
    student_id: Optional[str]
    chat_id: Optional[str] = None
    previous_conversation: Optional[str] = None
    image_url: Optional[str] = None
    image_transcript: Optional[str] = None
    to_reply: Optional[str] = None
    selected_document_transcript: Optional[str] = None
    chat_space: Optional[str] = None
    domain: str
    
    retrieved_docs: List[Dict] ## complete retrieved documents
    student_docs: List[Dict] ## student retrieved documents, subset of retrieved_docs
    teacher_docs: List[Dict] ## teacher retrieved documents, subset of retrieved_docs

    kb_chunks: List[Dict[str, Any]] = [] ## chunks of knowledge base
    memory_chunks: List[Dict[str, Any]] = [] ## chunks of conversation memory

    directive: str
    answer: str

    error: Optional[str] = None
    response_data: Optional[Any] = {}
    last_conversation: Optional[Dict] = None

