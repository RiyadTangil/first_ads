import { NextRequest, NextResponse } from 'next/server';

// Define global io type
declare global {
  var _io: any;
}

// Handle Socket.IO HTTP requests - both GET and POST
export async function GET(req: NextRequest) {
  try {
    // If we're using a custom server, just return a success response
    // The actual Socket.IO connections are handled by the custom server
    if (global._io) {
      return new NextResponse(
        JSON.stringify({ success: true, message: 'Socket.IO server running in custom server mode' }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      );
    } else {
      console.error('Socket.IO server not initialized in custom server');
      return NextResponse.json(
        { 
          success: false, 
          message: 'Socket.IO server not available',
          info: 'Please make sure you are running the application with the custom server.js'
        },
        { 
          status: 503, 
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      );
    }
  } catch (error: any) {
    console.error('Error in Socket.IO route handler:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { 
        status: 500, 
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
