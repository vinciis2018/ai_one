from app.prompt.ambiguity_prompt import AMBIGUITY_PROMPT
from bson import ObjectId
from app.config.db import get_collection
import re
import string



FOLLOWUP_KEYWORDS = {
    # Affirmations
    "yes", "yeah", "yep", "yup", "sure", "correct", "right", "exactly",
    "absolutely", "indeed", "affirmative", "uh huh", "mhm",
    
    # Negations
    "no", "nope", "nah", "not really", "incorrect", "wrong", "negative",
    
    # Acknowledgments
    "ok", "okay", "kay", "alright", "fine", "got it", "understood",
    "i see", "makes sense",
    
    # Continuation requests
    "done", "continue", "go on", "go ahead", "keep going", "proceed",
    "next", "move on", "carry on", "resume",
    
    # Expansion requests
    "explain more", "more", "tell me more", "elaborate", "expand",
    "more details", "more info", "give me more", "anything else",
    "what else", "more please",
    
    # Clarification requests
    "explain", "explain please", "clarify", "define", "define please",
    "what do you mean", "meaning", "elaborate please",
    
    # Examples requests
    "examples", "examples please", "example", "show me", "demonstrate",
    "give examples", "such as",
    
    # References
    "same", "that one", "this", "that", "this one", "the same",
    "like that", "similar", "same thing",
    
    # Agreement/completion
    "finished", "complete", "ready", "perfect", "good",
    "great", "thanks", "thank you", "ty",
    
    # Single word acknowledgments
    "k", "kk", "cool", "nice", "ok then"
}

# Patterns for more sophisticated follow-up detection
FOLLOWUP_PATTERNS = [
    r"^(the|that|this)\s+(first|second|third|last|previous|next)\s+(one|option|choice)",
    r"^option\s+[a-z0-9]",
    r"^choice\s+\d+",
    r"^number\s+\d+",
    r"^\d+$",  # Just a number
    r"^[a-z]$",  # Single letter (like "a", "b", "c")
    r"^(yes|yeah|yep),?\s+(the\s+)?(first|second|third|last|one)",
    r"^pick\s+(the\s+)?(first|second|third|one|\d+|[a-z])",
    r"^choose\s+(the\s+)?(first|second|third|one|\d+|[a-z])",
    r"^select\s+(the\s+)?(first|second|third|one|\d+|[a-z])",
]


# Ambiguous one-word responses that need context
AMBIGUOUS_ONE_WORDS = {
    "why", "what", "how", "when", "where", "who", "which",
    "huh", "what?", "why?", "how?", "hm", "hmm", "eh",
    "idk", "dunno", "maybe", "perhaps", "possibly",
    "again", "repeat", "back", "return", "undo",
    "respond", "reply", "answer", "explain", "clarify", "define",  # ← Added here
    "start", "begin", "go"  # Also ambiguous without context
}

# Vague pronouns/references without clear antecedents
VAGUE_REFERENCES = {
    "it", "that", "this", "those", "these", "them", "they",
    "he", "she", "him", "her", "something", "anything",
    "everything", "nothing", "someone", "anyone"
}

# Words that indicate the user is asking for clarification
CLARIFICATION_INDICATORS = {
    "mean", "meaning", "meant", "confused", "unclear",
    "understand", "get it", "follow", "sense", "clarify",
    "explain", "elaborate", "specify", "rephrase"
}

# Incomplete sentence starters
INCOMPLETE_PATTERNS = [
    r"^(but|and|or|so|because|if|when|while|although)\s*$",
    r"^(what about|how about|why not|what if)\s*$",
    r"^\.\.\.$",  # Just ellipsis
    r"^-+$",  # Just dashes
]



def clean_word(word):
    """Remove punctuation from word for matching"""
    return word.strip(string.punctuation)
    

def calculate_ambiguity_score(query):
    """
    Calculate an ambiguity score (0-100) based on multiple factors.
    Higher score = more ambiguous
    """
    score = 0
    words = [clean_word(w) for w in query.split()]
    word_count = len(words)
    
    # Factor 1: Very short queries (1-3 words without question mark)
    if word_count <= 3 and not query.endswith("?"):
        score += 30
    
    # Factor 2: Single word queries
    if word_count == 1:
        score += 20
        # But reduce if it's a clear follow-up keyword
        if query in FOLLOWUP_KEYWORDS:
            score -= 40
    
    # Factor 3: Vague pronouns without context
    vague_count = sum(1 for word in words if word in VAGUE_REFERENCES)
    if vague_count > 0 and word_count <= 5:
        score += (vague_count * 15)
    
    # Factor 4: Question words without proper question structure
    question_words = ["what", "why", "how", "when", "where", "who", "which"]
    cleaned_words_lower = [w.lower() for w in words]
    if any(word in cleaned_words_lower for word in question_words):
        if word_count <= 2:  # "what?", "why?" etc.
            score += 25
        elif not query.endswith("?"):
            score += 15
    
    # Factor 5: Clarification indicators
    if any(word in query for word in CLARIFICATION_INDICATORS):
        score += 20
    
    # Factor 6: All pronouns (very vague)
    if all(word in VAGUE_REFERENCES or word in {"the", "a", "an"} for word in words):
        score += 30
    
    # Factor 7: Incomplete sentences
    for pattern in INCOMPLETE_PATTERNS:
        if re.match(pattern, query, re.IGNORECASE):
            score += 25
            break
    
    # Factor 8: Lack of nouns/verbs (using simple heuristic)
    if word_count > 1:
        # If query has no words longer than 4 characters, likely vague
        if not any(len(word) > 4 for word in words):
            score += 15
    
    return min(score, 100)  # Cap at 100

def has_context_dependency(query):
    """
    Check if query depends heavily on conversation context
    """
    words = query.split()
    
    # High pronoun ratio
    pronoun_ratio = sum(1 for w in words if w in VAGUE_REFERENCES) / len(words) if words else 0
    if pronoun_ratio > 0.5:
        return True
    
    # Starts with connector words (implies continuation)
    connectors = ["and", "but", "or", "also", "plus", "additionally", "furthermore"]
    if words and words[0] in connectors:
        return True
    
    # Deictic expressions (pointing words without referent)
    deixis = ["here", "there", "now", "then", "today", "yesterday", "above", "below"]
    if any(word in words for word in deixis) and len(words) <= 4:
        return True
    
    return False

def is_fragment(query):
    """
    Detect sentence fragments that need completion
    """
    # No verb-like words (very simple heuristic)
    verb_indicators = ["is", "are", "was", "were", "do", "does", "did", 
                       "have", "has", "had", "can", "could", "will", "would",
                       "should", "must", "may", "might"]
    
    words = query.split()
    if len(words) >= 2:
        has_verb = any(word in verb_indicators for word in words)
        if not has_verb and not query.endswith("?"):
            return True
    
    # Ends with conjunction or preposition
    if words and words[-1] in ["and", "or", "but", "with", "of", "to", "for", "in", "on"]:
        return True
    
    return False

def lacks_specificity(query):
    """
    Check if query is too general/vague
    """
    vague_phrases = [
        "stuff", "things", "something", "anything", "everything",
        "it", "that thing", "this thing", "you know",
        "like", "kind of", "sort of", "whatever"
    ]
    
    return any(phrase in query for phrase in vague_phrases) and len(query.split()) <= 6

def matches_followup_pattern(query):
    """Check if query matches any follow-up pattern"""
    for pattern in FOLLOWUP_PATTERNS:
        if re.match(pattern, query, re.IGNORECASE):
            return True
    return False

async def ambiguity_node(state):
    query = state["query"].strip().lower()
    cleaned_query = query.strip(string.punctuation)

    words = query.split()
    word_count = len(words)
    
    # Default = normal
    state["directive"] = "NORMAL"
    state["ambiguity_score"] = 0
    state["ambiguity_reasons"] = []
    
    # ==== PRIORITY 1: Clear Follow-ups (SKIP ambiguity checks) ====
    if cleaned_query in FOLLOWUP_KEYWORDS:
        state["directive"] = "FOLLOWUP"
        print(state["directive"], ":::::::::directive")
        print("ambiguity check done!!!", state["query"])
        return state
    
    if matches_followup_pattern(query):
        state["directive"] = "FOLLOWUP"
        print(state["directive"], ":::::::::directive")
        print("ambiguity check done!!!", state["query"])
        return state
    
    # ==== PRIORITY 2: Ambiguity Detection ====
    
    # Calculate ambiguity score
    ambiguity_score = calculate_ambiguity_score(query)
    state["ambiguity_score"] = ambiguity_score
    
    # Collect reasons for ambiguity
    reasons = []
    
    # Check 1: Ambiguous one-word responses
    if word_count == 1:
        cleaned_word = clean_word(words[0])
        if cleaned_word in AMBIGUOUS_ONE_WORDS:
            reasons.append("ambiguous_one_word")
            state["directive"] = "AMBIGUOUS_NEED_MEMORY"
    
    # Check 2: Context dependency
    if has_context_dependency(query):
        reasons.append("context_dependent")
    
    # Check 3: Sentence fragment
    if is_fragment(query):
        reasons.append("incomplete_fragment")
    
    # Check 4: Lacks specificity
    if lacks_specificity(query):
        reasons.append("lacks_specificity")
    
    # Check 5: High ambiguity score
    if ambiguity_score >= 50:
        reasons.append("high_ambiguity_score")
        state["directive"] = "AMBIGUOUS_NEED_MEMORY"
    
    # Check 6: Original short message check
    if word_count <= 3 and not query.endswith("?") and state["directive"] != "FOLLOWUP":
        reasons.append("short_non_question")
        if ambiguity_score >= 30:
            state["directive"] = "AMBIGUOUS_NEED_MEMORY"
    
    # Check 7: Naked question words
    cleaned_words = [clean_word(w) for w in words]
    if word_count == 1 and cleaned_words[0] in {"why", "what", "how", "when", "where", "who", "which"}:
        reasons.append("naked_question_word")
        state["directive"] = "AMBIGUOUS_NEED_MEMORY"
    
    # Check 8: Only pronouns/articles
    if word_count > 0 and all(clean_word(word) in VAGUE_REFERENCES | {"the", "a", "an", "my", "your"} for word in words):
        reasons.append("only_pronouns")
        state["directive"] = "AMBIGUOUS_NEED_MEMORY"
    
    state["ambiguity_reasons"] = reasons
    
    # Final decision based on accumulated evidence
    if len(reasons) >= 3:  # Multiple indicators of ambiguity
        state["directive"] = "AMBIGUOUS_NEED_MEMORY"
    
    print(f"{state['directive']} :::::::::directive")
    print(f"Ambiguity Score: {ambiguity_score}")
    print(f"Reasons: {reasons}")
    print("ambiguity check done!!!", state["query"])
    
    # if state["directive"] != "NORMAL":
    #     conversation_cols = get_collection("conversations")
    #     last_conversation = await conversation_cols.find_one({"_id": ObjectId(state["previous_conversation"])})
    #     if last_conversation:
    #         last_conversation_query = last_conversation.get("query", "").strip()
    #         last_conversation_answer = last_conversation.get("answer", "").strip()
    #         prev_conversation_prompt = "The student asked this previously, " + "<question>" + last_conversation_query + "</question>\n\n" + "<answer>" + last_conversation_answer + "</answer>\n\n" + ", so now based on above, answer for " +  state["query"]  
    #         print(prev_conversation_prompt, ":::::::::::: prev conv prompt")
    #         state["query"] = AMBIGUITY_PROMPT.format(
    #             ambiguity_prompt=prev_conversation_prompt
    #         )
    return state




