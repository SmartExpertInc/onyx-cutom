#!/usr/bin/env python3
"""
Script to rebuild the custom frontend container with new configuration
"""

import subprocess
import sys
import time

def run_command(command):
    """Run a shell command and return the result"""
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"Error running command '{command}': {e}")
        print(f"Error output: {e.stderr}")
        return None

def main():
    print("Rebuilding custom frontend container with new configuration...")
    
    # Stop custom frontend container
    print("Stopping custom frontend container...")
    result = run_command("docker compose -f deployment/docker_compose/docker-compose.yml stop custom_frontend")
    if result is None:
        print("Failed to stop custom frontend container")
        sys.exit(1)
    
    # Remove the old container to force rebuild
    print("Removing old custom frontend container...")
    result = run_command("docker compose -f deployment/docker_compose/docker-compose.yml rm -f custom_frontend")
    if result is None:
        print("Failed to remove custom frontend container")
        sys.exit(1)
    
    # Rebuild and start custom frontend container
    print("Rebuilding and starting custom frontend container...")
    result = run_command("docker compose -f deployment/docker_compose/docker-compose.yml up -d --build custom_frontend")
    if result is None:
        print("Failed to rebuild custom frontend container")
        sys.exit(1)
    
    print("Custom frontend container rebuilt successfully!")
    print("The new configuration should now be active.")
    print("You can check the frontend logs with:")
    print("docker compose -f deployment/docker_compose/docker-compose.yml logs custom_frontend")

if __name__ == "__main__":
    main() 