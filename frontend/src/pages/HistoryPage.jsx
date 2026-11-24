import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  History,
  Filter,
  ArrowUpDown,
  Trash2,
  Calendar,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Sprout
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ConfidenceBadge from '../components/ConfidenceBadge';

export default function HistoryPage() {
  const [predictions, setPredictions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 8, totalPages: 1, total: 0 });
  const [classFilter, setClassFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchHistory = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/predictions', {
        params: {
          page,
          limit: pagination.limit,
          classFilter,
          sortBy
        }
      });
      setPredictions(res.data.data || []);
      setPagination(res.data.pagination || { page: 1, limit: 8, totalPages: 1, total: 0 });
    } catch (err) {
      console.error('Fetch History Error:', err);
      setError('Failed to load prediction history records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
  }, [classFilter, sortBy]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prediction record and leaf image?')) {
      return;
    }

    setDeletingId(id);
    try {
      await axios.delete(`/api/predictions/${id}`);
      fetchHistory(pagination.page);
    } catch (err) {
      alert('Failed to delete prediction record.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-fadeIn">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <Sprout className="w-3.5 h-3.5 text-emerald-700" />
            <span>Audit Trail & Records</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">
            Leaf Analysis History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review past potato leaf scans, disease diagnoses, and confidence ratings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/detect"
            className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all"
          >
            New Leaf Diagnosis
          </Link>
          <button
            onClick={() => fetchHistory(pagination.page)}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Filter & Sorting Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">

        {/* Disease Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {['all', 'Healthy', 'Early Blight', 'Late Blight'].map((cls) => (
            <button
              key={cls}
              onClick={() => setClassFilter(cls)}




              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${classFilter === cls
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {cls === 'all' ? 'All Classes' : cls}
            </button>
          ))}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 justify-end">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

      </div>

      {/* Content Table / Cards */}
      {loading ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-700 mx-auto" />
          <p className="text-sm text-slate-500 font-medium">Loading history logs...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-950 p-6 rounded-3xl text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <p className="font-bold">{error}</p>
        </div>
      ) : predictions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 sm:p-16 border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <History className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900">No Prediction Records Found</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            No leaf diagnoses match the selected filters. Upload a leaf photo on the Detect Disease page to generate your first audit record!
          </p>
          <div className="pt-2">
            <Link
              to="/detect"
              className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md"
            >
              Scan Leaf Now
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Table Container for Desktop */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hidden md:block">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Leaf Sample</th>
                  <th className="py-4 px-6">Diagnosis & Badge</th>
                  <th className="py-4 px-6">Calibrated Confidence</th>
                  <th className="py-4 px-6">Scan Timestamp</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {predictions.map((record) => {
                  const isRejected = record.status === 'rejected' || record.predictedClass === 'Unsupported Image' || record.predictedClass === 'Non-Potato Leaf' || record.isPotatoLeaf === false;
                  const dispConf = typeof record.calibratedConfidence === 'number'
                    ? record.calibratedConfidence
                    : (typeof record.displayedConfidence === 'number' ? record.displayedConfidence : (record.confidence || 0));
                  const rawConf = typeof record.rawConfidence === 'number'
                    ? record.rawConfidence
                    : (record.confidence || 0);
                  const hasRawDiff = Math.abs(rawConf - dispConf) > 0.01;

                  return (
                    <tr key={record._id} className="hover:bg-slate-50/60 transition-colors">

                      {/* Thumbnail */}
                      <td className="py-3.5 px-6">
                        <img
                          src={record.imageUrl}
                          alt="Leaf thumbnail"
                          className="w-14 h-14 object-cover rounded-xl border border-slate-200 bg-slate-900 shadow-sm"
                        />
                      </td>

                      {/* Class & Badge */}
                      <td className="py-3.5 px-6">
                        <div className="space-y-1">
                          <ConfidenceBadge
                            diseaseClass={record.predictedClass}
                            confidence={dispConf}
                            rawConfidence={rawConf}
                            size="sm"
                            showRawTooltip={false}
                          />
                        </div>
                      </td>

                      {/* Confidence % */}
                      <td className="py-3.5 px-6">
                        {isRejected ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
                              Validation Rejected
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium block">
                              Non-Potato Foliage
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <div className="font-extrabold text-slate-900 text-sm">
                              {(dispConf * 100).toFixed(1)}%
                            </div>
                            {hasRawDiff && (
                              <span className="text-[10px] text-slate-500 font-medium block">
                                (Raw: {(rawConf * 100).toFixed(1)}%)
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-6 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(record.createdAt).toLocaleString()}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => handleDelete(record._id)}
                          disabled={deletingId === record._id}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50"
                          title="Delete record"
                          aria-label="Delete record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Grid Layout */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {predictions.map((record) => {
              const isRejected = record.status === 'rejected' || record.predictedClass === 'Unsupported Image' || record.predictedClass === 'Non-Potato Leaf' || record.isPotatoLeaf === false;
              const dispConf = typeof record.calibratedConfidence === 'number'
                ? record.calibratedConfidence
                : (typeof record.displayedConfidence === 'number' ? record.displayedConfidence : (record.confidence || 0));
              const rawConf = typeof record.rawConfidence === 'number'
                ? record.rawConfidence
                : (record.confidence || 0);

              return (
                <div key={record._id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <img
                    src={record.imageUrl}
                    alt="Thumbnail"
                    className="w-20 h-20 object-cover rounded-xl border border-slate-200 bg-slate-900 shrink-0 shadow-sm"
                  />
                  <div className="space-y-1.5 flex-grow min-w-0">
                    <ConfidenceBadge
                      diseaseClass={record.predictedClass}
                      confidence={dispConf}
                      rawConfidence={rawConf}
                      size="sm"
                      showRawTooltip={false}
                    />
                    {isRejected ? (
                      <span className="text-[11px] text-rose-700 font-semibold block">
                        Validation Rejected: Non-Potato Image
                      </span>
                    ) : (
                      <div className="text-xs font-bold text-slate-700">
                        Confidence: {(dispConf * 100).toFixed(1)}%
                      </div>
                    )}
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(record._id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl shrink-0"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm text-xs font-bold text-slate-600">
              <span>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchHistory(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => fetchHistory(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
