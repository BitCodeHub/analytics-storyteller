'use client';

import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, Sparkles, TrendingUp, BarChart3, Zap, Shield, Clock } from 'lucide-react';
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

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<Record<string, string | number>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const parseFile = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setResult(null);

    Papa.parse(selectedFile, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('Error parsing CSV: ' + results.errors[0].message);
          return;
        }
        setCsvData(results.data as Record<string, string | number>[]);
        setHeaders(results.meta.fields || []);
      },
      error: (err) => {
        setError('Error reading file: ' + err.message);
      },
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        parseFile(droppedFile);
      } else {
        setError('Please upload a CSV file');
      }
    }
  }, [parseFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      parseFile(e.target.files[0]);
    }
  }, [parseFile]);

  const analyzeData = async () => {
    if (csvData.length === 0) return;

    setAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headers,
          data: csvData.slice(0, 100),
          totalRows: csvData.length,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Analysis failed');
      }

      const analysisResult = await response.json();
      setResult(analysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setAnalyzing(false);
    }
  };

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
          </div>
          <div className="flex items-center gap-4">
            <span className="text-neutral-500 text-sm">Powered by Claude AI</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section */}
        {!file && !result && (
          <>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-full text-sm text-neutral-400 mb-6">
                <Zap className="w-3.5 h-3.5 text-emerald-500" />
                Enterprise-grade analytics
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-6">
                Transform data into
                <br />
                <span className="bg-gradient-to-r from-neutral-200 to-neutral-500 bg-clip-text text-transparent">
                  actionable insights
                </span>
              </h1>
              <p className="text-neutral-400 text-lg max-w-2xl mx-auto leading-relaxed">
                Upload your CSV and let AI analyze patterns, identify trends, and generate 
                compelling narratives that drive business decisions.
              </p>
            </div>

            {/* Upload Zone */}
            <div
              className={cn(
                'max-w-2xl mx-auto border rounded-2xl p-16 text-center transition-all duration-200',
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
                Drop your CSV file here
              </h2>
              <p className="text-neutral-500 mb-8">or click to browse your files</p>
              <label className="inline-block">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <span className="px-6 py-3 bg-white hover:bg-neutral-100 text-black font-medium rounded-lg cursor-pointer transition-colors inline-flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  Select CSV File
                </span>
              </label>
            </div>

            {/* Features Grid */}
            <div className="mt-24 grid md:grid-cols-3 gap-6">
              <div className="p-6 bg-neutral-900/50 rounded-xl border border-neutral-800">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="text-white font-semibold mb-2">Pattern Recognition</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  AI automatically identifies trends, correlations, and anomalies in your data.
                </p>
              </div>
              <div className="p-6 bg-neutral-900/50 rounded-xl border border-neutral-800">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-white font-semibold mb-2">Narrative Generation</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  Transform complex data into clear, actionable stories for stakeholders.
                </p>
              </div>
              <div className="p-6 bg-neutral-900/50 rounded-xl border border-neutral-800">
                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="text-white font-semibold mb-2">Smart Visualizations</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  Auto-generated charts that highlight the insights that matter most.
                </p>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 flex items-center justify-center gap-8 text-neutral-500 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Data never stored</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Analysis in seconds</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Enterprise ready</span>
              </div>
            </div>
          </>
        )}

        {/* File Selected State */}
        {file && !result && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
              {/* File Header */}
              <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                    <FileSpreadsheet className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-white font-semibold">{file.name}</h2>
                    <p className="text-neutral-500 text-sm">
                      {csvData.length.toLocaleString()} rows × {headers.length} columns
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setCsvData([]);
                    setHeaders([]);
                  }}
                  className="text-neutral-500 hover:text-white text-sm transition-colors"
                >
                  Change file
                </button>
              </div>

              {/* Data Preview */}
              <div className="p-6 border-b border-neutral-800">
                <h3 className="text-neutral-400 text-sm font-medium mb-4">Data Preview</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-800">
                        {headers.slice(0, 6).map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-neutral-400 font-medium">
                            {h}
                          </th>
                        ))}
                        {headers.length > 6 && (
                          <th className="px-4 py-3 text-neutral-600">+{headers.length - 6} more</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 5).map((row, i) => (
                        <tr key={i} className="border-b border-neutral-800/50">
                          {headers.slice(0, 6).map((h) => (
                            <td key={h} className="px-4 py-3 text-neutral-300 font-mono text-xs">
                              {String(row[h] ?? '—')}
                            </td>
                          ))}
                          {headers.length > 6 && (
                            <td className="px-4 py-3 text-neutral-600">...</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action */}
              <div className="p-6">
                <button
                  onClick={analyzeData}
                  disabled={analyzing}
                  className="w-full py-4 bg-white hover:bg-neutral-100 text-black font-semibold rounded-xl transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {analyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-neutral-300 border-t-black rounded-full animate-spin" />
                      Analyzing your data...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Analysis
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="max-w-3xl mx-auto mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="max-w-5xl mx-auto space-y-8">
            <StoryDisplay
              story={result.story}
              insights={result.insights}
              recommendations={result.recommendations}
            />

            {result.chartData && (
              <DataVisualization chartData={result.chartData} />
            )}

            <div className="text-center pt-8">
              <button
                onClick={() => {
                  setResult(null);
                  setFile(null);
                  setCsvData([]);
                  setHeaders([]);
                }}
                className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 rounded-xl transition-colors"
              >
                Analyze Another File
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-800 mt-24">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between text-neutral-500 text-sm">
          <span>© 2026 Lumen AI Solutions</span>
          <span>Built with Claude AI</span>
        </div>
      </footer>
    </main>
  );
}
