#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'custom_extensions', 'backend'))

from main import calculate_creation_hours

def test_rounding():
    print("Testing creation hours rounding:")
    print(f"30 minutes, starter tier: {calculate_creation_hours(30, 'starter')} hours")
    print(f"45 minutes, medium tier: {calculate_creation_hours(45, 'medium')} hours")
    print(f"60 minutes, advanced tier: {calculate_creation_hours(60, 'advanced')} hours")
    print(f"90 minutes, professional tier: {calculate_creation_hours(90, 'professional')} hours")
    
    # Test some edge cases that should round up
    print(f"25 minutes, starter tier: {calculate_creation_hours(25, 'starter')} hours")  # Should be 50, rounds to 50
    print(f"35 minutes, medium tier: {calculate_creation_hours(35, 'medium')} hours")   # Should be 116.67, rounds to 117
    print(f"40 minutes, advanced tier: {calculate_creation_hours(40, 'advanced')} hours") # Should be 213.33, rounds to 213

if __name__ == "__main__":
    test_rounding() 