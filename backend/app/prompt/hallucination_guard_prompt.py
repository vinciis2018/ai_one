HALLUCINATION_GUARD_PROMPT = """
Check if the following context is enough to answer the question.

QUESTION:
{question}

CONTEXT:
{context_text}

If the context is insufficient, respond ONLY with:
INSUFFICIENT_CONTEXT

Else respond:
VALID
"""
