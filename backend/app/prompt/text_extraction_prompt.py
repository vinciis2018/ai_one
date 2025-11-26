TEXT_EXTRACTION_PROMPT = """
Please analyze this image and provide a comprehensive transcription including text and diagrams.

**Instructions:**

1. **Text Transcription:**
   - Extract every word, number, and symbol exactly as shown
   - Preserve the layout and structure (headings, paragraphs, lists)
   - Include handwritten notes and equations
   - If text is unclear, make your best interpretation, don't give garbled segments.

2. **Diagram Detection:**
   - Identify any diagrams, charts, graphs, or visual elements
   - For each diagram, provide a detailed description in this format:
   
   ```
   [DIAGRAM: <type>]
   Title: <diagram title if any>
   Description: <detailed description of what the diagram shows>
   Components: <list key components, labels, arrows, relationships>
   Notes: <any additional important details>
   [/DIAGRAM]
   ```

3. **Mathematical Equations:**
   - Write equations clearly using standard notation
   - Use LaTeX format for complex equations (e.g., $E = mc^2$)

4. **Output Format:**
   - Use markdown formatting
   - Separate sections with headers (## for main sections)
   - Use bullet points for lists
   - Keep diagrams in the structured format above so they can be edited

Keep the output as shown in the image
"""