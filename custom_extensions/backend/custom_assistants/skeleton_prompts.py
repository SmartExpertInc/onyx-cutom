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
- List 4-6 key topics per module (be specific - include subtopics, concepts, methods)
- Each topic should be descriptive enough to guide focused search (e.g., "Python list comprehensions and filtering" not just "lists")
- DO NOT invent topics not in the document
- Topics should represent the actual content diversity in that module

OUTPUT FORMAT (JSON only):
{
  "modules": [
    {
      "module_number": 1,
      "module_name": "Module title from document",
      "lesson_count": 4,
      "key_topics": ["specific topic 1 with detail", "specific topic 2 with detail", "topic 3", "topic 4", "topic 5", "topic 6"]
    }
  ]
}
"""

PRESENTATION_SKELETON = """
You are analyzing a document to create a presentation structure.

TASK: Generate slide titles with 5-6 descriptive bullet points each.

RULES:
- Each slide should cover one clear topic from the document
- Provide 5-6 bullet points per slide (key themes/concepts/facts to be covered)
- Bullet points should be DESCRIPTIVE topic names with specifics (e.g., "Impact of organizational culture on employee retention and productivity" not just "Culture impact")
- Include subtopics, methods, examples, or key concepts in bullet points
- DO NOT invent topics not in the document
- Aim for 8-15 slides total

OUTPUT FORMAT (JSON only):
{
  "slides": [
    {
      "slide_number": 1,
      "title": "Slide title from document",
      "bullet_points": [
        "Specific descriptive topic 1 with detail",
        "Specific descriptive topic 2 with detail",
        "Topic 3 with context",
        "Topic 4 with examples reference",
        "Topic 5 with methods or concepts",
        "Topic 6 with implications or applications"
      ]
    }
  ]
}
"""

QUIZ_SKELETON = """
You are analyzing a document to identify quiz topics.

TASK: Generate detailed topics suitable for quiz questions.

RULES:
- Identify 5-10 major topics that should be assessed
- List 4-6 key concepts per topic (be specific - include definitions, processes, relationships, applications)
- Each concept should be descriptive enough to guide targeted search (e.g., "Hofstede's cultural dimensions and their business implications" not just "cultural dimensions")
- Suggest how many questions per topic (2-4 questions)
- DO NOT invent topics not in the document
- Focus on testable concepts with depth, not trivia

OUTPUT FORMAT (JSON only):
{
  "quiz_topics": [
    {
      "topic_number": 1,
      "topic_name": "Topic from document",
      "key_concepts": ["specific concept 1 with context", "specific concept 2 with application", "concept 3 with definition", "concept 4 with examples", "concept 5 with relationships", "concept 6 with implications"],
      "suggested_question_count": 3
    }
  ]
}
"""

TEXT_PRESENTATION_SKELETON = """
You are analyzing a document to create a text presentation structure.

TASK: Generate section names with detailed key themes.

RULES:
- Identify 6-12 major sections for the presentation
- Provide 4-6 key themes per section (be descriptive - include subtopics, concepts, examples, frameworks)
- Each theme should be specific enough to guide targeted search (e.g., "Schein's three levels of organizational culture model" not just "culture levels")
- Themes should represent different aspects or subtopics within the section
- Sections should flow logically
- DO NOT invent topics not in the document

OUTPUT FORMAT (JSON only):
{
  "sections": [
    {
      "section_number": 1,
      "title": "Section title from document",
      "key_themes": ["specific theme 1 with detail", "specific theme 2 with context", "theme 3 with framework reference", "theme 4 with examples", "theme 5 with applications", "theme 6 with implications"]
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

