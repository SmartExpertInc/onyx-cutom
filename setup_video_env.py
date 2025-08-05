#!/usr/bin/env python3
"""
Video Environment Setup
======================

This script sets up the correct dependencies for video processing,
avoiding NumPy 2.x compatibility issues.
"""

import subprocess
import sys

def run_command(command):
    """Run a command and print output."""
    print(f"Running: {command}")
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
        return False
    print(f"Success: {result.stdout}")
    return True

def main():
    print("Setting up video processing environment...")
    
    # Uninstall problematic packages first
    print("\n1. Cleaning up existing installations...")
    subprocess.run("pip uninstall -y numpy scipy matplotlib moviepy opencv-python", shell=True)
    
    # Install compatible versions
    print("\n2. Installing compatible versions...")
    
    commands = [
        "pip install numpy==1.24.3",
        "pip install opencv-python==4.8.1.78", 
        "pip install moviepy==1.0.3",
    ]
    
    for cmd in commands:
        if not run_command(cmd):
            print(f"Failed to execute: {cmd}")
            sys.exit(1)
    
    print("\n✅ Video environment setup complete!")
    print("Now you can run: python create_composite_video.py")

if __name__ == "__main__":
    main() 