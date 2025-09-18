import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract all form fields
    const eventData = {
      eventName: formData.get('eventName') as string,
      mainSpeaker: formData.get('mainSpeaker') as string,
      speakerDescription: formData.get('speakerDescription') as string,
      date: formData.get('date') as string,
      topic: formData.get('topic') as string,
      additionalSpeakers: formData.get('additionalSpeakers') as string,
      ticketPrice: formData.get('ticketPrice') as string,
      ticketType: formData.get('ticketType') as string,
      freeAccessConditions: formData.get('freeAccessConditions') as string,
      speakerImage: formData.get('speakerImage') as string | null,
    };

    // Store the data in a temporary session or pass it to the results page
    // For now, we'll redirect to the results page with a session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // In a real application, you would store this in a database or session store
    // For this demo, we'll use a simple in-memory store
    if (typeof global !== 'undefined') {
      (global as any).eventPosterSessions = (global as any).eventPosterSessions || new Map();
      (global as any).eventPosterSessions.set(sessionId, eventData);
    }

    // Redirect to results page with session ID
    return NextResponse.redirect(new URL(`/custom-projects-ui/create/event-poster/results?sessionId=${sessionId}`, request.url));
    
  } catch (error) {
    console.error('Error processing event poster data:', error);
    return NextResponse.json({ error: 'Failed to process form data' }, { status: 500 });
  }
}
