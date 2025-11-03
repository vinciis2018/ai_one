import openai
from app.core.config import OPENAI_API_KEY


openai.api_key = OPENAI_API_KEY


def generate_answer(contexts, query):
  context_str = "\n".join(contexts)
  prompt = f"""
  You are a helpful study assistant. Use only the context below to answer the question.
  Context:
  {context_str}
  Question: {query}
  If answer not found, say 'I don't know based on given materials.'
  """
  response = openai.ChatCompletion.create(
    model="gpt-4-turbo",
    messages=[{"role": "user", "content": prompt}],
    temperature=0.3
  )
  return response.choices[0].message["content"]