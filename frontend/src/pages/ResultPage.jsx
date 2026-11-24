import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  RefreshCw,
  History,
  ShieldAlert,
  Sparkles,
  BookOpen,
  ArrowRight,
  Info,
  Layers,
  Sprout
} from 'lucide-react';
import ConfidenceBadge from '../components/ConfidenceBadge';
import ProbabilityDistributionCard from '../components/ProbabilityDistributionCard';

const DISEASE_DETAILS = {
  'Healthy': {
    title: 'Healthy Potato Foliage',
    scientificName: 'Solanum tuberosum (Optimal Health)',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    icon: CheckCircle2,
    color: 'emerald',
    description: 'The leaf exhibits strong green chlorophyll pigmentation, uniform cellular tissue, and a complete absence of fungal or oomycete foliar lesions.',
    symptoms: [
      'Uniform, deep green leaf coloration across the entire lamina',
      'No chlorotic yellowing, necrotic spotting, or concentric rings',
      'Intact leaf veins with firm petioles and absence of mold/spores'
    ],
    prevention: [
      'Maintain balanced nitrogen, phosphorus, and potassium (NPK) fertilizer management.',
      'Utilize drip irrigation or morning watering to minimize prolonged foliage wetness.',
      'Maintain routine field scouting protocols to catch early micro-pathogen incursions.'
    ]
  },
  'Early Blight': {
    title: 'Early Blight Infection',
    scientificName: 'Alternaria solani',
    badgeClass: 'bg-amber-100 text-amber-950 border-amber-300',
    icon: AlertTriangle,
    color: 'amber',
    description: 'A prevalent fungal foliar disease characterized by brown-to-black necrotic lesions displaying distinctive concentric target rings, predominantly starting on mature lower canopy leaves.',
    symptoms: [
      'Dark brown to black circular lesions with characteristic concentric target rings',
      'Distinct yellow chlorotic halo surrounding expanding necrotic lesions',
      'Premature leaf senescence and defoliation progressing from lower to upper canopy'
    ],
    prevention: [
      'Execute 2 to 3-year crop rotation schedules with non-solanaceous crops.',
      'Maintain adequate inter-plant spacing to maximize air circulation through the canopy.',
      'Thoroughly eradicate and decompose infected harvest debris and volunteer plants.'
    ]
  },
  'Late Blight': {
    title: 'Late Blight Outbreak',
    scientificName: 'Phytophthora infestans',
    badgeClass: 'bg-rose-100 text-rose-950 border-rose-300',
    icon: AlertOctagon,
    color: 'rose',
    description: 'A destructive, high-velocity oomycete pathogen capable of causing total foliar collapse and tuber rot under cool, high-humidity weather conditions.',
    symptoms: [
      'Water-soaked, pale to dark irregular necrotic lesions on leaf tips and margins',
      'Delicate white downy fungal mildew on the abaxial (underside) leaf surface during humid periods',
      'Rapid blackened foliar necrosis and foul odor as entire plant canopies collapse'
    ],
    prevention: [
      'Plant certified disease-free seed tubers from verified clean seed programs.',
      'Avoid overhead sprinkler irrigation during high-humidity or foggy periods.',
      'Promptly destroy infected cull piles and volunteer hosts to eliminate overwintering spore reservoirs.'
    ]
  },
  'Not a Potato Leaf': {
    title: 'Invalid Sample — Not a Potato Leaf',
    scientificName: 'Non-Plant / Synthetic Object',
    badgeClass: 'bg-slate-100 text-slate-900 border-slate-300',
    icon: AlertOctagon,
    color: 'slate',
    description: 'The uploaded image failed biological plant verification. The pre-inference validation rejected an artificial graphic, screenshot, digital logo, or non-foliage object.',
    symptoms: [
      'Image lacks cellular chlorophyll texture and natural leaf venation',
      'Detected synthetic flat colors, vector boundaries, or non-plant spectral signatures',
      'Statistical distribution falls outside botanical potato pathology parameters'
    ],
    prevention: [
      'Photograph an authentic potato plant leaf under natural daylight conditions.',
      'Place the leaf against a neutral, uncluttered background.',
      'Avoid logos, computer icons, text screenshots, or household objects.'
    ]
  }
};

export default function ResultPage() {
  const location = useLocation();
  const prediction = location.state?.prediction;

  if (!prediction) {
    return <Navigate to="/detect" replace />;
  }

  const {
    imageUrl,
    predictedClass,
    confidence,
    rawConfidence,
    displayedConfidence,
    isConfidenceCapped,
    classProbabilities,
    createdAt
  } = prediction;

  // Check if image was rejected by Stage 1 Potato Validator
  const isRejected =
    prediction.status === 'rejected' ||
    prediction.isPotatoLeaf === false ||
    prediction.isLeaf === false ||
    predictedClass === 'Unsupported Image' ||
    predictedClass === 'Not a Potato Leaf';

  if (isRejected) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8 animate-fadeIn">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-800 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            <span>Validation Failure • Non-Potato Foliage</span>
          </div>
          <Link
            to="/detect"
            className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Upload Another Image
          </Link>
        </div>

        {/* Professional Rejection Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-rose-200 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Warning Icon Badge */}
            <div className="w-20 h-20 rounded-3xl bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0 shadow-inner">
              <AlertOctagon className="w-10 h-10" />
            </div>

            <div className="space-y-3 text-center sm:text-left flex-grow">
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 text-[11px] font-black uppercase tracking-wider">
                Stage 1 AI Pipeline Rejection
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Unsupported Image Detected
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                This image does not appear to be a potato leaf. Please upload a clear photograph of a potato leaf to detect Healthy, Early Blight, or Late Blight.
              </p>
            </div>
          </div>

          {/* Uploaded Image Preview & Stage 1 Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-slate-100 items-center">
            {imageUrl && (
              <div className="md:col-span-5 relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-sm max-h-64 flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt="Uploaded unsupported specimen"
                  className="w-full h-56 object-cover"
                />
                <div className="absolute top-3 left-3 bg-rose-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-white border border-rose-500/30">
                  Rejected Sample
                </div>
              </div>
            )}

            <div className={`${imageUrl ? 'md:col-span-7' : 'md:col-span-12'} space-y-4`}>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-600">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Two-Stage Pipeline Safety Guard</span>
                </div>
                <p className="leading-relaxed">
                  PotatoCare AI runs a dedicated Stage 1 MobileNetV2 binary classifier to protect growers against false pathology diagnoses on non-target crops (such as mango, tomato, apple, pepper leaves, or non-foliage objects).
                </p>
                {prediction.stage1 && (
                  <div className="pt-2 flex items-center gap-3 font-mono text-[11px]">
                    <span className="bg-white px-2 py-1 rounded-md border border-slate-200">
                      Non-Potato Probability: <strong>{((prediction.stage1.nonPotatoProbability || 1.0) * 100).toFixed(1)}%</strong>
                    </span>
                    <span className="bg-white px-2 py-1 rounded-md border border-slate-200">
                      Potato Probability: <strong>{((prediction.stage1.potatoProbability || 0.0) * 100).toFixed(1)}%</strong>
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <Link
                  to="/detect"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/15 transition-all"
                >
                  <RefreshCw className="w-4 h-4" /> Upload Another Image
                </Link>
                <Link
                  to="/guide"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-5 py-3 rounded-xl text-sm font-semibold transition-all shadow-sm"
                >
                  <BookOpen className="w-4 h-4 text-emerald-700" /> View Potato Leaf Guide
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const details = DISEASE_DETAILS[predictedClass] || DISEASE_DETAILS['Healthy'];
  const Icon = details.icon;

  const actualRaw = typeof rawConfidence === 'number' ? rawConfidence : confidence;
  const rawPct = (actualRaw * 100).toFixed(1);
  const dispVal = typeof displayedConfidence === 'number'
    ? displayedConfidence
    : (typeof prediction.calibratedConfidence === 'number' ? prediction.calibratedConfidence : actualRaw);
  const dispPct = (dispVal * 100).toFixed(1);
  const isCapped = false;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-fadeIn">

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <Sprout className="w-3.5 h-3.5 text-emerald-700" />
            <span>AI Pathology Diagnosis</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">
            Classification Analysis
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Timestamp: {new Date(createdAt || Date.now()).toLocaleString()} • MobileNetV2 Deep CNN
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/detect"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-emerald-900/15 transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Scan Another Leaf
          </Link>
          <Link
            to="/history"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            <History className="w-4 h-4 text-emerald-700" /> History
          </Link>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column: Image Card & Softmax Distribution (5 cols) */}
        <div className="lg:col-span-5 space-y-6">

          {/* Leaf Photo Preview Card */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-lg p-3 space-y-3">
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center">
              <img
                src={imageUrl}
                alt={`Uploaded ${predictedClass} leaf`}
                className="w-full h-72 sm:h-80 object-cover rounded-xl"
              />
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-xl text-[11px] font-bold text-white border border-white/20">
                Processed 224×224 Tensor
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center gap-2">
              <ConfidenceBadge
                diseaseClass={predictedClass}
                confidence={dispVal}
                rawConfidence={actualRaw}
                isCapped={isCapped}
                size="lg"
              />
            </div>
          </div>

          {/* Calibrated Probability Distribution Card (Task 4 & Section E) */}
          <ProbabilityDistributionCard
            predictedClass={predictedClass}
            calibratedConfidence={prediction.calibratedConfidence ?? dispVal}
            rawConfidence={actualRaw}
            displayedConfidence={dispVal}
            probabilities={classProbabilities}
            isConfidenceCapped={isCapped}
          />

        </div>

        {/* Right Column: Disease Breakdown & Recommendations (7 cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* Primary Diagnosis Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-lg space-y-6">

            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3.5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${details.color === 'emerald' ? 'bg-emerald-100 text-emerald-800' :
                  details.color === 'amber' ? 'bg-amber-100 text-amber-800' :
                    details.color === 'rose' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                  <Icon className="w-8 h-8" />
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Predicted Pathology</span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{details.title}</h2>
                  <p className="text-xs italic text-slate-500">{details.scientificName}</p>
                </div>
              </div>

              {/* Confidence Stat Box */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Displayed Score</span>
                <span className="text-2xl font-black text-slate-900">{dispPct}%</span>
                {isCapped && (
                  <span className="block text-[10px] text-amber-700 font-semibold mt-0.5">
                    (Capped at 90% Policy Max)
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-100">
              {details.description}
            </p>

            {/* Visual Symptoms Checklist */}
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700" /> Characteristic Foliar Symptoms
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                {details.symptoms.map((symptom, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0"></span>
                    <span className="leading-relaxed">{symptom}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* General Prevention & Management Measures */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-700" /> Agronomic Prevention & Best Practices
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                {details.prevention.map((measure, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                    <span className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 shrink-0"></span>
                    <span className="leading-relaxed">{measure}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2">
              <Link
                to="/guide"
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 hover:text-emerald-900 hover:underline"
              >
                <span>Read detailed disease guide and management protocols</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

          {/* Diagnostic Policy Disclaimer Box */}
          <div className="bg-amber-50/80 border border-amber-200 p-4 sm:p-5 rounded-3xl flex items-start gap-3.5 text-xs text-amber-950 shadow-sm">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-amber-950 text-sm">System Confidence Policy Notice</p>
              <p className="leading-relaxed text-amber-900">
                To prevent agricultural overconfidence, displayed confidence is restricted to a maximum of <strong>90.0%</strong>. The actual model probability was <strong>{rawPct}%</strong>. Deep learning foliar screening should always be complemented by verified agronomic scouting.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
