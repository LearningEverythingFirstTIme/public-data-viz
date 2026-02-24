'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight, BarChart3, LineChart, PieChart, Activity, Hash } from 'lucide-react';
import { WidgetConfig, ChartType, DataSourceIndicator } from '@/types';
import { getAllConnectors } from '@/lib/data';
import { colorThemes, ColorThemeKey } from '@/lib/data/connectors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface WidgetConfigPanelProps {
  widget?: WidgetConfig | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (widget: WidgetConfig) => void;
}

const chartTypes: { type: ChartType; label: string; icon: React.ReactNode }[] = [
  { type: 'line', label: 'Line', icon: <LineChart className="w-4 h-4" /> },
  { type: 'bar', label: 'Bar', icon: <BarChart3 className="w-4 h-4" /> },
  { type: 'area', label: 'Area', icon: <Activity className="w-4 h-4" /> },
  { type: 'scatter', label: 'Scatter', icon: <Hash className="w-4 h-4" /> },
  { type: 'pie', label: 'Pie', icon: <PieChart className="w-4 h-4" /> },
  { type: 'stat', label: 'Stat Card', icon: <Hash className="w-4 h-4" /> },
];

export function WidgetConfigPanel({
  widget,
  isOpen,
  onClose,
  onSave,
}: WidgetConfigPanelProps) {
  const connectors = getAllConnectors();
  const [step, setStep] = useState(1);
  
  const [config, setConfig] = useState<Partial<WidgetConfig>>({
    id: '',
    type: 'line',
    title: '',
    dataSource: '',
    dataSourceConfig: {},
    chartConfig: {
      colorTheme: 'teal',
      showGrid: true,
      showLegend: true,
      lineSmooth: true,
      fillArea: true,
    },
  });

  const [selectedIndicators, setSelectedIndicators] = useState<DataSourceIndicator[]>([]);

  useEffect(() => {
    if (widget) {
      setConfig(widget);
      const connector = connectors.find((c) => c.id === widget.dataSource);
      if (connector) {
        setSelectedIndicators(connector.getIndicators());
      }
    } else {
      setConfig({
        id: crypto.randomUUID(),
        type: 'line',
        title: 'New Widget',
        dataSource: '',
        dataSourceConfig: {},
        chartConfig: {
          colorTheme: 'teal',
          showGrid: true,
          showLegend: true,
          lineSmooth: true,
          fillArea: true,
        },
      });
    }
    setStep(1);
  }, [widget, isOpen]);

  const handleDataSourceChange = (sourceId: string) => {
    const connector = connectors.find((c) => c.id === sourceId);
    setSelectedIndicators(connector?.getIndicators() || []);
    setConfig((prev) => ({
      ...prev,
      dataSource: sourceId,
      dataSourceConfig: {},
    }));
  };

  const handleSave = () => {
    if (config.id && config.title && config.dataSource) {
      onSave(config as WidgetConfig);
      onClose();
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return config.dataSource && config.dataSourceConfig?.indicator;
      case 2:
        return config.type;
      case 3:
        return config.title;
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[480px] bg-[#13161E] border-l border-[#1E2330] shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2330]">
        <h2 className="text-lg font-semibold text-white">
          {widget ? 'Edit Widget' : 'Add Widget'}
        </h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-white hover:bg-[#1E2330] rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress */}
      <div className="flex items-center px-6 py-4 border-b border-[#1E2330]">
        {[1, 2, 3].map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                step === s
                  ? 'bg-[#00D4AA] text-[#0A0C10]'
                  : step > s
                  ? 'bg-[#00D4AA]/20 text-[#00D4AA]'
                  : 'bg-[#1E2330] text-gray-500'
              )}
            >
              {s}
            </div>
            {i < 2 && (
              <ChevronRight className="w-4 h-4 mx-2 text-gray-600" />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <Label className="text-gray-300 mb-2 block">Data Source</Label>
              <Select
                value={config.dataSource}
                onValueChange={handleDataSourceChange}
              >
                <SelectTrigger className="bg-[#0A0C10] border-[#1E2330] text-white">
                  <SelectValue placeholder="Select a data source" />
                </SelectTrigger>
                <SelectContent className="bg-[#13161E] border-[#1E2330]">
                  {connectors.map((connector) => (
                    <SelectItem
                      key={connector.id}
                      value={connector.id}
                      className="text-white hover:bg-[#1E2330]"
                    >
                      <div>
                        <p className="font-medium">{connector.name}</p>
                        <p className="text-xs text-gray-400">{connector.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {config.dataSource && selectedIndicators.length > 0 && (
              <div>
                <Label className="text-gray-300 mb-2 block">Indicator</Label>
                <Select
                  value={config.dataSourceConfig?.indicator}
                  onValueChange={(value) =>
                    setConfig((prev) => ({
                      ...prev,
                      dataSourceConfig: {
                        ...prev.dataSourceConfig,
                        indicator: value,
                      },
                    }))
                  }
                >
                  <SelectTrigger className="bg-[#0A0C10] border-[#1E2330] text-white">
                    <SelectValue placeholder="Select an indicator" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#13161E] border-[#1E2330]">
                    {selectedIndicators.map((ind) => (
                      <SelectItem
                        key={ind.id}
                        value={ind.id}
                        className="text-white hover:bg-[#1E2330]"
                      >
                        <div>
                          <p className="font-medium">{ind.name}</p>
                          <p className="text-xs text-gray-400">{ind.description}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {config.dataSource === 'worldbank' && (
              <div>
                <Label className="text-gray-300 mb-2 block">Country Code</Label>
                <Input
                  value={config.dataSourceConfig?.country || 'US'}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      dataSourceConfig: {
                        ...prev.dataSourceConfig,
                        country: e.target.value,
                      },
                    }))
                  }
                  className="bg-[#0A0C10] border-[#1E2330] text-white"
                  placeholder="e.g., US, CN, DE"
                />
              </div>
            )}

            {config.dataSource === 'coingecko' && (
              <div>
                <Label className="text-gray-300 mb-2 block">Time Period (Days)</Label>
                <Select
                  value={config.dataSourceConfig?.days || '365'}
                  onValueChange={(value) =>
                    setConfig((prev) => ({
                      ...prev,
                      dataSourceConfig: {
                        ...prev.dataSourceConfig,
                        days: value,
                      },
                    }))
                  }
                >
                  <SelectTrigger className="bg-[#0A0C10] border-[#1E2330] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#13161E] border-[#1E2330]">
                    <SelectItem value="30">30 Days</SelectItem>
                    <SelectItem value="90">90 Days</SelectItem>
                    <SelectItem value="365">1 Year</SelectItem>
                    <SelectItem value="1825">5 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <Label className="text-gray-300 mb-4 block">Chart Type</Label>
              <div className="grid grid-cols-3 gap-3">
                {chartTypes.map((ct) => (
                  <button
                    key={ct.type}
                    onClick={() =>
                      setConfig((prev) => ({ ...prev, type: ct.type }))
                    }
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
                      config.type === ct.type
                        ? 'border-[#00D4AA] bg-[#00D4AA]/10 text-[#00D4AA]'
                        : 'border-[#1E2330] bg-[#0A0C10] text-gray-400 hover:border-gray-600'
                    )}
                  >
                    {ct.icon}
                    <span className="text-sm">{ct.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-gray-300 mb-4 block">Color Theme</Label>
              <div className="grid grid-cols-5 gap-3">
                {(Object.keys(colorThemes) as ColorThemeKey[]).map((theme) => (
                  <button
                    key={theme}
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        chartConfig: {
                          ...prev.chartConfig,
                          colorTheme: theme,
                        },
                      }))
                    }
                    className={cn(
                      'w-full aspect-square rounded-xl border-2 transition-all',
                      config.chartConfig?.colorTheme === theme
                        ? 'border-white scale-110'
                        : 'border-transparent hover:scale-105'
                    )}
                    style={{
                      backgroundColor: colorThemes[theme].primary,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-gray-300">Show Grid</Label>
                <Switch
                  checked={config.chartConfig?.showGrid}
                  onCheckedChange={(checked) =>
                    setConfig((prev) => ({
                      ...prev,
                      chartConfig: {
                        ...prev.chartConfig,
                        showGrid: checked,
                      },
                    }))
                  }
                />
              </div>

              {(config.type === 'line' || config.type === 'area') && (
                <>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Smooth Line</Label>
                    <Switch
                      checked={config.chartConfig?.lineSmooth}
                      onCheckedChange={(checked) =>
                        setConfig((prev) => ({
                          ...prev,
                          chartConfig: {
                            ...prev.chartConfig,
                            lineSmooth: checked,
                          },
                        }))
                      }
                    />
                  </div>

                  {config.type === 'area' && (
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300">Fill Area</Label>
                      <Switch
                        checked={config.chartConfig?.fillArea}
                        onCheckedChange={(checked) =>
                          setConfig((prev) => ({
                            ...prev,
                            chartConfig: {
                              ...prev.chartConfig,
                              fillArea: checked,
                            },
                          }))
                        }
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <Label className="text-gray-300 mb-2 block">Widget Title</Label>
              <Input
                value={config.title}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, title: e.target.value }))
                }
                className="bg-[#0A0C10] border-[#1E2330] text-white"
                placeholder="Enter widget title"
              />
            </div>

            <div className="p-4 bg-[#0A0C10] rounded-xl border border-[#1E2330]">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Preview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="text-gray-300 capitalize">{config.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Data Source:</span>
                  <span className="text-gray-300">{config.dataSource}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Indicator:</span>
                  <span className="text-gray-300">{config.dataSourceConfig?.indicator}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Theme:</span>
                  <span className="text-gray-300 capitalize">
                    {config.chartConfig?.colorTheme}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-[#1E2330]">
        <Button
          variant="outline"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
          className="border-[#1E2330] text-gray-300 hover:bg-[#1E2330]"
        >
          Back
        </Button>
        
        {step < 3 ? (
          <Button
            onClick={() => setStep((s) => Math.min(3, s + 1))}
            disabled={!canProceed()}
            className="bg-[#00D4AA] text-[#0A0C10] hover:bg-[#00D4AA]/90"
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSave}
            disabled={!config.title}
            className="bg-[#00D4AA] text-[#0A0C10] hover:bg-[#00D4AA]/90"
          >
            Save Widget
          </Button>
        )}
      </div>
    </div>
  );
}
