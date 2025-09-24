import requests
import json
import datetime

def send_workspace_owner_request():
    # Endpoint URL
    url = "https://dev.smartexpert.net/store-workspace-owner"
    
    # Request data
    data = {
        "name": "Mykola Volynets",
        "email": "mykolavolyn3ts@gmail.com",
        "token": ""
    }
    
    # Headers for the request
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Python Script"
    }
    
    try:
        print(f"Sending GET request to: {url}")
        print(f"Request data: {json.dumps(data, indent=2)}")
        print("-" * 50)
        
        # Send GET request
        response = requests.get(url, params=data, headers=headers)
        
        # Print response status and headers
        print(f"Response Status Code: {response.status_code}")
        print(f"Response Headers:")
        for header, value in response.headers.items():
            print(f"  {header}: {value}")
        
        print("-" * 50)
        
        # Save full response to file
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"workspace_owner_response_{timestamp}.txt"
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(f"=== WORKSPACE OWNER API RESPONSE ===\n")
            f.write(f"Timestamp: {datetime.datetime.now().isoformat()}\n")
            f.write(f"URL: {url}\n")
            f.write(f"Status Code: {response.status_code}\n")
            f.write(f"Response Headers:\n")
            for header, value in response.headers.items():
                f.write(f"  {header}: {value}\n")
            f.write(f"\n=== RESPONSE BODY ===\n")
            f.write(response.text)
            f.write(f"\n=== RESPONSE METADATA ===\n")
            f.write(f"Response URL: {response.url}\n")
            f.write(f"Response Encoding: {response.encoding}\n")
            f.write(f"Response Elapsed Time: {response.elapsed}\n")
        
        print(f"Full response saved to: {filename}")
        
        # Print response body (truncated for console)
        print("Response Body (first 500 chars):")
        print(response.text[:500])
        if len(response.text) > 500:
            print(f"... (truncated, full response saved to {filename})")
        
        print("-" * 50)
        
        # Print raw response info
        print(f"Response URL: {response.url}")
        print(f"Response Encoding: {response.encoding}")
        print(f"Response Elapsed Time: {response.elapsed}")
        
    except requests.exceptions.RequestException as e:
        print(f"Error sending request: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    send_workspace_owner_request() 