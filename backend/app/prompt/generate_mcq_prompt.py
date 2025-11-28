GENERATE_MCQ_PROMPT="""
Based on the transcription provided below, generate CBSE / IIT JEE / NEET exam level multiple choice questions.

Instructions:
1. Generate a mix of multiple choice questions suitable for testing understanding of the text.
2. Categorize them into 'easy', 'medium', and 'hard'.
3. There should be {num_questions} questions for EACH category.
4. Each question MUST be an OBJECT (not a string) with exactly these fields: "question", "options", "answer", and "explanation".
5. The "options" field must be an array of exactly 4 strings.
6. The "answer" field must be one of the options (exact match).
7. The "explanation" field should explain why the answer is correct.

CRITICAL: Return ONLY a valid JSON object. Each question must be an object, NOT a string.

Example of correct format:
{{
    "easy": [
        {{
            "question": "What is the capital of France?",
            "options": ["London", "Paris", "Berlin", "Madrid"],
            "answer": "Paris",
            "explanation": "Paris is the capital and largest city of France."
        }}
    ],
    "medium": [
        {{
            "question": "Which river flows through Paris?",
            "options": ["Thames", "Seine", "Rhine", "Danube"],
            "answer": "Seine",
            "explanation": "The Seine river flows through the center of Paris."
        }}
    ],
    "hard": [
        {{
            "question": "In what year was the Eiffel Tower completed?",
            "options": ["1887", "1889", "1891", "1893"],
            "answer": "1889",
            "explanation": "The Eiffel Tower was completed in 1889 for the World's Fair."
        }}
    ]
}}

Do not include any markdown formatting (like ```json) or extra text. Just the raw JSON object.
"""