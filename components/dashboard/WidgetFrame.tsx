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
} from '@/components/charts';
import { colorThemes, ColorThemeKey } from '@/lib/data/connectors';

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
              onClick={onEdit}
              className="p-1.5 text-gray-400 hover:text-[#00D4AA] hover:bg-[#00D4AA]/10 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
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
    </div>
  );
}
