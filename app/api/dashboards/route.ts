import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getDashboardsByUser, createDashboard } from '@/lib/db';
import { syncUser } from '@/lib/auth';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Sync user to our database
    await syncUser();
    
    const dashboards = await getDashboardsByUser(userId);
    return NextResponse.json(dashboards);
  } catch (error) {
    console.error('Error fetching dashboards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboards' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Sync user to our database
    await syncUser();
    
    const body = await request.json();
    const { title, description } = body;
    
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }
    
    const id = await createDashboard(userId, title, description);
    return NextResponse.json({ id, success: true });
  } catch (error) {
    console.error('Error creating dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to create dashboard' },
      { status: 500 }
    );
  }
}
