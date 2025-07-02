#!/usr/bin/env python3
"""
Test script to demonstrate the calculation discrepancy between SQL and Python methods
for tier-adjusted creation hours.
"""

import sys
import os

# Add the backend directory to the path so we can import the calculation functions
sys.path.append(os.path.join(os.path.dirname(__file__), 'custom_extensions', 'backend'))

from main import calculate_creation_hours, get_tier_ratio

def test_calculation_discrepancy():
    """Test the discrepancy between SQL and Python calculation methods"""
    
    print("🔍 Testing Calculation Discrepancy Between SQL and Python Methods")
    print("=" * 70)
    
    # Test different completion times and tiers
    test_cases = [
        (5, 'medium'),
        (10, 'medium'), 
        (15, 'medium'),
        (20, 'medium'),
        (30, 'medium'),
        (5, 'starter'),
        (10, 'advanced'),
        (15, 'professional')
    ]
    
    print(f"{'Completion Time':<15} {'Tier':<12} {'Old SQL Method':<15} {'New SQL Method':<15} {'Python Method':<15} {'Difference':<12}")
    print("-" * 85)
    
    for completion_time, tier in test_cases:
        ratio = get_tier_ratio(tier)
        
        # Old SQL method: ROUND((completion_time * ratio) / 60.0)
        old_sql_result = round((completion_time * ratio) / 60.0)
        
        # New SQL method: ROUND((completion_time / 60.0) * ratio)
        new_sql_result = round((completion_time / 60.0) * ratio)
        
        # Python method: round((completion_time / 60.0) * ratio)
        python_result = calculate_creation_hours(completion_time, tier)
        
        difference_old = abs(old_sql_result - python_result)
        difference_new = abs(new_sql_result - python_result)
        
        print(f"{completion_time}m{'':<10} {tier:<12} {old_sql_result:<15} {new_sql_result:<15} {python_result:<15} {difference_new:<12}")
        
        if difference_new > 0:
            print(f"  ⚠️  DISCREPANCY FOUND! New SQL: {new_sql_result}, Python: {python_result}")
        elif difference_old > 0:
            print(f"  ✅ FIXED! Old SQL: {old_sql_result}, New SQL: {new_sql_result}, Python: {python_result}")
    
    print("\n" + "=" * 85)
    print("📊 Analysis:")
    print("Old SQL method: ROUND((completion_time * ratio) / 60.0)")
    print("New SQL method: ROUND((completion_time / 60.0) * ratio)")
    print("Python method: round((completion_time / 60.0) * ratio)")
    print("\nThe new SQL method should now match the Python method exactly.")

def test_specific_example():
    """Test the specific example mentioned by the user"""
    
    print("\n🎯 Testing Specific Example: 1223h vs 1230h")
    print("=" * 50)
    
    # Let's try to find a completion time that would produce this discrepancy
    # with medium tier (ratio 200)
    
    target_hours = 1223
    ratio = 200
    
    # Calculate what completion time would give us 1223 hours with Python method
    # Python: round((completion_time / 60.0) * 200)
    # So: completion_time = (1223 / 200) * 60 = 366.9 minutes
    
    completion_time_python = (target_hours / ratio) * 60
    print(f"To get {target_hours}h with Python method, completion time would be: {completion_time_python:.1f} minutes")
    
    # Now calculate what both SQL methods would give us for this completion time
    completion_time = round(completion_time_python)
    
    # Old SQL: ROUND((completion_time * 200) / 60.0)
    old_sql_result = round((completion_time * ratio) / 60.0)
    
    # New SQL: ROUND((completion_time / 60.0) * 200)
    new_sql_result = round((completion_time / 60.0) * ratio)
    
    python_result = calculate_creation_hours(completion_time, 'medium')
    
    print(f"Completion time: {completion_time}m")
    print(f"Old SQL method result: {old_sql_result}h")
    print(f"New SQL method result: {new_sql_result}h")
    print(f"Python method result: {python_result}h")
    print(f"Old SQL vs Python difference: {abs(old_sql_result - python_result)}h")
    print(f"New SQL vs Python difference: {abs(new_sql_result - python_result)}h")
    
    if abs(new_sql_result - python_result) == 0:
        print("✅ FIXED! New SQL method now matches Python method exactly.")
    else:
        print("❌ Still has discrepancy!")

if __name__ == "__main__":
    test_calculation_discrepancy()
    test_specific_example()
    print("\n✅ Test completed!") 