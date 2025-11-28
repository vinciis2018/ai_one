GENERATE_QUIZ_PROMPT="""
Based on the transcription provided below, generate CBSE / IIT JEE / NEET exam level questions.
        
Instructions:
1. Generate a mix of questions suitable for testing understanding of the text.
2. Categorize them into 'easy', 'medium', and 'hard'.
3. There should be {num_questions} questions for EACH category.
4. Each question should be a string.

CRITICAL: Return ONLY a valid JSON object with ALL THREE categories.

Example of correct format:
{{
    "easy": [
        "What is the capital of France?",
        "What language is spoken in Paris?"
    ],
    "medium": [
        "Which river flows through Paris?",
        "What is the main airport in Paris?"
    ],
    "hard": [
        "In what year was the Eiffel Tower completed?",
        "Who designed the Eiffel Tower?"
    ]
}}

Do not include any markdown formatting (like ```json) or extra text. Just the raw JSON object.
Make sure to include all three categories: easy, medium, and hard.
"""