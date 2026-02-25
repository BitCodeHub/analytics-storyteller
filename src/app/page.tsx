'use client';

import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, Sparkles, TrendingUp, BarChart3 } from 'lucide-react';
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
          data: csvData.slice(0, 100), // Limit to first 100 rows
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
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Analytics Storyteller
            </h1>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Transform your data into compelling narratives. Upload a CSV and let AI uncover the story hidden in your numbers.
          </p>
        </div>

        {/* Upload Zone */}
        {!result && (
          <div
            className={cn(
              'max-w-2xl mx-auto border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300',
              dragActive
                ? 'border-purple-400 bg-purple-900/30'
                : 'border-slate-600 hover:border-purple-500 bg-slate-800/50'
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {!file ? (
              <>
                <Upload className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                <h2 className="text-xl font-semibold text-white mb-2">
                  Drop your CSV file here
                </h2>
                <p className="text-slate-400 mb-6">or click to browse</p>
                <label className="inline-block">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <span className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg cursor-pointer transition-colors">
                    Select File
                  </span>
                </label>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-green-400" />
                <h2 className="text-xl font-semibold text-white mb-2">{file.name}</h2>
                <p className="text-slate-400 mb-4">
                  {csvData.length} rows × {headers.length} columns
                </p>
                
                {/* Preview Table */}
                <div className="bg-slate-900/50 rounded-lg p-4 mb-6 overflow-x-auto max-h-48 overflow-y-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr>
                        {headers.slice(0, 5).map((h) => (
                          <th key={h} className="px-3 py-2 text-purple-300 font-medium">
                            {h}
                          </th>
                        ))}
                        {headers.length > 5 && (
                          <th className="px-3 py-2 text-slate-500">...</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 3).map((row, i) => (
                        <tr key={i} className="border-t border-slate-700">
                          {headers.slice(0, 5).map((h) => (
                            <td key={h} className="px-3 py-2 text-slate-300">
                              {String(row[h] ?? '')}
                            </td>
                          ))}
                          {headers.length > 5 && (
                            <td className="px-3 py-2 text-slate-500">...</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => {
                      setFile(null);
                      setCsvData([]);
                      setHeaders([]);
                    }}
                    className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                  >
                    Change File
                  </button>
                  <button
                    onClick={analyzeData}
                    disabled={analyzing}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {analyzing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generate Story
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mt-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
            {/* Story Section */}
            <StoryDisplay
              story={result.story}
              insights={result.insights}
              recommendations={result.recommendations}
            />

            {/* Visualization */}
            {result.chartData && (
              <DataVisualization chartData={result.chartData} />
            )}

            {/* Actions */}
            <div className="text-center">
              <button
                onClick={() => {
                  setResult(null);
                  setFile(null);
                  setCsvData([]);
                  setHeaders([]);
                }}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Analyze Another File
              </button>
            </div>
          </div>
        )}

        {/* Features */}
        {!file && (
          <div className="max-w-4xl mx-auto mt-16 grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-slate-800/30 rounded-xl border border-slate-700">
              <TrendingUp className="w-10 h-10 mx-auto mb-4 text-blue-400" />
              <h3 className="text-lg font-semibold text-white mb-2">Trend Analysis</h3>
              <p className="text-slate-400 text-sm">
                AI identifies patterns, trends, and anomalies in your data automatically.
              </p>
            </div>
            <div className="text-center p-6 bg-slate-800/30 rounded-xl border border-slate-700">
              <Sparkles className="w-10 h-10 mx-auto mb-4 text-purple-400" />
              <h3 className="text-lg font-semibold text-white mb-2">Narrative Generation</h3>
              <p className="text-slate-400 text-sm">
                Transform raw numbers into compelling stories anyone can understand.
              </p>
            </div>
            <div className="text-center p-6 bg-slate-800/30 rounded-xl border border-slate-700">
              <BarChart3 className="w-10 h-10 mx-auto mb-4 text-pink-400" />
              <h3 className="text-lg font-semibold text-white mb-2">Smart Visualizations</h3>
              <p className="text-slate-400 text-sm">
                Auto-generated charts that highlight the most important insights.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
