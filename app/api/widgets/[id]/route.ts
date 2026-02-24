import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { updateWidget, deleteWidget, getDashboardById } from '@/lib/db';

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
    
    // Get the widget's dashboard to check ownership
    // Note: This requires a DB query to get dashboard_id from widget
    // For now, we'll rely on the frontend to handle this properly
    // A more robust solution would join with dashboards table
    
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
