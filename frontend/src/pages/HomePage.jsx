import React from 'react';
import { Link } from 'react-router-dom';
import {
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  BookOpen,
  Layers,
  Sprout,
  BarChart3,
  Cpu
} from 'lucide-react';
import ModelStatusBanner from '../components/ModelStatusBanner';

export default function HomePage() {
  return (
    <div className="space-y-16 sm:space-y-20 pb-16 gradient-hero">
      
      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-12 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6 max-w-4xl mx-auto text-center">
          
          <ModelStatusBanner />

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/90 border border-emerald-200 text-emerald-900 text-xs font-bold uppercase tracking-wider shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>MobileNetV2 Deep CNN • 99.1% Holdout Accuracy</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            AI-Powered Potato Leaf <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-emerald-800 to-forest-900">
              Disease Detection System
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Protect your potato harvest from catastrophic foliar pathogens. Rapidly classify leaf photos into <span className="font-bold text-emerald-800">Healthy</span>, <span className="font-bold text-amber-800">Early Blight</span> (*Alternaria solani*), or <span className="font-bold text-rose-800">Late Blight</span> (*Phytophthora infestans*) using genuine deep learning.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/detect"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-emerald-800 hover:bg-emerald-900 text-white px-8 py-4 rounded-2xl font-black text-base shadow-xl shadow-emerald-900/20 hover:shadow-emerald-900/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <ScanLine className="w-5 h-5" />
              Analyze Leaf Now
            </Link>
            
            <Link
              to="/guide"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-emerald-50/50 text-slate-800 border border-slate-300 px-7 py-4 rounded-2xl font-bold text-base shadow-sm transition-all"
            >
              <BookOpen className="w-5 h-5 text-emerald-700" />
              Disease Guide
            </Link>
          </div>
        </div>

        {/* Hero Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14 max-w-5xl mx-auto">
          <div className="bg-white/90 backdrop-blur-md p-6 sm:p-7 rounded-3xl border border-emerald-100 shadow-md hover:shadow-xl transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Rapid MobileNetV2 Inference</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Process 224×224 RGB tensors in milliseconds using optimized transfer learning with PyTorch.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-md p-6 sm:p-7 rounded-3xl border border-emerald-100 shadow-md hover:shadow-xl transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Probability Calibration (60%–96%)</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Applies validation temperature scaling ($T=4.0$) so confidence scores reflect realistic, calibrated probabilities instead of extreme 99.9% values.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-md p-6 sm:p-7 rounded-3xl border border-emerald-100 shadow-md hover:shadow-xl transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Verified PlantVillage Training</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Trained on 2,152 benchmark images with stratified 70/15/15 validation and independent holdout testing.
            </p>
          </div>
        </div>
      </section>

      {/* Three Class Showcase Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-200">
            <Sprout className="w-3.5 h-3.5 text-emerald-700" />
            <span>Pathology Spectrum</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Target Disease Classifications
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
            Our deep learning model distinguishes between healthy leaves and common destructive fungal/oomycete pathogens.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Healthy */}
          <div className="bg-white rounded-3xl p-7 sm:p-8 border border-emerald-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">Class 01</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">Healthy Leaf</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Vibrant green foliage without chlorosis, concentric lesions, or water-soaked patches. Demonstrates optimal chlorophyll density and cellular tissue health.
              </p>
            </div>
            <Link
              to="/guide#healthy"
              className="pt-4 flex items-center gap-2 text-emerald-800 font-bold text-sm hover:gap-3 transition-all border-t border-slate-100"
            >
              <span>View Healthy Management Guide</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: Early Blight */}
          <div className="bg-white rounded-3xl p-7 sm:p-8 border border-amber-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-inner">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700">Class 02</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">Early Blight</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Caused by <em>Alternaria solani</em>. Characterized by small, dark brown spots expanding into distinctive concentric target rings surrounded by chlorotic yellow halos.
              </p>
            </div>
            <Link
              to="/guide#early-blight"
              className="pt-4 flex items-center gap-2 text-amber-800 font-bold text-sm hover:gap-3 transition-all border-t border-slate-100"
            >
              <span>View Early Blight Guide</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 3: Late Blight */}
          <div className="bg-white rounded-3xl p-7 sm:p-8 border border-rose-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shadow-inner">
                <AlertOctagon className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-700">Class 03</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">Late Blight</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Caused by <em>Phytophthora infestans</em>. High-risk pathogen displaying water-soaked lesions, purplish-black foliar necrosis, and white downy mildew under humid conditions.
              </p>
            </div>
            <Link
              to="/guide#late-blight"
              className="pt-4 flex items-center gap-2 text-rose-800 font-bold text-sm hover:gap-3 transition-all border-t border-slate-100"
            >
              <span>View Late Blight Outbreak Guide</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* Metrics Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden border border-emerald-800">
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">99.1%</div>
              <div className="text-xs sm:text-sm text-emerald-200 font-semibold">Holdout Test Accuracy</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">0.9908</div>
              <div className="text-xs sm:text-sm text-emerald-200 font-semibold">Weighted F1-Score</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">323</div>
              <div className="text-xs sm:text-sm text-emerald-200 font-semibold">Independent Test Samples</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">60%–96%</div>
              <div className="text-xs sm:text-sm text-emerald-200 font-semibold">Calibrated Confidence Range</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
