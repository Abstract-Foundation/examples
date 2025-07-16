import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Extract geo-location data from Vercel headers
  const country = request.headers.get('x-vercel-ip-country');
  const region = request.headers.get('x-vercel-ip-country-region');
  const city = request.headers.get('x-vercel-ip-city');

  return NextResponse.json({
    country,
    region,
    city,
    detected: !!country,
  });
}