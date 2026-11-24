import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  HelpCircle,
  ShieldCheck,
  Sprout,
  ArrowRight,
  ScanLine,
  Leaf
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GuidePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12 animate-fadeIn">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          <Sprout className="w-4 h-4 text-emerald-700" />
          <span>Agricultural Reference Library</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
          Potato Leaf Disease Guide
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Learn how to distinguish healthy foliage from Early Blight (*Alternaria solani*) and Late Blight (*Phytophthora infestans*). Recognize symptom patterns early to safeguard tuber yield.
        </p>
      </div>

      {/* Guide Cards */}
      <div className="space-y-10">
        
        {/* Section 1: Healthy */}
        <section id="healthy" className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-200/90 shadow-lg space-y-6 scroll-mt-24">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-100 pb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">Class 01 • Optimal Foliage</span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Healthy Potato Foliage</h2>
              </div>
            </div>

            <Link
              to="/detect"
              className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-bold transition-all"
            >
              <ScanLine className="w-3.5 h-3.5" /> Test Healthy Leaf
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-100/80 space-y-2">
              <h4 className="font-bold text-emerald-950 text-sm">Visual Identification</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Smooth, uniform deep green leaves. Firm leaf petioles without yellow chlorotic halos, brown concentric bullseyes, or grayish water-soaked margins.
              </p>
            </div>

            <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-100/80 space-y-2">
              <h4 className="font-bold text-emerald-950 text-sm">Agronomic Maintenance</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Maintain balanced nitrogen-phosphorus-potassium (NPK) nutrition. Avoid over-fertilization with nitrogen, which produces succulent canopy growth vulnerable to spores.
              </p>
            </div>

            <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-100/80 space-y-2">
              <h4 className="font-bold text-emerald-950 text-sm">Water Management</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Use drip irrigation or water during morning hours to ensure leaf surfaces dry rapidly in the sun, minimizing the wetness hours required for fungal germination.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Early Blight */}
        <section id="early-blight" className="bg-white rounded-3xl p-6 sm:p-10 border border-amber-200/90 shadow-lg space-y-6 scroll-mt-24">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-100 pb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-inner">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700">Class 02 • Fungal Pathogen</span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Early Blight (Alternaria solani)</h2>
              </div>
            </div>

            <Link
              to="/detect"
              className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-4 py-2 rounded-xl text-xs font-bold transition-all"
            >
              <ScanLine className="w-3.5 h-3.5" /> Test Early Blight Leaf
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-100/80 space-y-2">
              <h4 className="font-bold text-amber-950 text-sm">Visual Symptoms</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Small dark brown lesions expanding into characteristic concentric target rings ("bullseye"). Surrounded by bright yellow chlorotic halos, starting on older bottom leaves.
              </p>
            </div>

            <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-100/80 space-y-2">
              <h4 className="font-bold text-amber-950 text-sm">Preventative Tactics</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Implement a strict 2 to 3-year non-host crop rotation (corn, beans, brassicas). Maintain wide row spacing to allow adequate canopy aeration.
              </p>
            </div>

            <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-100/80 space-y-2">
              <h4 className="font-bold text-amber-950 text-sm">Field Sanitation</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Deep-plow or destroy post-harvest potato vines and residue, as <em>Alternaria solani</em> conidia overwinter in dead organic matter in soil.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Late Blight */}
        <section id="late-blight" className="bg-white rounded-3xl p-6 sm:p-10 border border-rose-200/90 shadow-lg space-y-6 scroll-mt-24">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-rose-100 pb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 shadow-inner">
                <AlertOctagon className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-700">Class 03 • Destructive Oomycete</span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Late Blight (Phytophthora infestans)</h2>
              </div>
            </div>

            <Link
              to="/detect"
              className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 px-4 py-2 rounded-xl text-xs font-bold transition-all"
            >
              <ScanLine className="w-3.5 h-3.5" /> Test Late Blight Leaf
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="bg-rose-50/60 p-5 rounded-2xl border border-rose-100/80 space-y-2">
              <h4 className="font-bold text-rose-950 text-sm">Visual Symptoms</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Large, irregular water-soaked pale green or dark necrotic patches on leaf tips and margins. In humid conditions, white downy mold appears on leaf undersides.
              </p>
            </div>

            <div className="bg-rose-50/60 p-5 rounded-2xl border border-rose-100/80 space-y-2">
              <h4 className="font-bold text-rose-950 text-sm">Certified Clean Seed</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Plant only certified disease-free seed tubers. Infected seed tubers are the primary source of early seasonal field outbreaks.
              </p>
            </div>

            <div className="bg-rose-50/60 p-5 rounded-2xl border border-rose-100/80 space-y-2">
              <h4 className="font-bold text-rose-950 text-sm">Cull Pile Eradication</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Completely eliminate volunteer potato plants and cull piles early in the season. These harbor spores that travel miles on moist wind currents.
              </p>
            </div>
          </div>
        </section>

      </div>

      {/* Footer CTA */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-xl">
        <h3 className="text-2xl font-black">Diagnose your leaf sample now</h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Upload any potato leaf photo to run inference through our trained MobileNetV2 neural network.
        </p>
        <div className="pt-2">
          <Link
            to="/detect"
            className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-7 py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-emerald-900/30 transition-all"
          >
            <span>Open Leaf Scanner</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

    </div>
  );
}
