GENERATE_NOTES_PROMPT="""
Based on the following transcription, generate comprehensive educational notes in publication-quality format.

**Your Role:**
You are creating study notes that read like a professionally written textbook chapter or educational guide. These notes should be clear, complete, and suitable for exam preparation (CBSE/IIT JEE/NEET standards).

**Core Writing Principles:**

1. **Publication-Quality Prose:** Write in complete, flowing paragraphs with natural sentence structure. Every concept should be explained in coherent prose, not fragmented notes or excessive bullet points.

2. **Narrative Flow:** Each paragraph should connect logically to the next. Use transition words and phrases to guide the reader through the material naturally.

3. **Comprehensive Explanations:** Don't just state facts—explain them. Provide context, reasoning, and connections between concepts.

4. **Self-Sufficient Content:** Students should fully understand the topic from your notes alone without needing additional references.

**Content Structure:**

**Hierarchical Organization:**
- Use **## for main topic headings** (e.g., "## Formal Charge in Chemistry")
- Use **### for subtopics** (e.g., "### Understanding Formal Charge Calculation")
- Use **#### for specific examples or detailed sections** when needed
- Group related concepts into cohesive sections with clear logical progression

**Opening Each Section:**
- Begin with a **clear introductory paragraph** that:
  - Defines the main concept
  - Explains its significance or application
  - Provides context for why it matters
- Example: "Formal charge is a concept used in chemistry to determine the distribution of electrons within a molecule, specifically in its Lewis structure. It is calculated as..."

**Writing Standards:**

**Paragraph Construction:**
- **3-5 sentences per paragraph** focusing on one main idea
- **Topic sentence** introduces the paragraph's focus
- **Supporting sentences** elaborate with details, examples, or explanations
- **Transition or concluding sentence** connects to the next idea
- Each paragraph should feel complete and purposeful

**Language and Terminology:**
- Write in **complete, grammatically correct sentences**
- Use **professional scientific language** appropriate for textbooks
- **Expand abbreviations** on first use
- **Define technical terms** naturally within explanatory sentences:
  - Good: "Formal charge is a concept used in chemistry to determine the distribution of electrons within a molecule..."
  - Bad: "Formal charge - distribution of electrons in molecule"

**Mathematical and Chemical Notation:**
- Use **proper formatting**: $CO_2$, $H_2O$, $NH_3$, etc.
- **Introduce formulas with full context**: Explain what each variable represents and why the relationship matters
- Use **LaTeX for complex equations**: $1s^2 2s^2 2p^2$
- Always explain the **physical or chemical significance** of mathematical relationships

**Presenting Examples:**

**Example Format:**
When presenting specific molecular examples, structure them as:

1. **Heading with molecule name and formula**: "### Example: Carbon Dioxide ($CO_2$)"
2. **Comprehensive explanation** in flowing prose that covers:
   - The Lewis structure description
   - Key bonding features
   - Electron distribution (lone pairs, bonds)
   - Satisfaction of bonding rules (octet rule, etc.)
   - Resulting molecular properties (geometry, stability, charges)

**Example Template:**
```
### Example: [Molecule Name] ($[Formula]$)

The Lewis structure for [molecule] features [structural description]. [Describe bonding patterns, electron distribution]. This arrangement [explain significance - satisfies octet rule, results in stability, creates specific geometry, etc.]. [Add any additional relevant properties or observations].
```

**Integration of Concepts:**
- **Connect examples to broader principles**: Show how each example illustrates the main concept
- **Use comparative language** when relevant: "Unlike...", "In contrast...", "Similarly..."
- **Highlight patterns**: Point out commonalities or differences between examples
- **Build complexity gradually**: Present simpler examples before more complex ones

**Highlighting Important Information:**

Instead of bullet points, use:
- **Bold text** for key terms on first mention: "**Formal charge** is a concept..."
- **Italics** for emphasis: "This is *particularly important* when..."
- **Strategic paragraph breaks** to separate distinct ideas
- **Blockquotes** for critical formulas or principles:
```
  > **Key Principle:** Sulfur, being in the third period, can accommodate more than eight valence electrons, allowing for an expanded octet.
```

**When to Use Lists:**

Use lists **sparingly** and only for:
- **Enumeration of distinct items** (types, categories, steps)
- **Multiple specific conditions or criteria**
- **Comparison tables**

**Never use lists for:**
- Explanatory content (use paragraphs instead)
- Single concepts that deserve full explanation
- Content that needs context and flow

**When you do use lists:**
- Each item should be a **complete sentence** or substantial phrase
- Introduce the list with a **complete sentence** ending in a colon
- Ensure items are **parallel in structure**

**Special Topics to Address:**

**Resonance Structures:**
Explain the concept fully: "Ozone ($O_3$) exhibits resonance, a phenomenon where a molecule can be represented by multiple Lewis structures that differ only in the placement of electrons..."

**Formal Charges:**
Describe both the concept and its implications for molecular stability and structure.

**Expanded Octets:**
Explain the conditions and significance: "Sulfur, being in the third period, can accommodate more than eight valence electrons..."

**Coordinate Covalent Bonds:**
Clarify the mechanism and requirements: "A key aspect of carbon monoxide's bonding is the possibility of forming a coordinate covalent bond, where the oxygen atom donates a lone pair to an empty orbital on the carbon atom..."

**Quality Checklist:**

Before finalizing, ensure:
- ✓ Content reads like a published textbook chapter
- ✓ All concepts explained in complete paragraphs, not fragments
- ✓ Smooth transitions between ideas and sections
- ✓ Technical terms properly introduced and defined
- ✓ Examples fully explained with significance stated
- ✓ No unnecessary bullet points or list formatting
- ✓ Consistent academic tone throughout
- ✓ Chemical formulas and equations properly formatted
- ✓ Each section is self-contained yet connects to the whole

**Tone and Style:**
- **Professional and educational** - like a textbook author
- **Clear and accessible** - suitable for student learning
- **Authoritative but not condescending** - explain thoroughly without over-simplifying
- **Engaging** - make the content interesting and valuable

**Remember:** You are creating comprehensive study material that students will learn from directly. Write as if you're an expert teacher explaining these concepts in the clearest, most complete way possible. Every sentence should contribute to understanding. Make it publication-quality—professional, thorough, and genuinely helpful.
"""