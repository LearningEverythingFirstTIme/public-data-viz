'use client';

import { useState, useEffect } from 'react';
import { Settings, Trash2, GripVertical, Loader2 } from 'lucide-react';
import { WidgetConfig } from '@/types';
import { DataSet } from '@/types';
import { getConnector } from '@/lib/data';
import {
  LineChartComponent,
  BarChartComponent,
  AreaChartComponent,
  ScatterChartComponent,
  PieChartComponent,
  StatCardComponent,
  CandlestickChartComponent,
} from '@/components/charts';
import { colorThemes, ColorThemeKey } from '@/lib/data/connectors';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface WidgetFrameProps {
  widget: WidgetConfig;
  isEditing?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function WidgetFrame({
  widget,
  isEditing = false,
  onEdit,
  onDelete,
}: WidgetFrameProps) {
  const [data, setData] = useState<DataSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const connector = getConnector(widget.dataSource);
        if (!connector) {
          throw new Error(`Unknown data source: ${widget.dataSource}`);
        }

        const fetchedData = await connector.fetchData(
          widget.dataSourceConfig.indicator || '',
          widget.dataSourceConfig
        );
        setData(fetchedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [widget]);

  const renderChart = () => {
    if (!data) return null;

    const colorTheme = (widget.chartConfig.colorTheme as ColorThemeKey) || 'teal';
    const theme = colorThemes[colorTheme];

    switch (widget.type) {
      case 'line':
        return (
          <LineChartComponent
            data={data}
            colorTheme={colorTheme}
            showGrid={widget.chartConfig.showGrid}
            lineSmooth={widget.chartConfig.lineSmooth}
            height={220}
          />
        );
      case 'bar':
        return (
          <BarChartComponent
            data={data}
            colorTheme={colorTheme}
            showGrid={widget.chartConfig.showGrid}
            height={220}
          />
        );
      case 'area':
        return (
          <AreaChartComponent
            data={data}
            colorTheme={colorTheme}
            showGrid={widget.chartConfig.showGrid}
            fillArea={widget.chartConfig.fillArea}
            height={220}
          />
        );
      case 'scatter':
        return (
          <ScatterChartComponent
            data={data}
            colorTheme={colorTheme}
            showGrid={widget.chartConfig.showGrid}
            height={220}
          />
        );
      case 'pie':
        return (
          <PieChartComponent
            data={data}
            colorTheme={colorTheme}
            height={220}
          />
        );
      case 'stat':
        return <StatCardComponent data={data} colorTheme={colorTheme} />;
      case 'candlestick':
        return (
          <CandlestickChartComponent
            data={data}
            colorTheme={colorTheme}
            showGrid={widget.chartConfig.showGrid}
            height={220}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#13161E] rounded-xl border border-[#1E2330] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E2330]">
        <div className="flex items-center gap-2">
          {isEditing && (
            <GripVertical className="w-4 h-4 text-gray-500 cursor-move" />
          )}
          <h3 className="text-sm font-medium text-gray-200 truncate">
            {widget.title}
          </h3>
        </div>
        
        {isEditing && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                console.log('[WidgetFrame] Settings clicked for widget:', widget.id);
                onEdit?.();
              }}
              className="p-1.5 text-gray-400 hover:text-[#00D4AA] hover:bg-[#00D4AA]/10 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                console.log('[WidgetFrame] Delete clicked for widget:', widget.id);
                setShowDeleteDialog(true);
              }}
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-[#00D4AA] animate-spin" />
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : (
          renderChart()
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#13161E] border-[#1E2330]">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Widget</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this widget? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="border-[#1E2330] text-gray-300 hover:bg-[#1E2330]"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                console.log('[WidgetFrame] Confirmed delete for widget:', widget.id);
                onDelete?.();
                setShowDeleteDialog(false);
              }}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
