'use client';

import { useState, useCallback, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { WidgetFrame } from './WidgetFrame';
import { WidgetConfig, WidgetLayout } from '@/types';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardGridProps {
  widgets: WidgetConfig[];
  layout: WidgetLayout[];
  isEditing?: boolean;
  onLayoutChange?: (layout: WidgetLayout[]) => void;
  onEditWidget?: (widget: WidgetConfig) => void;
  onDeleteWidget?: (widgetId: string) => void;
}

export function DashboardGrid({
  widgets,
  layout,
  isEditing = false,
  onLayoutChange,
  onEditWidget,
  onDeleteWidget,
}: DashboardGridProps) {
  // Sync internal state when layout prop changes (e.g., after loading from DB)
  const [currentLayout, setCurrentLayout] = useState<WidgetLayout[]>(layout);
  useEffect(() => {
    setCurrentLayout(layout);
  }, [layout]);

  const handleLayoutChange = useCallback(
    (newLayout: any[]) => {
      const convertedLayout: WidgetLayout[] = newLayout.map((item) => ({
        i: item.i,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
        minW: item.minW,
        minH: item.minH,
      }));
      setCurrentLayout(convertedLayout);
      onLayoutChange?.(convertedLayout);
    },
    [onLayoutChange]
  );

  // Build layouts from currentLayout state, not the prop
  // This ensures react-grid-layout gets the correct positions after reload
  const defaultLayouts = {
    lg: widgets.map((widget) => {
      const existingLayout = currentLayout.find((l) => l.i === widget.id);
      return {
        i: widget.id,
        x: existingLayout?.x ?? 0,
        y: existingLayout?.y ?? 0,
        w: existingLayout?.w ?? 6,
        h: existingLayout?.h ?? 8,
        minW: 3,
        minH: 4,
      };
    }),
  };

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={defaultLayouts}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={30}
      isDraggable={isEditing}
      isResizable={isEditing}
      onLayoutChange={handleLayoutChange}
      margin={[16, 16]}
    >
      {widgets.map((widget) => (
        <div key={widget.id}>
          <WidgetFrame
            widget={widget}
            isEditing={isEditing}
            onEdit={() => {
              console.log('[DashboardGrid] onEdit called for widget:', widget.id);
              onEditWidget?.(widget);
            }}
            onDelete={() => {
              console.log('[DashboardGrid] onDelete called for widget:', widget.id);
              onDeleteWidget?.(widget.id);
            }}
          />
        </div>
      ))}
    </ResponsiveGridLayout>
  );
}
