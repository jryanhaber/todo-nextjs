// app/api/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { WorkflowItem } from '@/lib/types';
import { saveItem, fetchItems, deleteItem } from '@/lib/firebase-store';

export async function GET(request: NextRequest) {
  try {
    // Verify auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const userId = await verifyToken(token);

    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Fetch user's items
    const items = await fetchItems({ userId });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Sync GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const userId = await verifyToken(token);

    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get items from request body
    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items format' }, { status: 400 });
    }

    // Process each item
    const savePromises = items.map(async (item: WorkflowItem) => {
      return saveItem(item, userId);
    });

    await Promise.all(savePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sync POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const userId = await verifyToken(token);

    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get item ID from request body
    const body = await request.json();
    const { itemId } = body;

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    // Delete the item
    await deleteItem(itemId, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sync DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
