// app/api/data/route.ts
import { NextRequest, NextResponse } from 'next/server';

let dataStore: string[] = []; // simple in-memory store

export async function GET() {
  return NextResponse.json({ data: dataStore });
}

export async function POST(req: NextRequest) {
  const { item } = await req.json();
  dataStore.push(item);
  return NextResponse.json({ message: 'Item added', data: dataStore });
}
