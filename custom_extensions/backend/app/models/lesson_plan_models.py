from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class LessonPlanGenerateRequest(BaseModel):
    """Request model for lesson plan generation"""
    outlineProjectId: int
    moduleName: str
    lessonTitle: str
    lessonNumber: int
    recommendedProducts: List[str]

class ContentDevelopmentSpec(BaseModel):
    """Content development specification for lesson plans"""
    type: str  # "text" or "product"
    block_title: Optional[str] = None  # For text blocks
    block_content: Optional[str] = None  # For text blocks
    product_name: Optional[str] = None  # For product blocks
    product_description: Optional[str] = None  # For product blocks - MUST BE SINGLE STRING

class LessonPlanData(BaseModel):
    """Lesson plan data structure"""
    lessonTitle: str
    lessonObjectives: List[str]
    shortDescription: str
    contentDevelopmentSpecifications: List[ContentDevelopmentSpec]
    materials: List[str]
    suggestedPrompts: List[str]

class LessonPlanResponse(BaseModel):
    """Response model for lesson plan generation"""
    message: str
    lesson_plan_data: LessonPlanData 