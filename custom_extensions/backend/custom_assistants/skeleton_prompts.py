"""
Skeleton generation prompts for agentic RAG.
These prompts generate lightweight structure (no content).
"""

COURSE_OUTLINE_SKELETON = """
You are analyzing a document to create a course outline structure.

TASK: Generate a JSON skeleton with modules and lesson counts.

RULES:
- Identify major modules/chapters in the document
- Suggest how many lessons each module needs (based on content depth)
- List 2-3 key topics per module
- DO NOT invent topics not in the document
- Keep it minimal - names and counts only

OUTPUT FORMAT (JSON only):
{
  "modules": [
    {
      "module_number": 1,
      "module_name": "Module title from document",
      "lesson_count": 4,
      "key_topics": ["topic1", "topic2", "topic3"]
    }
  ]
}
"""

PRESENTATION_SKELETON = """
You are analyzing a document to create a presentation structure.

TASK: Generate slide titles with 4 bullet points each.

RULES:
- Each slide should cover one clear topic from the document
- Provide exactly 4 bullet points per slide (key themes/facts)
- Bullet points should be brief topic names (not full sentences)
- DO NOT invent topics not in the document
- Aim for 8-15 slides total

OUTPUT FORMAT (JSON only):
{
  "slides": [
    {
      "slide_number": 1,
      "title": "Slide title from document",
      "bullet_points": [
        "Topic 1",
        "Topic 2",
        "Topic 3",
        "Topic 4"
      ]
    }
  ]
}
"""

QUIZ_SKELETON = """
You are analyzing a document to identify quiz topics.

TASK: Generate broad topics suitable for quiz questions.

RULES:
- Identify 5-10 major topics that should be assessed
- List 2-3 key concepts per topic
- Suggest how many questions per topic (2-4 questions)
- DO NOT invent topics not in the document
- Focus on testable concepts, not trivia

OUTPUT FORMAT (JSON only):
{
  "quiz_topics": [
    {
      "topic_number": 1,
      "topic_name": "Topic from document",
      "key_concepts": ["concept1", "concept2", "concept3"],
      "suggested_question_count": 3
    }
  ]
}
"""

TEXT_PRESENTATION_SKELETON = """
You are analyzing a document to create a text presentation structure.

TASK: Generate section names with key themes.

RULES:
- Identify 6-12 major sections for the presentation
- Provide 2-3 key themes per section
- Sections should flow logically
- DO NOT invent topics not in the document

OUTPUT FORMAT (JSON only):
{
  "sections": [
    {
      "section_number": 1,
      "title": "Section title from document",
      "key_themes": ["theme1", "theme2"]
    }
  ]
}
"""

def get_skeleton_instructions(product_type: str) -> str:
    """Get skeleton generation instructions for product type."""
    mapping = {
        "Course Outline": COURSE_OUTLINE_SKELETON,
        "Lesson Presentation": PRESENTATION_SKELETON,
        "Text Presentation": TEXT_PRESENTATION_SKELETON,
        "Quiz": QUIZ_SKELETON,
    }
    return mapping.get(product_type, PRESENTATION_SKELETON)

