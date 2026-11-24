import React from 'react';
import {
  Info,
  Cpu,
  Database,
  Sprout,
  ShieldAlert,
  CheckCircle2,
  Layers,
  GitBranch,
  ArrowRight,
  BarChart3,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12 animate-fadeIn">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          <Info className="w-4 h-4 text-emerald-700" />
          <span>Technical Architecture & Validation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
          About PotatoCare AI Model
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Comprehensive documentation of the MobileNetV2 deep learning classification architecture, training protocol, and independent test dataset evaluation.
        </p>
      </div>

      {/* Model Performance Highlights */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-lg space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Evaluation Metrics</span>
            <h2 className="text-2xl font-black text-slate-900">Independent Holdout Test Set Performance</h2>
          </div>
          <span className="bg-emerald-100 text-emerald-900 font-bold text-xs px-3 py-1.5 rounded-full border border-emerald-200">
            323 Unseen Test Samples (15% Holdout)
          </span>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 text-center">
            <span className="text-xs text-slate-500 font-semibold block">Test Accuracy</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-800">99.07%</span>
          </div>
          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 text-center">
            <span className="text-xs text-slate-500 font-semibold block">Weighted F1-Score</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-800">0.9908</span>
          </div>
          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 text-center">
            <span className="text-xs text-slate-500 font-semibold block">Macro F1-Score</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-800">0.9816</span>
          </div>
          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 text-center">
            <span className="text-xs text-slate-500 font-semibold block">Weighted Recall</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-800">0.9907</span>
          </div>
        </div>

        {/* Detailed Class-Wise Classification Report Table */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Class-Wise Prediction Performance</h3>
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase">
                <tr>
                  <th className="py-3 px-4">Disease Category</th>
                  <th className="py-3 px-4">Precision</th>
                  <th className="py-3 px-4">Recall</th>
                  <th className="py-3 px-4">F1-Score</th>
                  <th className="py-3 px-4 text-right">Holdout Support</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-amber-800">Early Blight (Alternaria solani)</td>
                  <td className="py-3 px-4">99.34%</td>
                  <td className="py-3 px-4">100.00%</td>
                  <td className="py-3 px-4 font-bold text-slate-900">0.9967</td>
                  <td className="py-3 px-4 text-right">150 images</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-emerald-800">Healthy Foliage</td>
                  <td className="py-3 px-4">92.00%</td>
                  <td className="py-3 px-4">100.00%</td>
                  <td className="py-3 px-4 font-bold text-slate-900">0.9583</td>
                  <td className="py-3 px-4 text-right">23 images</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-rose-800">Late Blight (Phytophthora infestans)</td>
                  <td className="py-3 px-4">100.00%</td>
                  <td className="py-3 px-4">98.00%</td>
                  <td className="py-3 px-4 font-bold text-slate-900">0.9899</td>
                  <td className="py-3 px-4 text-right">150 images</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Confusion Matrix Table */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Confusion Matrix (Rows: Ground Truth, Columns: Predictions)</h3>
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-center text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase">
                <tr>
                  <th className="py-3 px-4 text-left">Actual Class</th>
                  <th className="py-3 px-4">Pred: Early Blight</th>
                  <th className="py-3 px-4">Pred: Healthy</th>
                  <th className="py-3 px-4">Pred: Late Blight</th>
                  <th className="py-3 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="py-3 px-4 text-left font-bold text-amber-800">Early Blight</td>
                  <td className="py-3 px-4 bg-emerald-50 text-emerald-900 font-bold">150</td>
                  <td className="py-3 px-4 text-slate-400">0</td>
                  <td className="py-3 px-4 text-slate-400">0</td>
                  <td className="py-3 px-4 text-right font-semibold">150</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-left font-bold text-emerald-800">Healthy</td>
                  <td className="py-3 px-4 text-slate-400">0</td>
                  <td className="py-3 px-4 bg-emerald-50 text-emerald-900 font-bold">23</td>
                  <td className="py-3 px-4 text-slate-400">0</td>
                  <td className="py-3 px-4 text-right font-semibold">23</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-left font-bold text-rose-800">Late Blight</td>
                  <td className="py-3 px-4 text-slate-600">1</td>
                  <td className="py-3 px-4 text-slate-600">2</td>
                  <td className="py-3 px-4 bg-emerald-50 text-emerald-900 font-bold">147</td>
                  <td className="py-3 px-4 text-right font-semibold">150</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Confidence Calibration Policy Box */}
      <div className="bg-emerald-50/90 border border-emerald-200 p-6 sm:p-8 rounded-3xl space-y-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-emerald-950">Scientific Probability Calibration (60%–96% Typical Range)</h2>
        </div>
        <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
          In agricultural decision support systems, presenting extreme 99.9% or 100% confidence to farmers can induce dangerous false security against fungal mutations or mixed field infections. To ensure reliable AI practices, PotatoCare AI applies post-hoc validation temperature scaling ($T=4.0$). This softens raw neural logits into calibrated posterior probabilities, ensuring predictions generally fall within a realistic <strong>60% to 96% confidence range</strong> while preserving 100% of the model's classification accuracy (<strong>99.1%</strong> on holdout test data).
        </p>
        <p className="text-xs text-emerald-800 leading-relaxed">
          Both raw uncalibrated probabilities and temperature-scaled posterior distributions are recorded for research auditability and agronomic transparency.
        </p>
      </div>

      {/* Tech Stack List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-6">
        <h2 className="text-xl font-black text-slate-900">Complete Technology Architecture</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-600">
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-600" /> Frontend Client
            </h4>
            <ul className="space-y-1.5">
              <li>React 18 + Vite</li>
              <li>Tailwind CSS Responsive Design</li>
              <li>React Router DOM v6</li>
              <li>Recharts Visualization</li>
              <li>Lucide Agricultural Icons</li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" /> Backend API Server
            </h4>
            <ul className="space-y-1.5">
              <li>Node.js + Express.js</li>
              <li>Multer Storage Engine (10MB Limit)</li>
              <li>MongoDB Atlas / Memory Fallback</li>
              <li>Helmet & CORS Security</li>
              <li>Axios Multipart Stream Client</li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-600" /> AI Inference Engine
            </h4>
            <ul className="space-y-1.5">
              <li>Python 3.14 + FastAPI</li>
              <li>PyTorch MobileNetV2 CNN</li>
              <li>ImageNet Normalization Transform</li>
              <li>Pillow & NumPy Feature Validation</li>
              <li>Pydantic Response Validation</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="text-center pt-2">
        <Link
          to="/detect"
          className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-900/20 transition-all"
        >
          <span>Test the AI Model on a Leaf</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
