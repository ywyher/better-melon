import { NextRequest } from 'next/server';

export function HEAD(req: NextRequest) {
  // Return a simple 200 OK with no body
  return new Response(null, {
    status: 200,
  });
}