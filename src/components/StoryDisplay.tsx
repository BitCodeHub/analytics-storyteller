'use client';

import { Sparkles, Lightbulb, Target } from 'lucide-react';

type StoryDisplayProps = {
  story: string;
  insights: string[];
  recommendations: string[];
};

export function StoryDisplay({ story, insights, recommendations }: StoryDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Main Story */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-purple-500/30 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">The Story Behind Your Data</h2>
        </div>
        <div className="prose prose-invert prose-purple max-w-none">
          {story.split('\n\n').map((paragraph, i) => (
            <p key={i} className="text-slate-300 leading-relaxed text-lg mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Key Insights */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-blue-500/30">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Key Insights</h3>
          </div>
          <ul className="space-y-3">
            {insights.map((insight, i) => (
              <li key={i} className="flex gap-3 text-slate-300">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-medium">
                  {i + 1}
                </span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Recommendations</h3>
          </div>
          <ul className="space-y-3">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex gap-3 text-slate-300">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm font-medium">
                  ✓
                </span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
