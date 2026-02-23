/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json(
    { 
      message: 'ElevenLabs TTS API endpoint',
      usage: 'Send POST request with { "text": "your text here" }',
      status: 'ready'
    },
    { status: 200 }
  );
}

// Named export for POST method (required for Next.js App Router)
export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    
    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      console.error('❌ Invalid text input');
      return NextResponse.json(
        { error: 'Invalid text input' },
        { status: 400 }
      );
    }
    
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
    
    if (!ELEVENLABS_API_KEY) {
      console.error('❌ ElevenLabs API key not configured');
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured', fallback: true },
        { status: 500 }
      );
    }

    console.log('🔊 Generating speech with ElevenLabs...');
    console.log('📝 Text length:', text.length, 'characters');
    console.log('🎤 Voice ID:', VOICE_ID);

    // Increased timeout to 30 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      // VERIFIED CORRECT ENDPOINT - v1 is the current stable API version
      const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;
      console.log('🌐 API URL:', apiUrl);
      
      const requestBody = {
        text: text.trim(),
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: true
        }
      };

      console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('📡 Response status:', response.status);
      console.log('📋 Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ ElevenLabs API error:', response.status);
        console.error('❌ Error details:', errorText);
        
        let errorMessage = 'ElevenLabs API error';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.detail?.message || errorJson.message || errorText;
          console.error('❌ Parsed error:', errorMessage);
        } catch (parseError) {
          console.error('❌ Could not parse error response');
          errorMessage = errorText;
        }
        
        return NextResponse.json(
          { 
            error: `ElevenLabs API error: ${response.status}`,
            details: errorMessage,
            fallback: true
          },
          { status: response.status }
        );
      }

      const audioBuffer = await response.arrayBuffer();
      
      if (audioBuffer.byteLength === 0) {
        console.error('❌ Empty audio buffer received');
        return NextResponse.json(
          { error: 'Empty audio response', fallback: true },
          { status: 500 }
        );
      }
      
      console.log('✅ Speech generated successfully');
      console.log('📦 Audio size:', audioBuffer.byteLength, 'bytes');
      
      return new NextResponse(audioBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.byteLength.toString(),
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('❌ ElevenLabs API timeout (30s)');
        return NextResponse.json(
          { error: 'Request timeout', fallback: true },
          { status: 504 }
        );
      }
      
      console.error('❌ Fetch error name:', fetchError.name);
      console.error('❌ Fetch error message:', fetchError.message);
      console.error('❌ Fetch error stack:', fetchError.stack);
      
      // Return more specific error for "fetch failed"
      return NextResponse.json(
        { 
          error: 'Network error: Unable to reach ElevenLabs API',
          details: fetchError.message,
          troubleshooting: [
            'Check your internet connection',
            'Verify ElevenLabs API is accessible from your server',
            'Check if firewall is blocking outbound requests',
            'Ensure API key is valid and has credits'
          ],
          fallback: true
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('❌ TTS Error:', error.message || error);
    console.error('❌ Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate speech', 
        details: error.message,
        fallback: true 
      },
      { status: 500 }
    );
  }
}