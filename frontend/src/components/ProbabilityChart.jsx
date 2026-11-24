import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';
import { BarChart3, Info } from 'lucide-react';

export default function ProbabilityChart({ probabilities }) {
  if (!probabilities) return null;

  const data = Object.keys(probabilities)
    .filter(k => k !== 'Not a Potato Leaf')
    .map((key) => {
      const rawProb = typeof probabilities[key] === 'number' ? probabilities[key] : parseFloat(probabilities[key]) || 0;
      return {
        name: key,
        percentage: parseFloat((rawProb * 100).toFixed(1))
      };
    });

  const getBarColor = (name) => {
    if (name === 'Healthy') return '#059669'; // Emerald-600
    if (name === 'Early Blight') return '#d97706'; // Amber-600
    if (name === 'Late Blight') return '#dc2626'; // Rose-600
    return '#64748b';
  };

  return (
    <div className="w-full bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">AI Softmax Probability Distribution</h4>
            <p className="text-[11px] text-slate-500 font-medium">Class probability vectors from MobileNetV2</p>
          </div>
        </div>

        <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          Holdout Acc: 99.1%
        </span>
      </div>

      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 35, left: 15, bottom: 5 }}>
            <XAxis
              type="number"
              domain={[0, 100]}
              unit="%"
              stroke="#94a3b8"
              fontSize={11}
              ticks={[0, 25, 50, 75, 90, 100]}
            />
            <YAxis
              dataKey="name"
              type="category"
              stroke="#334155"
              fontSize={12}
              fontWeight={600}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              width={90}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, 'Calibrated Probability']}
              contentStyle={{
                backgroundColor: '#0f172a',
                borderRadius: '12px',
                color: '#fff',
                border: 'none',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
                fontSize: '12px'
              }}
            />
            <Bar dataKey="percentage" radius={[0, 8, 8, 0]} barSize={22}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.name)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Calibrated Posterior Probability: Evaluated under validation temperature scaling ($T=4.0$).</span>
        </span>
      </div>
    </div>
  );
}
