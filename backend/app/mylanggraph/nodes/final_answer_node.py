from app.prompt.answer_prompt import ANSWER_PROMPT as FINAL_PROMPT
from app.prompt.system_prompt import SYSTEM_PROMPT as SYS
from app.prompt.domain_prompt import DOMAIN_PROMPT as DP
from app.prompt.teacher_prompt import TEACHER_PROMPT as TP
from app.prompt.student_prompt import STUDENT_PROMPT as SP
from app.prompt.memory_prompt import MEMORY_PROMPT as CP
from app.prompt.document_prompt import DOCUMENT_PROMPT as DP
from app.prompt.user_prompt import USER_PROMPT as UP

from app.core.llm_manager import call_llm


# ==== HELPER: Generate clarification prompt ====
def generate_clarification_prompt(state):
    """
    Generate an appropriate clarification question based on ambiguity reasons
    """
    reasons = state.get("ambiguity_reasons", [])
    query = state.get("query", "")
    
    if "naked_question_word" in reasons:
        return f"I see you asked '{query}' - could you provide more context about what you'd like to know?"
    
    if "context_dependent" in reasons or "only_pronouns" in reasons:
        return "I need a bit more information. Could you clarify what you're referring to?"
    
    if "incomplete_fragment" in reasons:
        return "It looks like your message might be incomplete. Could you finish your thought?"
    
    if "lacks_specificity" in reasons:
        return "Could you be more specific about what you're looking for?"
    
    # Default
    return "I'm not quite sure what you mean. Could you provide more details?"


def final_answer_node(state):

    # previous conversation
    last_conversation: str = None
    if state["last_conversation"]:
        last_conversation = f"Q: {state['last_conversation']['Q']} \nA: {state['last_conversation']['A']}"

    memory_text = "<conversation>\n\n" + "\n\n".join([c["text"] for c in state["memory_chunks"]]) + "\n\n</conversation>" if state["memory_chunks"] else ""
    last_conv_text = "\n\n<last_conversation>\n\n" + last_conversation + "\n\n</last_conversation>" if last_conversation else ""
    conversation_text = memory_text + last_conv_text


    student_chunks = []
    teacher_chunks = []
    for kb_chunk in state["kb_chunks"]:
        if (str(kb_chunk["source_id"]) in state["student_docs"]):
            student_chunks.append(kb_chunk)
        if (str(kb_chunk["source_id"]) in state["teacher_docs"]):
            teacher_chunks.append(kb_chunk)

    student_notes_text = "<student_notes>\n\n" + "\n\n".join([doc["text"] for doc in student_chunks if len(student_chunks) > 0]) + "\n\n</student_notes>"
    teacher_notes_text = "<teacher_notes>\n\n" + "\n\n".join([doc["text"] for doc in teacher_chunks if len(teacher_chunks) > 0]) + "\n\n</teacher_notes>"

    # document being viewed by user
    selected_document_transcript = None
    if state["selected_document_transcript"]:
        selected_document_transcript = f"The student is currently viewing a document with the following content: \n{state['selected_document_transcript']} \n"

    # document uploaded by the user
    transcript = None
    if state["image_transcript"]:
        transcript = f"The student has uploaded a document with following content and had asked the question below: \n{state['image_transcript']} \n"

    # reply to any text by the user
    reply_context = None
    if state["to_reply"]:
        reply_context = f"The user had sent this ealier reply for some context: {state['to_reply']} \n"


    
    print(state["query"], "::::::::::: query")
    
    prompt = FINAL_PROMPT.format(
        teacher_prompt=TP.format(domain=state["domain"], teacher_notes=teacher_notes_text) if teacher_notes_text else "",
        student_prompt=SP.format(students_notes=student_notes_text) if student_notes_text else "",
        memory_prompt=CP.format(conversation_memory=conversation_text) if conversation_text else "",
        document_prompt=DP.format(transcription=transcript if transcript else "", selected_document_transcript=selected_document_transcript if selected_document_transcript else ""),
        user_prompt=UP.format(user_query=state["query"], reply_context=reply_context if reply_context else ""),
    )

    # print(len(prompt), "::::::::::: prompt")
    with open('final_answer_node.txt', 'w', encoding='utf-8') as file:
        file.write(prompt)

    if state["directive"] == "NORMAL":
        state["answer"] = call_llm(prompt)
    else:
        state["answer"] = generate_clarification_prompt(state)

    print("final answer node done!!!", state["answer"])

    return state


