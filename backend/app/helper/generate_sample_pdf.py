# ============================================
# generate_sample_pdf.py
# Creates sample educational PDF for RAG testing
# ============================================

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import os

OUTPUT_PATH = "backend/app/sample_data/example_notes.pdf"

os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

c = canvas.Canvas(OUTPUT_PATH, pagesize=A4)
width, height = A4

# Title
c.setFont("Helvetica-Bold", 18)
c.drawString(80, height - 80, "Fundamental Concepts in Physics")

c.setFont("Helvetica", 12)
y = height - 120

sections = {
    "Newton’s Laws of Motion": [
        "1. First Law (Law of Inertia): A body remains at rest or in uniform motion unless acted upon by an external force.",
        "2. Second Law: Force equals mass times acceleration (F = m × a).",
        "3. Third Law: For every action, there is an equal and opposite reaction."
    ],
    "Work, Energy, and Power": [
        "Work is done when a force acts on an object and causes displacement.",
        "Kinetic Energy (KE) = ½mv², Potential Energy (PE) = mgh.",
        "Power is the rate of doing work, P = W / t."
    ],
    "Law of Universal Gravitation": [
        "Every particle in the universe attracts every other particle with a force proportional to the product of their masses and inversely proportional to the square of the distance between them.",
        "Mathematically: F = G × (m₁ × m₂) / r²."
    ]
}

for section, lines in sections.items():
    c.setFont("Helvetica-Bold", 14)
    c.drawString(70, y, section)
    y -= 20
    c.setFont("Helvetica", 12)
    for line in lines:
        c.drawString(80, y, line)
        y -= 18
    y -= 20

c.showPage()
c.save()

print(f"✅ Created sample PDF at: {OUTPUT_PATH}")
