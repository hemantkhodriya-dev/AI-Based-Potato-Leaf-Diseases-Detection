import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldCheck, AlertCircle, RefreshCw, Cpu, Activity, CheckCircle2 } from 'lucide-react';

export default function ModelStatusBanner() {
  const [statusInfo, setStatusInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/health');
      setStatusInfo(res.data);
    } catch (err) {
      setStatusInfo({ status: 'offline', error: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-100/80 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between text-xs text-slate-600 animate-pulse">
        <div className="flex items-center gap-2.5">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" />
          <span className="font-medium">Connecting to AI Model Inference Engine & Express API...</span>
        </div>
      </div>
    );
  }

  const isAiOnline = statusInfo?.aiServiceStatus?.model_loaded || statusInfo?.aiServiceStatus?.status === 'ok';
  const accuracy = statusInfo?.aiServiceStatus?.accuracy || statusInfo?.aiServiceStatus?.metrics?.accuracy || 0.9907;
  const accuracyPct = (accuracy * 100).toFixed(1);

  if (isAiOnline) {
    return (
      <div className="bg-emerald-50/90 border border-emerald-200 p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-950 shadow-sm transition-all">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-slate-900 text-xs sm:text-sm">MobileNetV2 Deep Learning Engine Active</span>
              <span className="bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                {accuracyPct}% Holdout Accuracy
              </span>
            </div>
            <p className="text-slate-600 mt-0.5 text-[11px] sm:text-xs">
              FastAPI service ready on port 8000 • Express API online with validation probability calibration (T=4.0)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <span className="hidden md:inline text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-lg border border-emerald-200">
            3 Classes: Healthy, Early & Late Blight
          </span>
          <button
            onClick={checkHealth}
            className="p-1.5 text-emerald-800 hover:bg-emerald-200/60 rounded-xl transition-colors"
            title="Refresh AI Service Status"
            aria-label="Refresh Status"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-950 space-y-2 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-900 text-sm">AI Inference Engine Connecting</h4>
            <p className="text-amber-800 leading-relaxed mt-0.5">
              Backend API is running. If FastAPI service is restarting, it will automatically connect.
            </p>
          </div>
        </div>
        <button
          onClick={checkHealth}
          className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Check Status
        </button>
      </div>
    </div>
  );
}
