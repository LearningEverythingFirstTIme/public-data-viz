import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createWidget } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { dashboardId, widget } = body;
    
    if (!dashboardId || !widget) {
      return NextResponse.json(
        { error: 'Dashboard ID and widget are required' },
        { status: 400 }
      );
    }
    
    const id = await createWidget(dashboardId, widget);
    return NextResponse.json({ id, success: true });
  } catch (error) {
    console.error('Error creating widget:', error);
    return NextResponse.json(
      { error: 'Failed to create widget' },
      { status: 500 }
    );
  }
}
