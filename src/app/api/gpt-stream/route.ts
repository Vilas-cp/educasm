import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { messages, stream } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = messages
      .map((msg: { role: string; content: string }) => `${msg.role}: ${msg.content}`)
      .join('\n');

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();
    const chunkSize=20;

    if (stream) {
      const encoder = new TextEncoder();

      const streamResponse = new ReadableStream({
        async start(controller) {
          const words = content.split(' ');
          let buffer = '';
          
          for (const word of words) {
            buffer += `${word} `;
            
            if (buffer.endsWith('.') || buffer.endsWith('!') || buffer.endsWith('?') || buffer.length >= chunkSize) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: buffer.trim() })}\n\n`));
              buffer = '';
            }
            
            await new Promise((resolve) => setTimeout(resolve, 100)); 
          }
          
          if (buffer) { 
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: buffer.trim() })}\n\n`));
          }
      
          controller.close();
        },
      });
      

      return new Response(streamResponse, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    } else {
      return NextResponse.json({ content });
    }
  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
}
