import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  UploadCloud,
  Image as ImageIcon,
  X,
  AlertCircle,
  Loader2,
  Sparkles,
  CheckCircle2,
  FileCheck,
  Zap,
  ShieldCheck,
  Layers
} from 'lucide-react';
import ModelStatusBanner from '../components/ModelStatusBanner';

export default function DetectPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedSampleName, setSelectedSampleName] = useState(null);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const validateAndSetFile = (file, sampleName = null) => {
    setErrorMsg(null);
    setSelectedSampleName(sampleName);

    if (!file) return;

    // Check File Extension / Type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const ext = file.name ? file.name.split('.').pop().toLowerCase() : 'jpg';
    const isValidExt = ['jpg', 'jpeg', 'png'].includes(ext);

    if (!allowedTypes.includes(file.type) && !isValidExt) {
      setErrorMsg('Invalid file format. Please upload an authentic JPG, JPEG, or PNG leaf image.');
      return;
    }

    // Check File Size (10MB Max)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds maximum limit of 10MB.`);
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    validateAndSetFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMsg(null);
    setSelectedSampleName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSelectSample = async (sampleType, samplePath) => {
    setErrorMsg(null);
    try {
      const response = await fetch(samplePath);
      const blob = await response.blob();
      const file = new File([blob], `${sampleType.toLowerCase().replace(/\s+/g, '_')}_sample.jpg`, { type: 'image/jpeg' });
      validateAndSetFile(file, sampleType);
    } catch (err) {
      setErrorMsg(`Could not load ${sampleType} sample image.`);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setErrorMsg('Please select or upload a potato leaf image first.');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await axios.post('/api/predictions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 25000
      });

      // Redirect to Result Page with complete diagnosis data
      navigate('/result', { state: { prediction: response.data } });

    } catch (err) {
      console.error('Prediction Upload Error:', err);
      const message = err.response?.data?.error || err.response?.data?.detail || 'Failed to communicate with prediction service. Ensure the Express backend and AI FastAPI service are running.';
      setErrorMsg(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-fadeIn">
      
      {/* Title & Introduction */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          <span>Deep Learning Inference</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
          Potato Leaf Disease Diagnosis
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Upload a clear photograph of a potato leaf. Our trained <span className="font-bold text-slate-800">MobileNetV2</span> model will analyze foliar patterns to detect <span className="font-semibold text-emerald-700">Healthy</span>, <span className="font-semibold text-amber-700">Early Blight</span>, or <span className="font-semibold text-rose-700">Late Blight</span> with calibrated model confidence.
        </p>
      </div>

      <ModelStatusBanner />

      {/* Main Upload Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl space-y-6">
        
        {/* Error Alert Box */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-950 p-4 rounded-2xl flex items-start gap-3 text-sm animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Notice: </span>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Quick Sample Leaf Selection Bar */}
        <div className="space-y-3 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Quick Test Samples (Click to load):
            </span>
            <span className="text-[11px] text-slate-400 font-medium">PlantVillage Dataset</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleSelectSample('Healthy', '/samples/healthy_sample.jpg')}
              className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                selectedSampleName === 'Healthy'
                  ? 'bg-emerald-100/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
              }`}
            >
              <img
                src="/samples/healthy_sample.jpg"
                alt="Healthy sample"
                className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">Healthy Leaf</p>
                <p className="text-[10px] text-emerald-700 font-semibold">Optimal Foliage</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectSample('Early Blight', '/samples/early_blight_sample.jpg')}
              className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                selectedSampleName === 'Early Blight'
                  ? 'bg-amber-100/90 border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/40'
              }`}
            >
              <img
                src="/samples/early_blight_sample.jpg"
                alt="Early Blight sample"
                className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">Early Blight</p>
                <p className="text-[10px] text-amber-700 font-semibold">Target Spots</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectSample('Late Blight', '/samples/late_blight_sample.jpg')}
              className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                selectedSampleName === 'Late Blight'
                  ? 'bg-rose-100/90 border-rose-500 ring-2 ring-rose-500/20 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-rose-300 hover:bg-rose-50/40'
              }`}
            >
              <img
                src="/samples/late_blight_sample.jpg"
                alt="Late Blight sample"
                className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">Late Blight</p>
                <p className="text-[10px] text-rose-700 font-semibold">Water-soaked Lesions</p>
              </div>
            </button>
          </div>

          {/* Non-Potato Rejection Tests Row */}
          <div className="pt-2 border-t border-slate-200/60">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Non-Potato Plant Rejection Verification (Stage 1 AI Guard):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleSelectSample('Mango Leaf', '/samples/mango_sample.jpg')}
                className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                  selectedSampleName === 'Mango Leaf'
                    ? 'bg-rose-100 border-rose-400 ring-2 ring-rose-400/20'
                    : 'bg-white border-slate-200 hover:bg-slate-100/70'
                }`}
              >
                <img src="/samples/mango_sample.jpg" alt="Mango" className="w-7 h-7 object-cover rounded-md shrink-0" />
                <span className="text-xs font-semibold text-slate-800 truncate">Mango Leaf</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSample('Tomato Leaf', '/samples/tomato_leaf_sample.jpg')}
                className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                  selectedSampleName === 'Tomato Leaf'
                    ? 'bg-rose-100 border-rose-400 ring-2 ring-rose-400/20'
                    : 'bg-white border-slate-200 hover:bg-slate-100/70'
                }`}
              >
                <img src="/samples/tomato_leaf_sample.jpg" alt="Tomato" className="w-7 h-7 object-cover rounded-md shrink-0" />
                <span className="text-xs font-semibold text-slate-800 truncate">Tomato Leaf</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSample('Apple Leaf', '/samples/apple_sample.jpg')}
                className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                  selectedSampleName === 'Apple Leaf'
                    ? 'bg-rose-100 border-rose-400 ring-2 ring-rose-400/20'
                    : 'bg-white border-slate-200 hover:bg-slate-100/70'
                }`}
              >
                <img src="/samples/apple_sample.jpg" alt="Apple" className="w-7 h-7 object-cover rounded-md shrink-0" />
                <span className="text-xs font-semibold text-slate-800 truncate">Other Plant Leaf</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSample('Human Face', '/samples/human_sample.jpg')}
                className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                  selectedSampleName === 'Human Face'
                    ? 'bg-rose-100 border-rose-400 ring-2 ring-rose-400/20'
                    : 'bg-white border-slate-200 hover:bg-slate-100/70'
                }`}
              >
                <img src="/samples/human_sample.jpg" alt="Human" className="w-7 h-7 object-cover rounded-md shrink-0" />
                <span className="text-xs font-semibold text-slate-800 truncate">Non-Plant Object</span>
              </button>
            </div>
          </div>
        </div>

        {/* File Dropzone / Preview */}
        {!previewUrl ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 sm:p-14 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-emerald-600 bg-emerald-50/90 scale-[1.01]'
                : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg, image/jpg, image/png"
              className="hidden"
            />
            
            <div className="space-y-4 max-w-sm mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
                <UploadCloud className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <p className="text-base sm:text-lg font-bold text-slate-900">
                  Drag & drop potato leaf photo here
                </p>
                <p className="text-xs text-slate-500">
                  or <span className="text-emerald-700 font-bold underline hover:text-emerald-800">browse files</span> from your local device
                </p>
              </div>

              <div className="pt-2 text-xs text-slate-400 font-medium space-x-2">
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">JPG</span>
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">JPEG</span>
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">PNG</span>
                <p className="text-[11px] text-slate-400 mt-2">Maximum file size: 10MB</p>
              </div>
            </div>
          </div>
        ) : (
          /* Preview State */
          <div className="space-y-5">
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-950 max-h-[420px] flex items-center justify-center group shadow-md">
              <img
                src={previewUrl}
                alt="Selected Leaf Preview"
                className="max-h-[380px] w-auto object-contain rounded-2xl p-2"
              />
              
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-4 right-4 p-2 bg-slate-900/85 hover:bg-rose-600 text-white rounded-full transition-colors shadow-lg backdrop-blur-md"
                title="Remove image"
                aria-label="Remove image"
              >
                <X className="w-5 h-5" />
              </button>

              {selectedSampleName && (
                <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-xs font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Test Sample: {selectedSampleName}</span>
                </div>
              )}
            </div>

            {/* File Info Pill */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 truncate max-w-xs">{selectedFile?.name}</p>
                  <p className="text-slate-500">
                    {selectedFile?.size ? (selectedFile.size / (1024 * 1024)).toFixed(2) : '0.15'} MB • Ready for analysis
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-emerald-800 font-bold hover:underline self-end sm:self-auto"
              >
                Choose Different Photo
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg, image/jpg, image/png"
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!selectedFile || isUploading}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-base shadow-lg transition-all ${
              !selectedFile || isUploading
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-emerald-900/20 hover:shadow-emerald-900/30 transform active:scale-98'
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Running MobileNetV2 Deep Learning Inference...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-emerald-300" />
                <span>Analyze Leaf with AI</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
}
