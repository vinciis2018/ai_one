from app.prompt.system_prompt import SYSTEM_PROMPT
from app.prompt.domain_prompt import DOMAIN_PROMPT
from app.prompt.teacher_prompt import TEACHER_PROMPT
from app.prompt.knowledge_prompt import KNOWLEDGE_PROMPT
from app.prompt.memory_prompt import MEMORY_PROMPT
from app.prompt.user_prompt import USER_PROMPT
from app.core.semantic_search_classifier import LOW_SEMANTIC_SET
from app.prompt.ambiguity_prompt import AMBIGUITY_PROMPT


def build_prompt(
  domain: str,
  teacher_style: str,
  knowledge_base: str,
  conversation_memory: str,
  user_query: str
):

  """
    Builds the final prompt in a best-practice structured order.
    """

  # Detect ambiguity
  normalized = user_query.strip().lower()
  is_ambiguous = normalized in LOW_SEMANTIC_SET or len(user_query.split()) <= 3

  if is_ambiguous:
    template = (
      SYSTEM_PROMPT
      + DOMAIN_PROMPT.format(domain=domain)
      + TEACHER_PROMPT.format(teacher_style=teacher_style)
      + AMBIGUITY_PROMPT.format(last_conversation_memory=conversation_memory, user_query=user_query)
    )
    
    return template
  
  template = (
        SYSTEM_PROMPT
        + DOMAIN_PROMPT.format(domain=domain)
        + (TEACHER_PROMPT.format(teacher_style=teacher_style) if teacher_style else "")
        + KNOWLEDGE_PROMPT.format(knowledge_base=knowledge_base)
        + (MEMORY_PROMPT.format(conversation_memory=conversation_memory) if conversation_memory else "")
        + USER_PROMPT.format(user_query=user_query)
    )
  return template