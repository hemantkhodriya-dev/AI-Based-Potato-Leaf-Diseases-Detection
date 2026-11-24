const path = require('path');
let mongoose;
try {
  mongoose = require('mongoose');
} catch (e) {
  mongoose = require(path.resolve(__dirname, '../../backend/node_modules/mongoose'));
}

/**
 * PredictionSchema
 * 
 * Formal MongoDB schema for storing Two-Stage PotatoCare AI predictions.
 */
const PredictionSchema = new mongoose.Schema({
  // Leaf specimen image storage
  imageUrl: {
    type: String,
    required: true,
    trim: true
  },
  imagePath: {
    type: String,
    required: true,
    trim: true
  },

  // Disease diagnosis classification
  predictedClass: {
    type: String,
    required: true,
    enum: [
      'Healthy',
      'Early Blight',
      'Late Blight',
      'Not a Potato Leaf',
      'Unsupported Image',
      'Non-Potato Leaf'
    ]
  },

  // Pipeline Status & Validation Flags
  status: {
    type: String,
    enum: ['accepted', 'rejected'],
    default: 'accepted',
    index: true
  },
  isPotatoLeaf: {
    type: Boolean,
    default: true,
    index: true
  },
  isLeaf: {
    type: Boolean,
    default: true
  },
  validationStatus: {
    type: String,
    default: 'valid_potato_leaf'
  },
  validationMessage: {
    type: String,
    default: ''
  },

  // Stage 1 Binary Potato Validator breakdown
  stage1: {
    isPotatoLeaf: { type: Boolean, default: true },
    potatoProbability: { type: Number, default: 1.0 },
    nonPotatoProbability: { type: Number, default: 0.0 },
    detail: { type: String, default: '' }
  },

  // Confidence Metrics
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  calibratedConfidence: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  },
  rawConfidence: {
    type: Number,
    default: 0
  },
  displayedConfidence: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  },
  isConfidenceCapped: {
    type: Boolean,
    default: false
  },
  maxDisplayLimit: {
    type: Number,
    default: 1.0
  },

  // Probabilities Distributions across 3 disease classes
  classProbabilities: {
    type: Map,
    of: Number,
    default: null
  },
  rawProbabilities: {
    type: Map,
    of: Number,
    default: {}
  },

  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  collection: 'predictions'
});

// Compound indexes for optimal query performance
PredictionSchema.index({ predictedClass: 1, createdAt: -1 });
PredictionSchema.index({ status: 1, createdAt: -1 });

module.exports = PredictionSchema;
