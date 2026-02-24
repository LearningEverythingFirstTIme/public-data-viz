'use client';

export const dynamic = 'force-dynamic';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Edit2, Loader2 } from 'lucide-react';
import { useDashboard } from '@/lib/hooks/useDashboards';
import { Navbar } from '@/components/layout/Navbar';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardViewPageProps {
  params: Promise<{ id: string }>;
}

function DashboardViewContent({ id }: { id: string }) {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { dashboard, loading } = useDashboard(id);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00D4AA] animate-spin" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-[#0A0C10]">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Dashboard not found</h1>
            <p className="text-gray-400 mb-8">The dashboard you're looking for doesn't exist or you don't have access to it.</p>
            <Button
              onClick={() => router.push('/dashboard')}
              className="bg-[#00D4AA] text-[#0A0C10] hover:bg-[#00D4AA]/90"
            >
              Go to My Dashboards
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Check if user has access
  const isOwner = user?.id === dashboard.userId;
  const canView = dashboard.isPublic || isOwner;

  if (!canView) {
    return (
      <div className="min-h-screen bg-[#0A0C10]">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Private Dashboard</h1>
            <p className="text-gray-400 mb-8">This dashboard is private. Sign in to view it.</p>
            <Button
              onClick={() => router.push('/login')}
              className="bg-[#00D4AA] text-[#0A0C10] hover:bg-[#00D4AA]/90"
            >
              Sign In
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0C10]">
      <Navbar />

      {/* Header */}
      <div className="border-b border-[#1E2330]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">{dashboard.name}</h1>
              {dashboard.description && (
                <p className="text-gray-400">{dashboard.description}</p>
              )}
              <div className="flex items-center gap-4 mt-4">
                <span className="text-sm text-gray-500">
                  {dashboard.widgets.length} widgets
                </span>
                <span className="text-sm text-gray-500">
                  Last updated {new Date(dashboard.updatedAt).toLocaleDateString()}
                </span>
                {dashboard.isPublic && (
                  <span className="px-2 py-1 text-xs rounded-full bg-[#00D4AA]/10 text-[#00D4AA]">
                    Public
                  </span>
                )}
              </div>
            </div>

            {isOwner && (
              <Button
                onClick={() => router.push(`/dashboard/${id}/edit`)}
                className="bg-[#00D4AA] text-[#0A0C10] hover:bg-[#00D4AA]/90"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {dashboard.widgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-[#1E2330] rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-2">No widgets yet</h3>
            <p className="text-gray-400 text-center max-w-md">
              This dashboard doesn't have any widgets yet.
            </p>
            {isOwner && (
              <Button
                onClick={() => router.push(`/dashboard/${id}/edit`)}
                className="mt-6 bg-[#00D4AA] text-[#0A0C10] hover:bg-[#00D4AA]/90"
              >
                Add Widgets
              </Button>
            )}
          </div>
        ) : (
          <DashboardGrid
            widgets={dashboard.widgets}
            layout={dashboard.layout}
            isEditing={false}
          />
        )}
      </main>
    </div>
  );
}

export default function DashboardViewPage({ params }: DashboardViewPageProps) {
  const { id } = use(params);
  
  // Check if Clerk is configured
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isClerkConfigured = publishableKey && !publishableKey.includes('dummy');

  if (!isClerkConfigured) {
    return (
      <div className="min-h-screen bg-[#0A0C10]">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Card className="bg-[#13161E] border-[#1E2330]">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <h1 className="text-2xl font-bold text-white mb-4">Authentication Required</h1>
              <p className="text-gray-400 text-center max-w-md">
                Please configure Clerk authentication to view dashboards. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY in your environment.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return <DashboardViewContent id={id} />;
}
