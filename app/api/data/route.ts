import { NextRequest, NextResponse } from 'next/server';

const dataStore: string[] = []; 

export async function GET() {
  return NextResponse.json({ data: dataStore });
}

export async function POST(req: NextRequest) {
  const { item } = await req.json();
  dataStore.push(item);
  return NextResponse.json({ message: 'Item added', data: dataStore });
}
