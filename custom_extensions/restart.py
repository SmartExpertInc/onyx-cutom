import subprocess
import sys

print("Restarting custom_backend service...")
try:
    result = subprocess.run(["docker", "compose", "restart", "custom_backend"], 
                          capture_output=True, text=True, cwd=".")
    if result.returncode == 0:
        print("✅ Backend restarted successfully!")
        print(result.stdout)
    else:
        print("❌ Error restarting backend:")
        print(result.stderr)
except Exception as e:
    print(f"❌ Failed to restart: {e}") 