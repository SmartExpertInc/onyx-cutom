import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    
    // Retrieve data from session store
    if (typeof global !== 'undefined' && (global as any).eventPosterSessions) {
      const eventData = (global as any).eventPosterSessions.get(sessionId);
      
      if (eventData) {
        // Clean up the session data after retrieval
        (global as any).eventPosterSessions.delete(sessionId);
        return NextResponse.json(eventData);
      }
    }
    
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    
  } catch (error) {
    console.error('Error retrieving session data:', error);
    return NextResponse.json({ error: 'Failed to retrieve session data' }, { status: 500 });
  }
}
