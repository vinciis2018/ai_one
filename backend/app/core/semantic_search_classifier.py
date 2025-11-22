LOW_SEMANTIC_SET = {
  "yes", "y", "yup", "hmm", "huh", "absolutely", "definitely",
  "no", "n", "nope", "never", "always", "sometimes",
  "ok", "okay", "done", "right", "correct", "continue",
  "same", "next", "go on", "carry on", "sure",
  "tell me more", "what about that",
}


def is_low_semantic_query(query: str) -> bool:
    """
    Detect short/ambiguous yes/no queries that cause hallucination.
    """
    if not query:
        return False

    q = query.strip().lower()

    # Very short queries
    if len(q) <= 5:
        return True

    # Exact matches
    if q in LOW_SEMANTIC_SET:
        return True

    # Contains only filler words
    if q.replace("?", "").strip() in LOW_SEMANTIC_SET:
        return True

    return False