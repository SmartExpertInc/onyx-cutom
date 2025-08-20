import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyToOnyx(request, params.path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyToOnyx(request, params.path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyToOnyx(request, params.path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyToOnyx(request, params.path, 'DELETE');
}

async function proxyToOnyx(
  request: NextRequest,
  pathArray: string[],
  method: string
) {
  try {
    // Get the host from the request to construct the main Onyx URL
    const host = request.headers.get('host') || 'localhost';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const onyxBaseUrl = `${protocol}://${host}`;
    
    // Construct the target URL
    const path = pathArray.join('/');
    const targetUrl = `${onyxBaseUrl}/api/manage/${path}`;
    
    // Add query parameters if any
    const url = new URL(request.url);
    const queryString = url.search;
    const fullTargetUrl = targetUrl + queryString;
    
    // Prepare headers (forward cookies and other important headers)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Forward cookies
    const cookies = request.headers.get('cookie');
    if (cookies) {
      headers['Cookie'] = cookies;
    }
    
    // Forward CSRF token if present
    const csrfToken = request.headers.get('x-csrftoken');
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }
    
    // Prepare the request body for POST/PUT requests
    let body: string | undefined;
    if (method === 'POST' || method === 'PUT') {
      try {
        const requestBody = await request.text();
        body = requestBody;
      } catch (error) {
        console.error('Error reading request body:', error);
      }
    }
    
    // Make the request to Onyx
    const response = await fetch(fullTargetUrl, {
      method,
      headers,
      body,
    });
    
    // Forward the response
    const responseData = await response.text();
    
    return new NextResponse(responseData, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
    
  } catch (error) {
    console.error('Error proxying to Onyx:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to Onyx' },
      { status: 500 }
    );
  }
} 