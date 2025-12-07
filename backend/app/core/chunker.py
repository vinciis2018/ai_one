import re
from typing import List


# ---------------------------------------------
# 1) Basic cleanup (fix OCR artifacts)
# ---------------------------------------------
def clean_ocr(text: str) -> str:
    text = re.sub(r"(?<=\w)\s+(?=\w)", " ", text)  # f requency -> frequency
    text = re.sub(r"-\s+", "-", text)              # MLT- 2 -> MLT-2
    text = re.sub(r"\s{2,}", " ", text)            # collapse spaces
    return text.strip()


# ---------------------------------------------
# 2) Split into educational blocks
# ---------------------------------------------
def split_into_blocks(text: str) -> List[str]:
    """Keeps Q&A, bullet points, examples, laws, definitions grouped."""
    blocks = re.split(
        r"(?=^Q\.?\s*\d+)|"                # Q 1, Q.1
        r"(?=^Question\s*\d+)|"            # Question 1
        r"(?=^Solution\s*\d+)|"            # Solution 1
        r"(?=^- |\* )|"                    # bullet lists
        r"(?=^[A-Z][a-z]+\s*[:\-])|"       # Definition: , Law:, Principle:
        r"(?=^[A-Z][A-Za-z ]+\s*Law)|"     # Newton’s Law
        r"(?=^Example\s*\d+)",             # Example 1
        text,
        flags=re.MULTILINE
    )
    return [b.strip() for b in blocks if b.strip()]


# ---------------------------------------------
# 3) Sentence-level splitting with formula awareness
# ---------------------------------------------
def split_sentences(block: str) -> List[str]:
    # Protect formulas by temporarily removing periods inside [ ... ]
    block = re.sub(r"\[(.*?)\]", lambda m: "[" + m.group(1).replace(".", "<DOT>") + "]", block)

    sentences = re.split(r'(?<=[.!?])\s+', block)

    # Restore dots inside formulas
    sentences = [s.replace("<DOT>", ".") for s in sentences]

    # Remove empty noise
    return [s.strip() for s in sentences if s.strip()]


# ---------------------------------------------
# 4) Domain semantic merging rules
# ---------------------------------------------
def should_merge(prev: str, curr: str, domain: str) -> bool:
    """
    Merge if the content is clearly related, especially for formulas, definitions,
    or scientific concepts.
    """

    if domain == "physics":
        if re.search(r"\[.*?\]", curr):  # dimensions
            return True
        if "unit" in curr.lower() or "dimension" in curr.lower():
            return True

    if domain == "chemistry":
        if re.search(r"[A-Z][a-z]?\d*\s*[\+\-→←]", prev + curr):  # reaction lines
            return True

    if domain in ["math", "maths", "mathematics"]:
        if re.search(r"=|∫|√|π|θ", curr):  # math symbols
            return True

    if domain == "biology":
        if re.search(r"[A-Z][a-z]+ [a-z]+", curr):  # binomial names
            return True

    # Definition continues
    if prev.endswith(":"):
        return True

    return False


# ---------------------------------------------
# 5) Chunking engine
# ---------------------------------------------


def chunk_text(

    text: str,
    domain: str = "science",
    min_size: int = 300, #150
    max_size: int = 1200 #600
):
    text = clean_ocr(text)

    blocks = split_into_blocks(text)

    final_chunks = []

    for block in blocks:
        sentences = split_sentences(block)

        current = ""

        for sent in sentences:
            # Merge domain-related sentences
            if current and should_merge(current, sent, domain):
                current += " " + sent
                continue

            # If adding this exceeds max length → push chunk
            if len(current) + len(sent) > max_size:
                if len(current) >= min_size:
                    final_chunks.append(current.strip())
                    current = sent
                else:
                    current += " " + sent
            else:
                current += " " + sent

        if current.strip():
            final_chunks.append(current.strip())

    # Merge tiny trailing fragments
    merged_final = []
    buf = ""

    for ch in final_chunks:
        if len(ch) < min_size and buf:
            buf += " " + ch
        else:
            if buf:
                merged_final.append(buf.strip())
            buf = ch
    if buf:
        merged_final.append(buf.strip())

    return merged_final
