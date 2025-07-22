// Simple logout API route for custom_extensions
export async function POST() {
  try {
    // Create response with cleared cookies
    const response = new Response(null, { status: 204 });
    
    // Clear authentication cookies
    const cookiesToDelete = ["fastapiusersauth", "session", "auth_token"];
    const cookieHeaders: string[] = [];
    
    cookiesToDelete.forEach((cookieName) => {
      cookieHeaders.push(`${cookieName}=; Max-Age=0; path=/; httpOnly=true; sameSite=lax`);
    });
    
    // Set headers to clear cookies
    cookieHeaders.forEach((cookie, index) => {
      response.headers.set(index === 0 ? "Set-Cookie" : `Set-Cookie-${index}`, cookie);
    });
    
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return new Response(null, { status: 204 });
  }
} 