import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    asi: process.env.ASI_API_KEY
  });
}
