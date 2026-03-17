import { NextResponse } from 'next/server';
import { callASI } from '@/lib/asi';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const text = Buffer.from(buffer).toString('utf-8');

    const prompt = `
Analyze this file content and extract key concepts that would help someone studying this topic.

File content:
${text.substring(0, 10000)}
`;

    const response = await callASI(prompt);

    if (!response) {
      throw new Error("Failed to generate analysis from file");
    }

    return NextResponse.json({ extractedText: response });
  } catch (error: any) {
    console.error("Upload API error:", error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
