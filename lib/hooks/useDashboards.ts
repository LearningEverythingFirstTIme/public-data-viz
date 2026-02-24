'use client';

import { useEffect, useState, useCallback } from 'react';
import { Dashboard, WidgetConfig, WidgetLayout } from '@/types';

export function useDashboards(userId: string | undefined) {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchDashboards = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboards');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboards');
        }
        const data = await response.json();
        setDashboards(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboards();
  }, [userId]);

  const createDashboard = async (name: string, description?: string) => {
    if (!userId) return null;
    
    try {
      const response = await fetch('/api/dashboards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: name, description }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create dashboard');
      }
      
      const data = await response.json();
      
      // Refresh dashboards list
      const refreshResponse = await fetch('/api/dashboards');
      if (refreshResponse.ok) {
        const refreshedData = await refreshResponse.json();
        setDashboards(refreshedData);
      }
      
      return data.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  };

  const updateDashboard = async (id: string, updates: Partial<Dashboard>) => {
    try {
      const response = await fetch(`/api/dashboards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update dashboard');
      }
      
      // Refresh dashboards list
      const refreshResponse = await fetch('/api/dashboards');
      if (refreshResponse.ok) {
        const refreshedData = await refreshResponse.json();
        setDashboards(refreshedData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const deleteDashboard = async (id: string) => {
    try {
      const response = await fetch(`/api/dashboards/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete dashboard');
      }
      
      setDashboards((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return {
    dashboards,
    loading,
    error,
    createDashboard,
    updateDashboard,
    deleteDashboard,
  };
}

export function useDashboard(dashboardId: string) {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dashboardId) {
      setLoading(false);
      return;
    }

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/dashboards/${dashboardId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setDashboard(null);
          } else {
            throw new Error('Failed to fetch dashboard');
          }
        } else {
          const data = await response.json();
          setDashboard(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [dashboardId]);

  const updateWidgets = useCallback(async (widgets: WidgetConfig[], layout: WidgetLayout[]) => {
    if (!dashboardId) return;
    
    try {
      const response = await fetch(`/api/dashboards/${dashboardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgets, layout }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update widgets');
      }
      
      // Refresh dashboard data
      const refreshResponse = await fetch(`/api/dashboards/${dashboardId}`);
      if (refreshResponse.ok) {
        const refreshedData = await refreshResponse.json();
        setDashboard(refreshedData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [dashboardId]);

  const updateDashboard = useCallback(async (updates: Partial<Dashboard>) => {
    if (!dashboardId) return;
    
    try {
      const response = await fetch(`/api/dashboards/${dashboardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update dashboard');
      }
      
      // Refresh dashboard data
      const refreshResponse = await fetch(`/api/dashboards/${dashboardId}`);
      if (refreshResponse.ok) {
        const refreshedData = await refreshResponse.json();
        setDashboard(refreshedData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [dashboardId]);

  const refetch = useCallback(async () => {
    if (!dashboardId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboards/${dashboardId}`);
      if (response.ok) {
        const data = await response.json();
        setDashboard(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [dashboardId]);

  return {
    dashboard,
    loading,
    error,
    updateWidgets,
    updateDashboard,
    refetch,
  };
}
