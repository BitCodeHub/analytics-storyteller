'use client';

import { Sparkles, Lightbulb, Target, ArrowRight } from 'lucide-react';

type StoryDisplayProps = {
  story: string;
  insights: string[];
  recommendations: string[];
};

export function StoryDisplay({ story, insights, recommendations }: StoryDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Main Story */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
        <div className="p-6 border-b border-neutral-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Analysis Summary</h2>
            <p className="text-neutral-500 text-sm">AI-generated narrative from your data</p>
          </div>
        </div>
        <div className="p-6">
          {story.split('\n\n').map((paragraph, i) => (
            <p key={i} className="text-neutral-300 leading-relaxed mb-4 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Key Insights */}
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
          <div className="p-5 border-b border-neutral-800 flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-emerald-500" />
            </div>
            <h3 className="font-semibold text-white">Key Insights</h3>
          </div>
          <div className="p-5 space-y-4">
            {insights.map((insight, i) => (
              <div key={i} className="flex gap-4">
                <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-neutral-800 text-neutral-400 flex items-center justify-center text-xs font-medium">
                  {i + 1}
                </span>
                <p className="text-neutral-300 text-sm leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
          <div className="p-5 border-b border-neutral-800 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-blue-500" />
            </div>
            <h3 className="font-semibold text-white">Recommendations</h3>
          </div>
          <div className="p-5 space-y-4">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex gap-4">
                <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <ArrowRight className="w-3 h-3" />
                </span>
                <p className="text-neutral-300 text-sm leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
