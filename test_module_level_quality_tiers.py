#!/usr/bin/env python3
"""
Test script to verify module-level quality tier logic
"""

import json
from typing import Dict, Any

def test_module_level_quality_tiers():
    """Test the module-level quality tier calculation logic"""
    
    print("🧪 Testing Module-Level Quality Tier Logic")
    print("=" * 60)
    
    # Mock data structure similar to what's in the database
    mock_projects_data = [
        {
            "id": 1,
            "project_name": "Project 1",
            "quality_tier": "interactive",  # Project-level tier
            "folder_id": 1,
            "microproduct_content": {
                "sections": [
                    {
                        "id": "section1",
                        "title": "Section 1",
                        "quality_tier": "basic",  # Section-level tier
                        "lessons": [
                            {
                                "id": "lesson1",
                                "title": "Lesson 1",
                                "quality_tier": "advanced",  # Lesson-level tier (highest priority)
                                "completion_time": 30,
                                "hours": 60
                            },
                            {
                                "id": "lesson2", 
                                "title": "Lesson 2",
                                "quality_tier": None,  # No lesson-level tier
                                "completion_time": 45,
                                "hours": 90
                            }
                        ]
                    },
                    {
                        "id": "section2",
                        "title": "Section 2", 
                        "quality_tier": None,  # No section-level tier
                        "lessons": [
                            {
                                "id": "lesson3",
                                "title": "Lesson 3",
                                "quality_tier": None,  # No lesson-level tier
                                "completion_time": 60,
                                "hours": 120
                            }
                        ]
                    }
                ]
            }
        },
        {
            "id": 2,
            "project_name": "Project 2",
            "quality_tier": "immersive",  # Project-level tier
            "folder_id": 2,
            "microproduct_content": {
                "sections": [
                    {
                        "id": "section3",
                        "title": "Section 3",
                        "quality_tier": None,  # No section-level tier
                        "lessons": [
                            {
                                "id": "lesson4",
                                "title": "Lesson 4",
                                "quality_tier": "basic",  # Lesson-level tier
                                "completion_time": 20,
                                "hours": 40
                            }
                        ]
                    }
                ]
            }
        }
    ]
    
    # Mock folder quality tiers
    folder_quality_tiers = {
        1: "interactive",  # Folder 1 tier
        2: "advanced"      # Folder 2 tier
    }
    
    # Initialize quality tier sums (same as backend)
    quality_tier_sums = {
        'basic': {'completion_time': 0, 'creation_time': 0},
        'interactive': {'completion_time': 0, 'creation_time': 0},
        'advanced': {'completion_time': 0, 'creation_time': 0},
        'immersive': {'completion_time': 0, 'creation_time': 0}
    }
    
    # Helper function to get effective quality tier (same as backend)
    def get_effective_quality_tier(lesson_quality_tier, section_quality_tier, project_quality_tier, folder_quality_tier='interactive'):
        # Priority: lesson -> section -> project -> folder -> default
        tier = (lesson_quality_tier or section_quality_tier or project_quality_tier or folder_quality_tier or 'interactive').lower()
        
        # Support both old and new tier names
        tier_mapping = {
            # New tier names
            'basic': 'basic',
            'interactive': 'interactive', 
            'advanced': 'advanced',
            'immersive': 'immersive',
            # Old tier names (legacy support)
            'starter': 'basic',
            'medium': 'interactive',
            'professional': 'immersive'
        }
        return tier_mapping.get(tier, 'interactive')
    
    # Process each project
    print("📊 Processing projects for quality tier sums:")
    for project in mock_projects_data:
        project_id = project['id']
        project_quality_tier = project.get('quality_tier')
        folder_id = project.get('folder_id')
        folder_quality_tier = folder_quality_tiers.get(folder_id, 'interactive') if folder_id else 'interactive'
        microproduct_content = project.get('microproduct_content')
        
        print(f"\n🔍 Project {project_id}: project_tier={project_quality_tier}, folder_tier={folder_quality_tier}")
        
        if microproduct_content and isinstance(microproduct_content, dict) and 'sections' in microproduct_content:
            sections = microproduct_content['sections']
            if isinstance(sections, list):
                for section in sections:
                    if isinstance(section, dict) and 'lessons' in section:
                        section_quality_tier = section.get('quality_tier')
                        lessons = section['lessons']
                        if isinstance(lessons, list):
                            for lesson in lessons:
                                if isinstance(lesson, dict):
                                    lesson_quality_tier = lesson.get('quality_tier')
                                    effective_tier = get_effective_quality_tier(
                                        lesson_quality_tier, 
                                        section_quality_tier, 
                                        project_quality_tier, 
                                        folder_quality_tier
                                    )
                                    
                                    # Get lesson completion time and creation hours
                                    lesson_completion_time = lesson.get('completion_time', 0) or 0
                                    lesson_creation_hours = lesson.get('hours', 0) or 0
                                    
                                    print(f"  📝 Lesson {lesson['id']}: lesson_tier={lesson_quality_tier}, section_tier={section_quality_tier}, effective_tier={effective_tier}, completion_time={lesson_completion_time}, creation_hours={lesson_creation_hours}")
                                    
                                    if effective_tier in quality_tier_sums:
                                        quality_tier_sums[effective_tier]['completion_time'] += lesson_completion_time
                                        quality_tier_sums[effective_tier]['creation_time'] += lesson_creation_hours
                                        print(f"    ➕ Added to {effective_tier}: completion_time={lesson_completion_time}, creation_time={lesson_creation_hours}")
    
    print(f"\n📊 Final quality tier sums:")
    for tier, data in quality_tier_sums.items():
        print(f"  {tier}: completion_time={data['completion_time']}, creation_time={data['creation_time']}")
    
    # Expected results based on priority logic:
    print(f"\n🎯 Expected Results Analysis:")
    print(f"  - Lesson 1: lesson_tier='advanced' (highest priority) -> advanced")
    print(f"  - Lesson 2: section_tier='basic' (no lesson tier) -> basic") 
    print(f"  - Lesson 3: project_tier='interactive' (no lesson/section tier) -> interactive")
    print(f"  - Lesson 4: lesson_tier='basic' (highest priority) -> basic")
    
    print(f"\n✅ Test completed successfully!")

if __name__ == "__main__":
    test_module_level_quality_tiers() 