'use client';

export const dynamic = 'force-dynamic';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Plus, Edit2, Eye, Share2, Loader2 } from 'lucide-react';
import { useDashboard } from '@/lib/hooks/useDashboards';
import { Navbar } from '@/components/layout/Navbar';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { WidgetConfigPanel } from '@/components/dashboard/WidgetConfigPanel';
import { WidgetConfig, WidgetLayout } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardEditPageProps {
  params: Promise<{ id: string }>;
}

function DashboardEditContent({ id }: { id: string }) {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { dashboard, loading, updateWidgets, updateDashboard } = useDashboard(id);
  
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [layout, setLayout] = useState<WidgetLayout[]>([]);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<WidgetConfig | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync local state with dashboard data
  useEffect(() => {
    if (dashboard) {
      setWidgets(dashboard.widgets);
      setLayout(dashboard.layout);
    }
  }, [dashboard]);

  const handleAddWidget = () => {
    setEditingWidget(null);
    setIsConfigOpen(true);
  };

  const handleEditWidget = (widget: WidgetConfig) => {
    console.log('[DashboardEditPage] handleEditWidget called for widget:', widget.id);
    setEditingWidget(widget);
    setIsConfigOpen(true);
  };

  const handleSaveWidget = (widget: WidgetConfig) => {
    let newWidgets: WidgetConfig[];
    let newLayout: WidgetLayout[];

    if (editingWidget) {
      // Update existing widget
      newWidgets = widgets.map((w) => (w.id === widget.id ? widget : w));
      newLayout = layout;
    } else {
      // Add new widget
      newWidgets = [...widgets, widget];
      // Add default layout for new widget
      const newLayoutItem: WidgetLayout = {
        i: widget.id,
        x: (widgets.length * 2) % 12,
        y: Infinity, // Puts it at the bottom
        w: 6,
        h: 8,
        minW: 3,
        minH: 4,
      };
      newLayout = [...layout, newLayoutItem];
    }

    setWidgets(newWidgets);
    setLayout(newLayout);
    setHasChanges(true);
    setIsConfigOpen(false);
  };

  const handleDeleteWidget = (widgetId: string) => {
    console.log('[DashboardEditPage] handleDeleteWidget called for widget:', widgetId);
    const newWidgets = widgets.filter((w) => w.id !== widgetId);
    const newLayout = layout.filter((l) => l.i !== widgetId);
    setWidgets(newWidgets);
    setLayout(newLayout);
    setHasChanges(true);
  };

  const handleLayoutChange = (newLayout: WidgetLayout[]) => {
    setLayout(newLayout);
    setHasChanges(true);
  };

  const handleSaveDashboard = async () => {
    await updateWidgets(widgets, layout);
    setHasChanges(false);
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00D4AA] animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center">
        <p className="text-gray-400">Dashboard not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0C10]">
      <Navbar />

      {/* Toolbar */}
      <div className="sticky top-16 z-30 bg-[#0A0C10]/95 backdrop-blur border-b border-[#1E2330]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="border-[#1E2330] text-gray-300 hover:bg-[#1E2330]"
              >
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-white">{dashboard.name}</h1>
                <p className="text-sm text-gray-500">Editing mode</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsSettingsOpen(true)}
                className="border-[#1E2330] text-gray-300 hover:bg-[#1E2330]"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Settings
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/${id}`)}
                className="border-[#1E2330] text-gray-300 hover:bg-[#1E2330]"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              
              <Button
                onClick={handleAddWidget}
                className="bg-[#00D4AA] text-[#0A0C10] hover:bg-[#00D4AA]/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Widget
              </Button>
              
              {hasChanges && (
                <Button
                  onClick={handleSaveDashboard}
                  className="bg-[#F5A623] text-[#0A0C10] hover:bg-[#F5A623]/90"
                >
                  Save Changes
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {widgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-[#1E2330] rounded-xl">
            <div className="w-16 h-16 rounded-full bg-[#1E2330] flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No widgets yet</h3>
            <p className="text-gray-400 text-center max-w-md mb-6">
              Add your first widget to start visualizing data
            </p>
            <Button
              onClick={handleAddWidget}
              className="bg-[#00D4AA] text-[#0A0C10] hover:bg-[#00D4AA]/90"
            >
              Add Widget
            </Button>
          </div>
        ) : (
          <DashboardGrid
            widgets={widgets}
            layout={layout}
            isEditing={true}
            onLayoutChange={handleLayoutChange}
            onEditWidget={handleEditWidget}
            onDeleteWidget={handleDeleteWidget}
          />
        )}
      </main>

      {/* Widget Config Panel */}
      <WidgetConfigPanel
        widget={editingWidget}
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onSave={handleSaveWidget}
      />

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="bg-[#13161E] border-[#1E2330]">
          <DialogHeader>
            <DialogTitle className="text-white">Dashboard Settings</DialogTitle>
            <DialogDescription className="text-gray-400">
              Manage your dashboard visibility and sharing options
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Public Dashboard</Label>
                <p className="text-sm text-gray-500">
                  Make this dashboard visible to anyone with the link
                </p>
              </div>
              <Switch
                checked={dashboard.isPublic}
                onCheckedChange={(checked) => {
                  updateDashboard({ isPublic: checked });
                }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function DashboardEditPage({ params }: DashboardEditPageProps) {
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
                Please configure Clerk authentication to edit dashboards. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY in your environment.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return <DashboardEditContent id={id} />;
}
