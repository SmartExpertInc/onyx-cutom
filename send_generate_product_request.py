#!/usr/bin/env python3
"""
Script to send POST request to generate-product API endpoint
and save the response for analysis.
"""

import requests
import json
from datetime import datetime
import os

def send_generate_product_request():
    """Send POST request to generate-product API and save response."""
    
    # API endpoint
    url = "https://dev.smartexpert.net/api/v1/generate-product"
    
    # Request data
    token = "$2y$12$r5QySSqmYsCvg9DczLhx0ewIhoTsYwNDDD4P8XuHNswtNpEdjQOYm"
    email = "mykolavolyn3ts@gmail.com"
    file_path = "file.json"
    
    # Check if file exists
    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' not found!")
        return
    
    try:
        # Prepare the request
        data = {
            'token': token,
            'email': email
        }
        
        # Open and send the file
        with open(file_path, 'rb') as file:
            files = {
                'file': ('file.json', file, 'application/json')
            }
            
            print(f"Sending POST request to {url}")
            print(f"Data: token={token[:20]}..., email={email}")
            print(f"File: {file_path}")
            
            # Send the request
            response = requests.post(url, data=data, files=files, timeout=60)
            
            # Generate timestamp for filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            response_file = f"generate_product_response_{timestamp}.txt"
            
            # Save response to file
            with open(response_file, 'w', encoding='utf-8') as f:
                f.write(f"Request Details:\n")
                f.write(f"URL: {url}\n")
                f.write(f"Method: POST\n")
                f.write(f"Token: {token}\n")
                f.write(f"Email: {email}\n")
                f.write(f"File: {file_path}\n")
                f.write(f"Timestamp: {datetime.now().isoformat()}\n")
                f.write(f"\n{'='*50}\n\n")
                
                f.write(f"Response Details:\n")
                f.write(f"Status Code: {response.status_code}\n")
                f.write(f"Status: {'SUCCESS' if response.status_code == 200 else 'ERROR'}\n")
                f.write(f"Headers:\n")
                for header, value in response.headers.items():
                    f.write(f"  {header}: {value}\n")
                f.write(f"\n{'='*50}\n\n")
                
                f.write(f"Response Body:\n")
                try:
                    # Try to parse as JSON for pretty printing
                    json_response = response.json()
                    f.write(json.dumps(json_response, indent=2, ensure_ascii=False))
                except json.JSONDecodeError:
                    # If not JSON, write raw text
                    f.write(response.text)
            
            print(f"\nRequest completed!")
            print(f"Status Code: {response.status_code}")
            print(f"Response saved to: {response_file}")
            
            if response.status_code == 200:
                print("✅ Request successful!")
            else:
                print(f"❌ Request failed with status {response.status_code}")
                
    except requests.exceptions.Timeout:
        print("❌ Request timed out!")
    except requests.exceptions.ConnectionError:
        print("❌ Connection error!")
    except requests.exceptions.RequestException as e:
        print(f"❌ Request error: {e}")
    except FileNotFoundError:
        print(f"❌ File '{file_path}' not found!")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    send_generate_product_request() 