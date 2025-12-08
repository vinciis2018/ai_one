


from app.llms.gemini import gemini_translate_text
from app.prompt.translation_prompt import TRANSLATION_PROMPT

def translate_text_with_llm(text: str, language: str) -> str:
    """
    Translates text from one language to another using Gemini.
    """
   
    try:
        prompt = TRANSLATION_PROMPT.format(toLanguage=language) + text
        print(prompt, ":::::::: prompt")
        response = gemini_translate_text(prompt)
        text = response
        
        if text and text.strip():
            return text.strip()
        else:
            raise ValueError("Empty response from Gemini")
            
    except Exception as e:
        print(e, ":::::::: e")
        raise ValueError("Empty response from Gemini")

