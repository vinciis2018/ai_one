from app.core.retriever import retrieve_similar
from bson import ObjectId

from app.config.db import get_collection
from app.core.save_conversation import _sanitize_sources

async def retrieve_node(state):
    try:
        user_ids = [state["user_id"]]
        print(state["teacher_id"], state["student_id"])

        student_user = await get_collection("students").find_one(
            {"user_id": ObjectId(state["student_id"])}
        )
        print("student_user: ", student_user)
        teacher_user = await get_collection("teachers").find_one(
            {"user_id": ObjectId(state["teacher_id"])}
        )
        print("teacher_user: ", teacher_user)
        if state["student_id"] == state["user_id"]:
            if teacher_user and "user_id" in teacher_user:
                user_ids.append(str(teacher_user["user_id"]))

        if state["teacher_id"] == state["user_id"]:
            if student_user and "user_id" in student_user:
                user_ids.append(str(student_user["user_id"]))

        print("at retriever node USER IDS: ", user_ids)
        # for llm start
        kb_chunks, user_docs = await retrieve_similar(state["query"], user_ids)


        state["kb_chunks"] = kb_chunks
        state["retrieved_docs"] = _sanitize_sources(user_docs)  # Sanitize sources here
        # for llm end
        print("kb retrieval done!!!")
        # add retrieved docs to
        sanitize_student_docs = _sanitize_sources([doc for doc in user_docs if doc["user_id"] == state["user_id"]])
        st_arr = []
        for doc in sanitize_student_docs:
            st_arr.append(doc["chunk_docs_ids"])
        state["student_docs"] = list(set(element for sublist in st_arr for element in sublist))

        sanitize_teacher_docs = _sanitize_sources([doc for doc in user_docs if doc["user_id"] == str(teacher_user["user_id"])])
        tr_arr = []
        for doc in sanitize_teacher_docs:
            tr_arr.append(doc["chunk_docs_ids"])
        state["teacher_docs"] = list(set(element for sublist in tr_arr for element in sublist))
        
        print("sanitize_student_docs: ")

    except Exception as e:
        print(f"Error in node_retrieve_kb: {str(e)}")
        state["error"] = f"Error retrieving knowledge base: {str(e)}"
    
    print("retriever node done!!!")
    return state
