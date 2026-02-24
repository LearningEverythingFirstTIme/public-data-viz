import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { updateWidget, deleteWidget, getDashboardById } from '@/lib/db';
import { sql } from '@vercel/postgres';

// Helper function to check if user owns the widget's dashboard
async function checkWidgetOwnership(widgetId: string, userId: string): Promise<boolean> {
  const result = await sql`
    SELECT d.user_id
    FROM widgets w
    JOIN dashboards d ON w.dashboard_id = d.id
    WHERE w.id = ${widgetId}
  `;
  
  if (result.rows.length === 0) return false;
  return result.rows[0].user_id === userId;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check ownership before allowing update
    const isOwner = await checkWidgetOwnership(id, userId);
    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden - you do not own this widget' }, { status: 403 });
    }
    
    const body = await request.json();
    const { widget } = body;
    
    if (!widget) {
      return NextResponse.json(
        { error: 'Widget data is required' },
        { status: 400 }
      );
    }
    
    await updateWidget(id, widget);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating widget:', error);
    return NextResponse.json(
      { error: 'Failed to update widget' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check ownership before allowing delete
    const isOwner = await checkWidgetOwnership(id, userId);
    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden - you do not own this widget' }, { status: 403 });
    }
    
    await deleteWidget(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting widget:', error);
    return NextResponse.json(
      { error: 'Failed to delete widget' },
      { status: 500 }
    );
  }
}
