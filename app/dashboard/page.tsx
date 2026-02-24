'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Plus, MoreVertical, Edit2, Trash2, Globe, Lock, Loader2 } from 'lucide-react';
import { useDashboards } from '@/lib/hooks/useDashboards';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

function DashboardListContent() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { dashboards, loading, createDashboard, deleteDashboard } = useDashboards(
    user?.id
  );
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newDashboardName, setNewDashboardName] = useState('');
  const [newDashboardDesc, setNewDashboardDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newDashboardName.trim()) return;
    
    setCreating(true);
    const id = await createDashboard(newDashboardName, newDashboardDesc);
    setCreating(false);
    setIsCreateOpen(false);
    setNewDashboardName('');
    setNewDashboardDesc('');
    
    if (id) {
      router.push(`/dashboard/${id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteDashboard(deleteId);
      setDeleteId(null);
    }
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

  return (
    <>
      <Navbar onCreateDashboard={() => setIsCreateOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Dashboards</h1>
            <p className="text-gray-400">Create and manage your data visualizations</p>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-[#00D4AA] text-[#0A0C10] hover:bg-[#00D4AA]/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Dashboard
          </Button>
        </div>

        {dashboards.length === 0 ? (
          <Card className="bg-[#13161E] border-[#1E2330] border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-[#1E2330] flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No dashboards yet</h3>
              <p className="text-gray-400 text-center max-w-md mb-6">
                Create your first dashboard to start visualizing data from multiple sources
              </p>
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="bg-[#00D4AA] text-[#0A0C10] hover:bg-[#00D4AA]/90"
              >
                Create Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboards.map((dashboard) => (
              <Card
                key={dashboard.id}
                className="bg-[#13161E] border-[#1E2330] hover:border-[#00D4AA]/50 transition-colors group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <Link href={`/dashboard/${dashboard.id}`}>
                        <CardTitle className="text-lg font-semibold text-white truncate group-hover:text-[#00D4AA] transition-colors">
                          {dashboard.name}
                        </CardTitle>
                      </Link>
                      <CardDescription className="text-gray-400 mt-1 line-clamp-2">
                        {dashboard.description || 'No description'}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-[#1E2330] rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[#13161E] border-[#1E2330]">
                        <DropdownMenuItem
                          onClick={() => router.push(`/dashboard/${dashboard.id}/edit`)}
                          className="text-gray-300 hover:text-white hover:bg-[#1E2330] cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-[#1E2330]" />
                        <DropdownMenuItem
                          onClick={() => setDeleteId(dashboard.id)}
                          className="text-red-400 hover:text-red-400 hover:bg-red-400/10 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500">
                        {dashboard.widgets.length} widgets
                      </span>
                      <span className="flex items-center gap-1 text-gray-500">
                        {dashboard.isPublic ? (
                          <>
                            <Globe className="w-3 h-3" />
                            Public
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3" />
                            Private
                          </>
                        )}
                      </span>
                    </div>
                    <span className="text-gray-600">
                      {new Date(dashboard.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create Dashboard Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-[#13161E] border-[#1E2330]">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Dashboard</DialogTitle>
            <DialogDescription className="text-gray-400">
              Give your dashboard a name and optional description
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">Name</Label>
              <Input
                id="name"
                value={newDashboardName}
                onChange={(e) => setNewDashboardName(e.target.value)}
                placeholder="e.g., Economic Overview"
                className="bg-[#0A0C10] border-[#1E2330] text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-300">Description (optional)</Label>
              <Textarea
                id="description"
                value={newDashboardDesc}
                onChange={(e) => setNewDashboardDesc(e.target.value)}
                placeholder="Brief description of your dashboard"
                className="bg-[#0A0C10] border-[#1E2330] text-white"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              className="border-[#1E2330] text-gray-300 hover:bg-[#1E2330]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newDashboardName.trim() || creating}
              className="bg-[#00D4AA] text-[#0A0C10] hover:bg-[#00D4AA]/90"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-[#13161E] border-[#1E2330]">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Dashboard</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this dashboard? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              className="border-[#1E2330] text-gray-300 hover:bg-[#1E2330]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function DashboardListPage() {
  // Check if Clerk is configured
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isClerkConfigured = publishableKey && !publishableKey.includes('dummy');

  if (!isClerkConfigured) {
    return (
      <div className="min-h-screen bg-[#0A0C10]">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Dashboards</h1>
              <p className="text-gray-400">Create and manage your data visualizations</p>
            </div>
          </div>
          
          <Card className="bg-[#13161E] border-[#1E2330]">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-[#1E2330] flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Authentication Required</h3>
              <p className="text-gray-400 text-center max-w-md mb-6">
                Please configure Clerk authentication to use dashboards. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY in your environment.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return <DashboardListContent />;
}
