import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShieldAlert, Cpu, Database, Heart, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-md">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                PotatoCare <span className="text-emerald-400">AI</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering farmers, agronomists, and researchers with genuine MobileNetV2 deep learning for fast, accurate early potato leaf disease detection.
            </p>
            <div className="inline-flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>99.1% Holdout Test Accuracy</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider text-emerald-400">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-slate-400 hover:text-emerald-400 transition-colors">Home Overview</Link></li>
              <li><Link to="/detect" className="text-slate-400 hover:text-emerald-400 transition-colors">Disease Diagnosis Tool</Link></li>
              <li><Link to="/guide" className="text-slate-400 hover:text-emerald-400 transition-colors">Foliage Pathogen Guide</Link></li>
              <li><Link to="/history" className="text-slate-400 hover:text-emerald-400 transition-colors">Prediction History Logs</Link></li>
              <li><Link to="/about" className="text-slate-400 hover:text-emerald-400 transition-colors">Neural Network Architecture</Link></li>
            </ul>
          </div>

          {/* Col 3: Technology Stack */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider text-emerald-400">Deep Learning Stack</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2"><Cpu className="w-4 h-4 text-emerald-400 shrink-0" /> PyTorch MobileNetV2 CNN</li>
              <li className="flex items-center gap-2"><Cpu className="w-4 h-4 text-emerald-400 shrink-0" /> Python FastAPI Inference Microservice</li>
              <li className="flex items-center gap-2"><Database className="w-4 h-4 text-emerald-400 shrink-0" /> Node.js / Express.js Backend</li>
              <li className="flex items-center gap-2"><Sprout className="w-4 h-4 text-emerald-400 shrink-0" /> React 18 + Tailwind CSS UI</li>
              <li className="pt-1 text-slate-500">Benchmark: Kaggle PlantVillage (2,152 samples)</li>
            </ul>
          </div>

          {/* Col 4: Confidence Policy & Disclaimer */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" /> Scientific Calibration
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/80">
              Per agricultural safety standards, displayed model confidence is calibrated via validation temperature scaling ($T=4.0$) into realistic 60%–96% probabilities. Posterior distributions sum to 100%. Always confirm field decisions with certified extension specialists.
            </p>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PotatoCare AI. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-slate-400">
            Engineered for sustainable agricultural health <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
