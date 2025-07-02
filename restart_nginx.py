#!/usr/bin/env python3
"""
Script to restart the nginx container to apply new configuration
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
    print("Restarting nginx container to apply new configuration...")
    
    # Stop nginx container
    print("Stopping nginx container...")
    result = run_command("docker compose -f deployment/docker_compose/docker-compose.yml stop nginx")
    if result is None:
        print("Failed to stop nginx container")
        sys.exit(1)
    
    # Wait a moment
    time.sleep(2)
    
    # Start nginx container
    print("Starting nginx container...")
    result = run_command("docker compose -f deployment/docker_compose/docker-compose.yml up -d nginx")
    if result is None:
        print("Failed to start nginx container")
        sys.exit(1)
    
    print("Nginx container restarted successfully!")
    print("The new configuration should now be active.")
    print("You can check the nginx logs with:")
    print("docker compose -f deployment/docker_compose/docker-compose.yml logs nginx")

if __name__ == "__main__":
    main() 