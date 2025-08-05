#!/usr/bin/env python3
"""
Video Composite Creator
======================

This script creates a composite video by:
1. Creating a video from a slide image (base_slide_image.jpg)
2. Removing green background from avatar video (chroma key)
3. Overlaying the avatar on the slide video
4. Preserving audio from the avatar video

Requirements:
- opencv-python: pip install opencv-python
- moviepy: pip install moviepy
- numpy: pip install numpy

Usage:
- python create_composite_video.py
"""

import cv2
import numpy as np
from moviepy.editor import VideoFileClip, ImageClip, CompositeVideoClip
import os
import sys
from datetime import datetime

def check_files():
    """Check if required files exist."""
    required_files = [
        "base_slide_image.jpg",
        "elai_green_screen_video_20250805_134324.mp4"
    ]
    
    missing_files = []
    for file in required_files:
        if not os.path.exists(file):
            missing_files.append(file)
    
    if missing_files:
        print(f"❌ Missing required files: {', '.join(missing_files)}")
        return False
    
    print("✅ All required files found!")
    return True

def create_professional_mask(input_video_path, mask_video_path):
    """
    Create a professional alpha mask for green screen removal.
    
    Args:
        input_video_path: Path to input video with green background
        mask_video_path: Path to save the alpha mask video
    """
    print(f"🎬 Creating professional alpha mask...")
    print(f"Input: {input_video_path}")
    print(f"Mask output: {mask_video_path}")
    
    # Open input video
    cap = cv2.VideoCapture(input_video_path)
    
    # Get video properties
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    print(f"📊 Video info: {width}x{height}, {fps} FPS, {total_frames} frames")
    
    # Create mask video writer (grayscale)
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    mask_out = cv2.VideoWriter(mask_video_path, fourcc, fps, (width, height), False)
    
    frame_count = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_count += 1
        
        # Convert to different color spaces for better detection
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
        
        # More precise green detection in HSV
        lower_green = np.array([35, 30, 30])
        upper_green = np.array([85, 255, 255])
        mask_hsv = cv2.inRange(hsv, lower_green, upper_green)
        
        # Additional green detection in LAB color space
        lower_green_lab = np.array([0, 0, 100])
        upper_green_lab = np.array([255, 120, 255])
        mask_lab = cv2.inRange(lab, lower_green_lab, upper_green_lab)
        
        # Combine masks
        green_mask = cv2.bitwise_or(mask_hsv, mask_lab)
        
        # Apply edge-preserving filter to reduce noise
        green_mask = cv2.medianBlur(green_mask, 5)
        
        # Morphological operations for cleanup
        kernel_small = np.ones((2,2), np.uint8)
        kernel_large = np.ones((4,4), np.uint8)
        
        # Close small gaps
        green_mask = cv2.morphologyEx(green_mask, cv2.MORPH_CLOSE, kernel_small)
        # Remove small noise
        green_mask = cv2.morphologyEx(green_mask, cv2.MORPH_OPEN, kernel_small)
        # Smooth edges
        green_mask = cv2.morphologyEx(green_mask, cv2.MORPH_CLOSE, kernel_large)
        
        # Create alpha mask (white = keep, black = remove)
        alpha_mask = cv2.bitwise_not(green_mask)
        
        # Apply edge feathering for smooth transitions
        alpha_mask = cv2.GaussianBlur(alpha_mask, (3, 3), 0)
        
        # Write the mask frame
        mask_out.write(alpha_mask)
        
        # Progress indicator
        if frame_count % 30 == 0:
            progress = (frame_count / total_frames) * 100
            print(f"🔄 Creating mask: {progress:.1f}% ({frame_count}/{total_frames} frames)")
    
    # Release everything
    cap.release()
    mask_out.release()
    cv2.destroyAllWindows()
    
    print(f"✅ Alpha mask creation completed!")
    return True

def create_composite_video():
    """Create the final composite video with slide background and avatar overlay using professional masking."""
    print("🎥 Creating composite video...")
    
    # File paths
    slide_image = "base_slide_image.jpg"
    avatar_video_original = "elai_green_screen_video_20250805_134324.mp4"
    mask_video_path = "avatar_mask.mp4"
    final_output = f"composite_video_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp4"
    
    try:
        # Step 1: Create professional alpha mask
        print("\n🟢 Step 1: Creating professional alpha mask...")
        if not create_professional_mask(avatar_video_original, mask_video_path):
            return False
        
        # Step 2: Load the avatar video (for duration and audio)
        print("\n🎬 Step 2: Loading avatar video...")
        avatar_clip = VideoFileClip(avatar_video_original)
        duration = avatar_clip.duration
        audio = avatar_clip.audio
        avatar_width, avatar_height = avatar_clip.size
        print(f"📊 Avatar video duration: {duration:.2f} seconds")
        print(f"📊 Avatar dimensions: {avatar_width}x{avatar_height}")
        
        # Step 3: Create slide video (resize to match avatar dimensions)
        print("\n🖼️ Step 3: Creating slide video...")
        slide_clip = ImageClip(slide_image, duration=duration).resize((avatar_width, avatar_height))
        print(f"📊 Slide resized to: {avatar_width}x{avatar_height}")
        
        # Step 4: Load the alpha mask
        print("\n🎭 Step 4: Loading alpha mask...")
        mask_clip = VideoFileClip(mask_video_path, has_mask=False)
        
        # Step 5: Apply professional masking using MoviePy
        print("\n📍 Step 5: Applying professional chroma key...")
        
        # Use MoviePy's mask functionality for professional compositing
        def make_frame_with_mask(get_frame, get_mask):
            def new_get_frame(t):
                frame = get_frame(t)
                mask = get_mask(t)
                # Convert mask to 0-1 range and apply to alpha channel
                alpha = mask[:, :, 0] / 255.0  # Use first channel of mask
                # Create RGBA frame
                result = np.dstack([frame, (alpha * 255).astype(np.uint8)])
                return result
            return new_get_frame
        
        # Apply mask to avatar
        avatar_with_mask = avatar_clip.set_mask(mask_clip.to_mask())
        
        # Step 6: Create composite with proper layering
        print("\n🎬 Step 6: Creating composite...")
        composite = CompositeVideoClip([slide_clip, avatar_with_mask], size=(avatar_width, avatar_height))
        
        # Step 7: Add original audio
        print("\n🔊 Step 7: Adding audio...")
        composite = composite.set_audio(audio)
        
        # Step 8: Write final video
        print(f"\n💾 Step 8: Rendering final video: {final_output}")
        print("⏳ This may take a few minutes...")
        
        composite.write_videofile(
            final_output,
            fps=25,
            codec='libx264',
            audio_codec='aac',
            preset='medium',
            ffmpeg_params=['-pix_fmt', 'yuv420p'],
            temp_audiofile='temp-audio.m4a',
            remove_temp=True,
            verbose=False,
            logger=None
        )
        
        # Cleanup
        avatar_clip.close()
        mask_clip.close()
        slide_clip.close()
        composite.close()
        
        # Get file size
        file_size_mb = os.path.getsize(final_output) / (1024 * 1024)
        
        print(f"\n🎉 Composite video created successfully!")
        print(f"📁 Output file: {final_output}")
        print(f"📊 File size: {file_size_mb:.2f} MB")
        print(f"⏱️ Duration: {duration:.2f} seconds")
        
        # Cleanup temporary files
        if os.path.exists(mask_video_path):
            os.remove(mask_video_path)
            print(f"🧹 Cleaned up temporary file: {mask_video_path}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating composite video: {str(e)}")
        return False

def main():
    """Main function."""
    print("🚀 Video Composite Creator")
    print("=" * 50)
    
    # Check if required files exist
    if not check_files():
        print("\n💡 Make sure you have:")
        print("   - base_slide_image.jpg (your slide image)")
        print("   - elai_green_screen_video_20250805_134324.mp4 (avatar video)")
        sys.exit(1)
    
    # Create composite video
    success = create_composite_video()
    
    if success:
        print("\n✅ All done! Your composite video is ready.")
        print("🎬 The video combines your slide with the avatar overlay and includes the original audio.")
    else:
        print("\n❌ Failed to create composite video.")
        sys.exit(1)

if __name__ == "__main__":
    main() 