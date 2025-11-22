AMBIGUITY_PROMPT = """
## The user has submitted a very short or ambiguous message (e.g., “yes”, “no”, “okay”, 
“continue”, etc.)
## Your task:
1. Interpret the message ONLY in relation to the previous conversation context shown below.
2. DO NOT hallucinate new topics or meanings.
3. If the previous context suggests a clear next step, continue appropriately.
4. If the meaning is ambiguous, ask a clarification question politely.
5. Never fabricate details or assume topics not explicitly present in the last user message or context.
6. Always cite the exact conversation messages from the memory context if used.

## {ambiguity_prompt}
"""

