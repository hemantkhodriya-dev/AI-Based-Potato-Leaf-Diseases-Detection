const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
  },
  imagePath: {
    type: String,
    required: true
  },
  predictedClass: {
    type: String,
    required: true,
    enum: ['Healthy', 'Early Blight', 'Late Blight', 'Not a Potato Leaf', 'Unsupported Image', 'Non-Potato Leaf']
  },
  status: {
    type: String,
    enum: ['accepted', 'rejected'],
    default: 'accepted'
  },
  isPotatoLeaf: {
    type: Boolean,
    default: true
  },
  isLeaf: {
    type: Boolean,
    default: true
  },
  stage1: {
    type: Object,
    default: {}
  },
  validationStatus: {
    type: String,
    default: 'valid_potato_leaf'
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  calibratedConfidence: {
    type: Number,
    default: 0
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
  rawProbabilities: {
    type: Map,
    of: Number,
    default: {}
  },
  classProbabilities: {
    type: Map,
    of: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Prediction', PredictionSchema);
