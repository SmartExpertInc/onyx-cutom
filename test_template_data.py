#!/usr/bin/env python3
"""
Test script to verify template data structure
"""

import json
from datetime import datetime

def create_test_template_data():
    """Create test template data to verify structure"""
    
    # Mock data that should match what the PDF generation creates
    test_data = {
        'folders': [],
        'folder_projects': {},
        'unassigned_projects': [],
        'column_visibility': {
            'title': True,
            'numberOfLessons': True,
            'estCreationTime': True,
            'estCompletionTime': True
        },
        'column_widths': {},
        'folder_id': None,
        'client_name': 'Test Client',
        'generated_at': datetime.now().isoformat(),
        'summary_stats': {
            'total_projects': 5,
            'total_lessons': 25,
            'total_creation_time': 12.5,
            'total_completion_time': 150
        },
        'product_distribution': {
            'total_products': 5,
            'one_pager_count': 2,
            'presentation_count': 1,
            'quiz_count': 1,
            'video_lesson_count': 1,
            'one_pager_percentage': 40.0,
            'presentation_percentage': 20.0,
            'quiz_percentage': 20.0,
            'video_lesson_percentage': 20.0
        },
        'quality_distribution': {
            'total_lessons': 25,
            'basic_count': 8,
            'interactive_count': 10,
            'advanced_count': 5,
            'immersive_count': 2,
            'basic_percentage': 32.0,
            'interactive_percentage': 40.0,
            'advanced_percentage': 20.0,
            'immersive_percentage': 8.0
        }
    }
    
    return test_data

def test_template_variables():
    """Test how the template would access the data"""
    
    data = create_test_template_data()
    
    print("🧪 Testing Template Data Access")
    print("=" * 50)
    
    # Test product distribution access
    print("\n1. Product Distribution Access:")
    product_dist = data.get('product_distribution', {})
    print(f"   product_distribution exists: {product_dist is not None}")
    print(f"   product_distribution type: {type(product_dist)}")
    print(f"   product_distribution keys: {list(product_dist.keys())}")
    
    # Test individual values
    print(f"   total_products: {product_dist.get('total_products', 'NOT_FOUND')}")
    print(f"   one_pager_count: {product_dist.get('one_pager_count', 'NOT_FOUND')}")
    print(f"   one_pager_percentage: {product_dist.get('one_pager_percentage', 'NOT_FOUND')}")
    
    # Test quality distribution access
    print("\n2. Quality Distribution Access:")
    quality_dist = data.get('quality_distribution', {})
    print(f"   quality_distribution exists: {quality_dist is not None}")
    print(f"   quality_distribution type: {type(quality_dist)}")
    print(f"   quality_distribution keys: {list(quality_dist.keys())}")
    
    # Test individual values
    print(f"   total_lessons: {quality_dist.get('total_lessons', 'NOT_FOUND')}")
    print(f"   basic_count: {quality_dist.get('basic_count', 'NOT_FOUND')}")
    print(f"   basic_percentage: {quality_dist.get('basic_percentage', 'NOT_FOUND')}")
    
    # Test template variable access patterns
    print("\n3. Template Variable Patterns:")
    
    # Product distribution patterns
    total_products = product_dist.get('total_products', 0) if product_dist else 0
    one_pager_count = product_dist.get('one_pager_count', 0) if product_dist else 0
    one_pager_percentage = product_dist.get('one_pager_percentage', 0) if product_dist else 0
    
    print(f"   {% set total_products = product_distribution.total_products if product_distribution else 0 %}")
    print(f"   Result: {total_products}")
    
    print(f"   {% set one_pager_count = product_distribution.one_pager_count if product_distribution else 0 %}")
    print(f"   Result: {one_pager_count}")
    
    print(f"   {% set one_pager_percentage = product_distribution.one_pager_percentage if product_distribution else 0 %}")
    print(f"   Result: {one_pager_percentage}")
    
    # Quality distribution patterns
    total_lessons = quality_dist.get('total_lessons', 0) if quality_dist else 0
    basic_count = quality_dist.get('basic_count', 0) if quality_dist else 0
    basic_percentage = quality_dist.get('basic_percentage', 0) if quality_dist else 0
    
    print(f"   {% set total_lessons = quality_distribution.total_lessons if quality_distribution else 0 %}")
    print(f"   Result: {total_lessons}")
    
    print(f"   {% set basic_count = quality_distribution.basic_count if quality_distribution else 0 %}")
    print(f"   Result: {basic_count}")
    
    print(f"   {% set basic_percentage = quality_distribution.basic_percentage if quality_distribution else 0 %}")
    print(f"   Result: {basic_percentage}")
    
    # Test with None data (fallback case)
    print("\n4. Testing with None data (fallback case):")
    none_data = {
        'product_distribution': None,
        'quality_distribution': None
    }
    
    none_product_dist = none_data.get('product_distribution')
    none_quality_dist = none_data.get('quality_distribution')
    
    print(f"   product_distribution is None: {none_product_dist is None}")
    print(f"   quality_distribution is None: {none_quality_dist is None}")
    
    # Test fallback access
    fallback_total_products = none_product_dist.get('total_products', 0) if none_product_dist else 0
    fallback_total_lessons = none_quality_dist.get('total_lessons', 0) if none_quality_dist else 0
    
    print(f"   Fallback total_products: {fallback_total_products}")
    print(f"   Fallback total_lessons: {fallback_total_lessons}")

def main():
    """Run tests"""
    print("🧪 Template Data Structure Test")
    print("=" * 50)
    
    test_template_variables()
    
    print("\n✅ Tests completed!")

if __name__ == "__main__":
    main() 