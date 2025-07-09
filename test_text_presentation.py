import requests
import json

# Test the text presentation generate endpoint
url = "http://localhost:8001/api/custom/text-presentation/generate"

# Payload that should cause 422 error (missing aiResponse)
payload = {
    "prompt": "Create a text presentation about AI",
    "language": "en",
    "fromFiles": False,
    "fromText": True,
    "folderIds": "",
    "fileIds": "",
    "textMode": "context",
    "userText": "This is some sample text for context"
}

print("Sending request to:", url)
print("Payload:", json.dumps(payload, indent=2))

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}") 