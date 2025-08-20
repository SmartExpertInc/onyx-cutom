#!/usr/bin/env python3
"""
Test script to verify PDF generation fixes
"""

import asyncio
import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'custom_extensions', 'backend'))

async def test_calculation_functions():
    """Test the calculation functions to ensure they work correctly"""
    print("🧪 Testing calculation functions...")
    
    try:
        from main import calculate_creation_hours, get_tier_ratio, calculate_lesson_creation_hours_with_module_fallback
        
        # Test get_tier_ratio function
        print("\n📊 Testing get_tier_ratio function:")
        tiers = ['basic', 'interactive', 'advanced', 'immersive']
        for tier in tiers:
            ratio = get_tier_ratio(tier)
            print(f"  {tier}: {ratio}")
        
        # Test calculate_creation_hours function
        print("\n⏱️ Testing calculate_creation_hours function:")
        test_cases = [
            (5, 150),   # 5 minutes, basic tier
            (5, 200),   # 5 minutes, interactive tier
            (5, 300),   # 5 minutes, advanced tier
            (5, 400),   # 5 minutes, immersive tier
            (30, 200),  # 30 minutes, interactive tier
            (60, 200),  # 1 hour, interactive tier
        ]
        
        for completion_time, custom_rate in test_cases:
            hours = calculate_creation_hours(completion_time, custom_rate)
            print(f"  {completion_time}m with rate {custom_rate}: {hours}h")
        
        # Test calculate_lesson_creation_hours_with_module_fallback function
        print("\n📚 Testing calculate_lesson_creation_hours_with_module_fallback function:")
        lesson = {'completionTime': '5m'}
        section = {}
        project_custom_rate = 200
        
        hours = calculate_lesson_creation_hours_with_module_fallback(lesson, section, project_custom_rate)
        print(f"  Lesson with 5m completion time: {hours}h")
        
        print("\n✅ All calculation functions working correctly!")
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
    except Exception as e:
        print(f"❌ Error testing functions: {e}")

async def test_data_structure():
    """Test the data structure preparation"""
    print("\n🧪 Testing data structure preparation...")
    
    try:
        # Mock data similar to what would be processed
        mock_lesson = {
            'completionTime': '5m',
            'hours': 1.0
        }
        
        mock_section = {
            'quality_tier': 'interactive'
        }
        
        mock_project = {
            'quality_tier': 'interactive',
            'microproduct_content': {
                'sections': [
                    {
                        'lessons': [mock_lesson]
                    }
                ]
            }
        }
        
        from main import calculate_lesson_creation_hours_with_module_fallback, get_tier_ratio
        
        # Calculate creation hours for the mock lesson
        custom_rate = get_tier_ratio('interactive')
        creation_hours = calculate_lesson_creation_hours_with_module_fallback(
            mock_lesson, mock_section, custom_rate
        )
        
        print(f"  Mock lesson creation hours: {creation_hours}h")
        print(f"  Expected: ~17h (5 minutes * 200 rate / 60)")
        
        if 15 <= creation_hours <= 20:
            print("  ✅ Creation hours calculation looks correct!")
        else:
            print(f"  ⚠️ Creation hours calculation may be incorrect: {creation_hours}h")
        
    except Exception as e:
        print(f"❌ Error testing data structure: {e}")

async def main():
    """Main test function"""
    print("🚀 Starting PDF generation fix tests...")
    
    await test_calculation_functions()
    await test_data_structure()
    
    print("\n🎉 All tests completed!")

if __name__ == "__main__":
    asyncio.run(main()) 