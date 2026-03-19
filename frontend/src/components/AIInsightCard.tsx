import { Sparkles, CheckCircle2, Lightbulb } from 'lucide-react';
import type { AIInsight } from '../types/weather';

interface AIInsightCardProps {
  insight: AIInsight;
}

export function AIInsightCard({ insight }: AIInsightCardProps) {
  return (
    <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-md rounded-2xl p-6 border border-purple-400/30 text-white">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-purple-200">AI Weather Insights</h3>
        <span className="ml-auto text-xs text-purple-400 bg-purple-400/20 px-2 py-1 rounded-full">
          Powered by GPT-4o-mini
        </span>
      </div>

      {/* Summary */}
      <p className="text-gray-200 mb-5 leading-relaxed">{insight.summary}</p>

      {/* Highlights */}
      <div className="space-y-2 mb-5">
        {insight.highlights.map((highlight, i) => (
          <div key={i} className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-300">{highlight}</p>
          </div>
        ))}
      </div>

      {/* Recommendation */}
      <div className="flex items-start gap-3 bg-yellow-400/10 rounded-xl p-4 border border-yellow-400/20">
        <Lightbulb className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-yellow-400 mb-1">Recommendation</p>
          <p className="text-sm text-gray-200">{insight.recommendation}</p>
        </div>
      </div>
    </div>
  );
}
