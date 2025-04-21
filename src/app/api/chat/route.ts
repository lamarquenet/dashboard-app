import { NextRequest, NextResponse } from 'next/server';

// Removed the unused streamToReadableStream helper function

export async function POST(request: NextRequest) {
  let formDataFromRequest: FormData;
  try {
    formDataFromRequest = await request.formData();
  } catch (error) {
    console.error('Error parsing form data:', error);
    return NextResponse.json({ error: 'Failed to parse form data.' }, { status: 400 });
  }

  const model = formDataFromRequest.get('model') as string | null;
  const message = formDataFromRequest.get('message') as string | null;
  const imageFile = formDataFromRequest.get('image') as File | null;

  if (!model || !message) {
    return NextResponse.json({ error: 'Missing required fields: model and message' }, { status: 400 });
  }

  const payload: { model: string; messages: { role: string; content: string; images?: string[] }[]; stream: boolean } = {
    model: model,
    messages: [
      {
        role: 'user',
        content: message,
      }
    ],
    stream: true, // Ensure streaming is enabled
  };

  if (imageFile) {
    try {
      const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
      const base64Image = imageBuffer.toString('base64');
      payload.messages[0].images = [base64Image];
    } catch (error) {
        console.error('Error processing image file:', error);
        return NextResponse.json({ error: 'Failed to process image file.' }, { status: 500 });
    }
  }

  try {
    // Use native fetch to call Ollama
    const ollamaResponse = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      // duplex: 'half' // Required for streaming request body in some environments, might not be needed for Next.js edge/node
    });

    // Check if the request to Ollama was successful
    if (!ollamaResponse.ok) {
      const errorBody = await ollamaResponse.text();
      console.error(`Error from Ollama: ${ollamaResponse.status} ${ollamaResponse.statusText}`, errorBody);
      return NextResponse.json(
        { error: 'Error forwarding request to Ollama.', details: errorBody },
        { status: ollamaResponse.status }
      );
    }

    // Check if the response body exists and is a ReadableStream
    if (!ollamaResponse.body) {
        console.error('Ollama response body is null');
        return NextResponse.json({ error: 'Received empty response body from Ollama.' }, { status: 500 });
    }

    // Return the stream directly from Ollama
    // Set appropriate headers for streaming
    const headers = new Headers({
        'Content-Type': 'application/x-ndjson', // Ollama streams newline-delimited JSON
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });

    return new NextResponse(ollamaResponse.body, {
      status: 200,
      headers: headers,
    });

  } catch (error: any) {
    console.error('Error fetching from Ollama:', error);
    return NextResponse.json(
        { error: 'Failed to connect or process request with Ollama.', details: error.message },
        { status: 500 }
    );
  }
}