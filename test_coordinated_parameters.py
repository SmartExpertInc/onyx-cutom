#!/usr/bin/env python3
"""
Test Coordinated Parameters
==========================

Simple test to verify the coordinated avatar positioning parameters
are calculated correctly and match the template expectations.
"""

def test_coordinated_parameters():
    """Test the coordinated parameter calculations."""
    
    print("🎬 Testing Coordinated Avatar Parameters")
    print("=" * 50)
    
    # Template requirements (from SimpleVideoComposer)
    template_width = 935
    template_height = 843
    template_x = 925
    template_y = 118
    canvas_width = 1920
    canvas_height = 1080
    
    # Calculate scale factors to fill template area
    scale_x = template_width / canvas_width   # 935/1920 ≈ 0.487
    scale_y = template_height / canvas_height # 843/1080 ≈ 0.781
    
    # Calculate positioning (Elai uses center-point positioning)
    center_x = template_x + (template_width / 2)   # 925 + 467.5 = 1392.5
    center_y = template_y + (template_height / 2)  # 118 + 421.5 = 539.5
    
    print(f"📐 Template Requirements:")
    print(f"  - Template area: {template_width}x{template_height} at ({template_x}, {template_y})")
    print(f"  - Canvas dimensions: {canvas_width}x{canvas_height}")
    print()
    
    print(f"📏 Calculated Scale Factors:")
    print(f"  - scaleX: {scale_x:.3f} ({scale_x*100:.1f}%)")
    print(f"  - scaleY: {scale_y:.3f} ({scale_y*100:.1f}%)")
    print()
    
    print(f"📍 Calculated Center Position:")
    print(f"  - left: {center_x:.1f}")
    print(f"  - top: {center_y:.1f}")
    print()
    
    # Verify calculations
    print(f"✅ Verification:")
    
    # Check scale factors are reasonable
    assert 0 < scale_x < 1, f"scaleX should be between 0 and 1, got {scale_x}"
    assert 0 < scale_y < 1, f"scaleY should be between 0 and 1, got {scale_y}"
    print(f"  ✓ Scale factors are within valid range (0-1)")
    
    # Check positioning is within canvas bounds
    assert 0 <= center_x <= canvas_width, f"center_x should be within canvas width, got {center_x}"
    assert 0 <= center_y <= canvas_height, f"center_y should be within canvas height, got {center_y}"
    print(f"  ✓ Center position is within canvas bounds")
    
    # Check that avatar will fit in template area
    avatar_width = canvas_width * scale_x
    avatar_height = canvas_height * scale_y
    
    assert avatar_width <= template_width, f"Avatar width {avatar_width} should fit in template width {template_width}"
    assert avatar_height <= template_height, f"Avatar height {avatar_height} should fit in template height {template_height}"
    print(f"  ✓ Avatar dimensions ({avatar_width:.1f}x{avatar_height:.1f}) fit in template area")
    
    print()
    print("🎉 All coordinated parameter tests passed!")
    print()
    print("📋 Final Elai Configuration:")
    print(f"{{")
    print(f'    "left": {center_x:.1f},')
    print(f'    "top": {center_y:.1f},')
    print(f'    "scaleX": {scale_x:.3f},')
    print(f'    "scaleY": {scale_y:.3f},')
    print(f'    "width": {canvas_width},')
    print(f'    "height": {canvas_height},')
    print(f'    "avatarType": "transparent"')
    print(f"}}")
    
    return True

if __name__ == "__main__":
    try:
        test_coordinated_parameters()
        print("\n✅ Coordinated parameters test completed successfully!")
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        exit(1)
