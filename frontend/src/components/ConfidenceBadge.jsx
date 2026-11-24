import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info } from 'lucide-react';

/**
 * ConfidenceBadge Component
 *
 * Implements Calibrated Confidence Display:
 * - Displays genuine calibrated model confidence (matches the highest calibrated class probability).
 * - Distinguishes calibrated confidence from raw uncalibrated softmax logits.
 * - Free of artificial caps, displaying reliable 60%–96% typical outputs.
 */
export default function ConfidenceBadge({
  diseaseClass,
  confidence,
  rawConfidence,
  isCapped = false,
  showRawTooltip = true,
  size = 'md'
}) {
  const isHealthy = diseaseClass === 'Healthy';
  const isEarlyBlight = diseaseClass === 'Early Blight';
  const isLateBlight = diseaseClass === 'Late Blight';
  const isUnsupported = diseaseClass === 'Unsupported Image' || diseaseClass === 'Non-Potato Leaf' || diseaseClass === 'Not a Potato Leaf';

  let bgClass = 'bg-emerald-50 text-emerald-900 border-emerald-300 ring-emerald-600/10';
  let badgeColor = 'text-emerald-700';
  let Icon = CheckCircle2;

  if (isEarlyBlight) {
    bgClass = 'bg-amber-50 text-amber-950 border-amber-300 ring-amber-600/10';
    badgeColor = 'text-amber-700';
    Icon = AlertTriangle;
  } else if (isLateBlight) {
    bgClass = 'bg-rose-50 text-rose-950 border-rose-300 ring-rose-600/10';
    badgeColor = 'text-rose-700';
    Icon = AlertOctagon;
  } else if (isUnsupported) {
    bgClass = 'bg-rose-50 text-rose-900 border-rose-200 ring-rose-600/10';
    badgeColor = 'text-rose-600';
    Icon = AlertOctagon;
  }

  // Calculate genuine calibrated confidence (no artificial 90% ceiling)
  const numConfidence = typeof confidence === 'number' ? confidence : parseFloat(confidence) || 0;
  const numRaw = typeof rawConfidence === 'number' ? rawConfidence : numConfidence;

  const displayedVal = numConfidence <= 1 ? numConfidence * 100 : numConfidence;
  const displayedPctStr = displayedVal.toFixed(1);

  const rawVal = numRaw <= 1 ? numRaw * 100 : numRaw;
  const rawPctStr = rawVal.toFixed(1);
  const hasRawDiff = Math.abs(rawVal - displayedVal) > 1.0;

  const sizeClasses = size === 'sm'
    ? 'text-xs px-2.5 py-1 gap-1.5'
    : size === 'lg'
    ? 'text-sm px-4 py-2 gap-2.5'
    : 'text-xs px-3.5 py-1.5 gap-2';

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <div
        className={`inline-flex items-center rounded-full border shadow-sm ring-1 font-semibold transition-all ${sizeClasses} ${bgClass}`}
        title={isUnsupported ? 'Rejected: Non-Potato Image' : `Calibrated Model Confidence: ${displayedPctStr}% (Raw Softmax Output: ${rawPctStr}%)`}
      >
        <Icon className={`${size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} ${badgeColor} shrink-0`} />
        <span className="font-bold tracking-tight">{diseaseClass}</span>
        {!isUnsupported && (
          <>
            <span className="opacity-30">•</span>
            <span className="font-extrabold text-slate-900">{displayedPctStr}% Calibrated</span>
          </>
        )}
      </div>

      {!isUnsupported && showRawTooltip && hasRawDiff && (
        <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 pl-1">
          <Info className="w-3 h-3 text-slate-400" />
          <span>Calibrated Confidence (Uncalibrated raw output: <strong className="text-slate-700">{rawPctStr}%</strong>)</span>
        </span>
      )}
    </div>
  );
}
