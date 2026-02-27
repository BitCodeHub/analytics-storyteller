'use client';

import { useState, useCallback, useEffect } from 'react';
import { 
  Upload, FileSpreadsheet, Sparkles, TrendingUp, BarChart3, Zap, Shield, Clock,
  FileText, File, Users, Eye, Timer, ArrowUpRight, ArrowDownRight, Calendar,
  RefreshCw, Settings, Download, Filter, ChevronDown
} from 'lucide-react';
import Papa from 'papaparse';
import { DataVisualization } from '@/components/DataVisualization';
import { StoryDisplay } from '@/components/StoryDisplay';
import { cn } from '@/lib/utils';

type AnalysisResult = {
  story: string;
  insights: string[];
  recommendations: string[];
  chartData: {
    labels: string[];
    datasets: { label: string; data: number[] }[];
  } | null;
};

type GA4Property = {
  name: string;
  displayName: string;
  propertyId: string;
};

type GA4Metrics = {
  activeUsers: number;
  totalUsers: number;
  sessions: number;
  screenPageViews: number;
  averageSessionDuration: number;
  bounceRate: number;
  newUsers: number;
  engagedSessions: number;
};

type UploadedFile = {
  file: File;
  type: string;
  extractedText?: string;
  status: 'pending' | 'processing' | 'ready' | 'error';
};

const ACCEPTED_FILE_TYPES = {
  'text/csv': 'CSV',
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
  'application/vnd.ms-excel': 'Excel',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
  'application/msword': 'Word',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
  'application/vnd.ms-powerpoint': 'PowerPoint',
};

export default function Home() {
  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [csvData, setCsvData] = useState<Record<string, string | number>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // GA4 state
  const [ga4Properties, setGa4Properties] = useState<GA4Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [ga4Metrics, setGa4Metrics] = useState<GA4Metrics | null>(null);
  const [ga4Loading, setGa4Loading] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '7daysAgo', end: 'today' });
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);

  // Analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<'upload' | 'ga4' | 'analysis'>('ga4');

  // Load GA4 properties on mount
  useEffect(() => {
    loadGA4Properties();
  }, []);

  const loadGA4Properties = async () => {
    try {
      const res = await fetch('/api/ga4/properties');
      if (res.ok) {
        const data = await res.json();
        setGa4Properties(data.properties || []);
        if (data.properties?.length > 0) {
          setSelectedProperty(data.properties[0].name);
        }
      }
    } catch (err) {
      console.error('Failed to load GA4 properties:', err);
    }
  };

  const loadGA4Metrics = async () => {
    if (!selectedProperty) return;
    setGa4Loading(true);
    try {
      const res = await fetch('/api/ga4/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property: selectedProperty,
          startDate: dateRange.start,
          endDate: dateRange.end,
          metrics: ['activeUsers', 'totalUsers', 'sessions', 'screenPageViews', 'averageSessionDuration', 'bounceRate', 'newUsers', 'engagedSessions']
        })
      });
      if (res.ok) {
        const data = await res.json();
        setGa4Metrics(data.metrics);
      }
    } catch (err) {
      console.error('Failed to load GA4 metrics:', err);
    } finally {
      setGa4Loading(false);
    }
  };

  useEffect(() => {
    if (selectedProperty) {
      loadGA4Metrics();
    }
  }, [selectedProperty, dateRange]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const processFile = async (file: File) => {
    const fileType = file.type || '';
    const newFile: UploadedFile = { file, type: fileType, status: 'processing' };
    setUploadedFiles(prev => [...prev, newFile]);

    try {
      if (fileType === 'text/csv' || file.name.endsWith('.csv')) {
        // Parse CSV locally
        Papa.parse(file, {
          header: true,
          dynamicTyping: true,
          complete: (results) => {
            setCsvData(results.data as Record<string, string | number>[]);
            setHeaders(results.meta.fields || []);
            setUploadedFiles(prev => prev.map(f => 
              f.file === file ? { ...f, status: 'ready', extractedText: JSON.stringify(results.data.slice(0, 50)) } : f
            ));
          }
        });
      } else {
        // Extract text from other file types via API
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/extract', {
          method: 'POST',
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          setUploadedFiles(prev => prev.map(f => 
            f.file === file ? { ...f, status: 'ready', extractedText: data.text } : f
          ));
        } else {
          throw new Error('Extraction failed');
        }
      }
    } catch (err) {
      setUploadedFiles(prev => prev.map(f => 
        f.file === file ? { ...f, status: 'error' } : f
      ));
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files) {
      Array.from(e.dataTransfer.files).forEach(processFile);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(processFile);
    }
  }, []);

  const analyzeAllData = async () => {
    setAnalyzing(true);
    setError(null);

    try {
      // Combine all data sources
      const combinedData = {
        csvData: csvData.slice(0, 100),
        headers,
        uploadedDocuments: uploadedFiles.filter(f => f.status === 'ready').map(f => ({
          name: f.file.name,
          type: f.type,
          content: f.extractedText?.slice(0, 5000) || ''
        })),
        ga4Metrics: ga4Metrics,
        ga4Property: selectedProperty,
        dateRange
      };

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(combinedData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Analysis failed');
      }

      const analysisResult = await response.json();
      setResult(analysisResult);
      setActiveTab('analysis');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setAnalyzing(false);
    }
  };

  const MetricCard = ({ label, value, change, icon: Icon, color }: { 
    label: string; 
    value: string | number; 
    change?: number;
    icon: any;
    color: string;
  }) => (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-sm",
            change >= 0 ? "text-emerald-500" : "text-red-500"
          )}>
            {change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-neutral-500 text-sm">{label}</div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Navigation */}
      <nav className="border-b border-neutral-800 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-black" />
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">Analytics Storyteller</span>
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-xs rounded-full">Enterprise</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('ga4')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                activeTab === 'ga4' ? "bg-white text-black" : "text-neutral-400 hover:text-white"
              )}
            >
              GA4 Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('upload')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                activeTab === 'upload' ? "bg-white text-black" : "text-neutral-400 hover:text-white"
              )}
            >
              Documents
            </button>
            <button 
              onClick={() => setActiveTab('analysis')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                activeTab === 'analysis' ? "bg-white text-black" : "text-neutral-400 hover:text-white"
              )}
            >
              AI Analysis
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* GA4 Dashboard Tab */}
        {activeTab === 'ga4' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Google Analytics Dashboard</h1>
                <p className="text-neutral-500">Real-time metrics from your GA4 properties</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Property Selector */}
                <div className="relative">
                  <button 
                    onClick={() => setShowPropertyDropdown(!showPropertyDropdown)}
                    className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm flex items-center gap-2 hover:border-neutral-700"
                  >
                    <span>{ga4Properties.find(p => p.name === selectedProperty)?.displayName || 'Select Property'}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {showPropertyDropdown && (
                    <div className="absolute top-full mt-2 right-0 w-64 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-10">
                      {ga4Properties.map(prop => (
                        <button
                          key={prop.name}
                          onClick={() => {
                            setSelectedProperty(prop.name);
                            setShowPropertyDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left text-sm hover:bg-neutral-800 text-white first:rounded-t-lg last:rounded-b-lg"
                        >
                          {prop.displayName}
                          <span className="block text-neutral-500 text-xs">{prop.propertyId}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date Range Selector */}
                <select 
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm"
                >
                  <option value="7daysAgo">Last 7 days</option>
                  <option value="14daysAgo">Last 14 days</option>
                  <option value="30daysAgo">Last 30 days</option>
                  <option value="90daysAgo">Last 90 days</option>
                </select>

                <button 
                  onClick={loadGA4Metrics}
                  disabled={ga4Loading}
                  className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white hover:border-neutral-700"
                >
                  <RefreshCw className={cn("w-5 h-5", ga4Loading && "animate-spin")} />
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            {ga4Metrics ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard 
                  label="Active Users" 
                  value={ga4Metrics.activeUsers} 
                  change={12}
                  icon={Users} 
                  color="bg-blue-500/10 text-blue-500" 
                />
                <MetricCard 
                  label="Total Users" 
                  value={ga4Metrics.totalUsers} 
                  change={8}
                  icon={Users} 
                  color="bg-emerald-500/10 text-emerald-500" 
                />
                <MetricCard 
                  label="Sessions" 
                  value={ga4Metrics.sessions} 
                  change={15}
                  icon={Eye} 
                  color="bg-purple-500/10 text-purple-500" 
                />
                <MetricCard 
                  label="Page Views" 
                  value={ga4Metrics.screenPageViews} 
                  change={-3}
                  icon={FileText} 
                  color="bg-amber-500/10 text-amber-500" 
                />
                <MetricCard 
                  label="Avg Session Duration" 
                  value={`${Math.round(ga4Metrics.averageSessionDuration / 60)}m ${Math.round(ga4Metrics.averageSessionDuration % 60)}s`}
                  icon={Timer} 
                  color="bg-cyan-500/10 text-cyan-500" 
                />
                <MetricCard 
                  label="Bounce Rate" 
                  value={`${(ga4Metrics.bounceRate * 100).toFixed(1)}%`}
                  icon={ArrowDownRight} 
                  color="bg-red-500/10 text-red-500" 
                />
                <MetricCard 
                  label="New Users" 
                  value={ga4Metrics.newUsers} 
                  change={22}
                  icon={Users} 
                  color="bg-pink-500/10 text-pink-500" 
                />
                <MetricCard 
                  label="Engaged Sessions" 
                  value={ga4Metrics.engagedSessions} 
                  icon={Zap} 
                  color="bg-orange-500/10 text-orange-500" 
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 animate-pulse">
                    <div className="w-10 h-10 bg-neutral-800 rounded-lg mb-4" />
                    <div className="h-8 bg-neutral-800 rounded w-24 mb-2" />
                    <div className="h-4 bg-neutral-800 rounded w-20" />
                  </div>
                ))}
              </div>
            )}

            {/* Action Button */}
            <div className="flex justify-center pt-6">
              <button
                onClick={analyzeAllData}
                disabled={analyzing || !ga4Metrics}
                className="px-8 py-4 bg-white hover:bg-neutral-100 text-black font-semibold rounded-xl transition-colors flex items-center gap-3 disabled:opacity-50"
              >
                <Sparkles className="w-5 h-5" />
                Generate AI Analysis from GA4 Data
              </button>
            </div>
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Upload Documents</h1>
              <p className="text-neutral-500">Add additional data sources for comprehensive AI analysis</p>
            </div>

            {/* Upload Zone */}
            <div
              className={cn(
                'border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200',
                dragActive
                  ? 'border-white bg-neutral-900/50'
                  : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/30'
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-neutral-800 rounded-2xl flex items-center justify-center">
                <Upload className="w-7 h-7 text-neutral-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Drop files here
              </h2>
              <p className="text-neutral-500 mb-6">
                Supports CSV, PDF, Excel, Word, and PowerPoint
              </p>
              <label className="inline-block">
                <input
                  type="file"
                  accept=".csv,.pdf,.xlsx,.xls,.docx,.doc,.pptx,.ppt"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <span className="px-6 py-3 bg-white hover:bg-neutral-100 text-black font-medium rounded-lg cursor-pointer transition-colors inline-flex items-center gap-2">
                  <File className="w-4 h-4" />
                  Select Files
                </span>
              </label>
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-white font-medium">Uploaded Documents ({uploadedFiles.length})</h3>
                {uploadedFiles.map((uf, i) => (
                  <div key={i} className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-neutral-400" />
                      <div>
                        <div className="text-white font-medium">{uf.file.name}</div>
                        <div className="text-neutral-500 text-sm">{(uf.file.size / 1024).toFixed(1)} KB</div>
                      </div>
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium",
                      uf.status === 'ready' && "bg-emerald-500/10 text-emerald-500",
                      uf.status === 'processing' && "bg-amber-500/10 text-amber-500",
                      uf.status === 'error' && "bg-red-500/10 text-red-500",
                      uf.status === 'pending' && "bg-neutral-500/10 text-neutral-500"
                    )}>
                      {uf.status === 'ready' ? '✓ Ready' : uf.status === 'processing' ? 'Processing...' : uf.status === 'error' ? 'Error' : 'Pending'}
                    </div>
                  </div>
                ))}

                <button
                  onClick={analyzeAllData}
                  disabled={analyzing || uploadedFiles.filter(f => f.status === 'ready').length === 0}
                  className="w-full mt-4 py-4 bg-white hover:bg-neutral-100 text-black font-semibold rounded-xl transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <Sparkles className="w-5 h-5" />
                  Analyze All Documents with AI
                </button>
              </div>
            )}
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            {result ? (
              <>
                <StoryDisplay
                  story={result.story}
                  insights={result.insights}
                  recommendations={result.recommendations}
                />
                {result.chartData && <DataVisualization chartData={result.chartData} />}
                <div className="flex justify-center gap-4 pt-6">
                  <button
                    onClick={() => setResult(null)}
                    className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 rounded-xl transition-colors"
                  >
                    Clear Analysis
                  </button>
                  <button
                    onClick={analyzeAllData}
                    disabled={analyzing}
                    className="px-6 py-3 bg-white hover:bg-neutral-100 text-black font-medium rounded-xl transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className={cn("w-4 h-4", analyzing && "animate-spin")} />
                    Re-analyze
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-6 bg-neutral-800 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-neutral-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">No Analysis Yet</h2>
                <p className="text-neutral-500 mb-6">
                  Pull GA4 data or upload documents, then generate an AI-powered analysis.
                </p>
                <div className="flex justify-center gap-3">
                  <button 
                    onClick={() => setActiveTab('ga4')}
                    className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 rounded-lg"
                  >
                    View GA4 Dashboard
                  </button>
                  <button 
                    onClick={() => setActiveTab('upload')}
                    className="px-6 py-3 bg-white hover:bg-neutral-100 text-black rounded-lg"
                  >
                    Upload Documents
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-800 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between text-neutral-500 text-sm">
          <span>© 2026 Lumen AI Solutions</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Data never stored
            </span>
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Enterprise ready
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
