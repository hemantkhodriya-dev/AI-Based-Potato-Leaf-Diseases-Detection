const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const mongoose = require('mongoose');
const Prediction = require('../models/Prediction');
const { UPLOADS_DIR } = require('../middleware/upload');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
const localPredictions = [];

const isMongoAvailable = () => mongoose.connection.readyState === 1;

/**
 * Handle new leaf image upload and two-stage disease prediction.
 */
const createPrediction = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded. Please upload a potato leaf image.' });
  }

  const filePath = req.file.path;
  const fileName = req.file.filename;

  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath), {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/predict`, formData, {
      headers: { ...formData.getHeaders() },
      timeout: 15000
    });

    const {
      status: aiStatus,
      isPotatoLeaf,
      validationStatus,
      validationMessage,
      stage1,
      predictedClass,
      confidence,
      calibratedConfidence,
      rawConfidence,
      displayedConfidence,
      probabilities,
      rawProbabilities,
      isLeaf
    } = aiResponse.data;

    const imageUrl = `/uploads/${fileName}`;

    // Check if Stage 1 rejected (Non-potato foliage, animal, human, synthetic graphic)
    const isRejected = (aiStatus === 'rejected') || (isPotatoLeaf === false) || (isLeaf === false) || (predictedClass === 'Unsupported Image') || (predictedClass === 'Not a Potato Leaf');

    if (isRejected) {
      const rejectionData = {
        _id: `rejected-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        status: 'rejected',
        isPotatoLeaf: false,
        isLeaf: false,
        imageUrl,
        predictedClass: 'Unsupported Image',
        validationStatus: validationStatus || 'unsupported_image',
        validationMessage: validationMessage || 'This image does not appear to be a potato leaf. Please upload a clear photograph of a potato leaf to detect Healthy, Early Blight, or Late Blight.',
        stage1: stage1 || { isPotatoLeaf: false, potatoProbability: 0.0, nonPotatoProbability: 1.0 },
        confidence: 0,
        calibratedConfidence: 0,
        rawConfidence: 0,
        displayedConfidence: 0,
        classProbabilities: null,
        probabilities: null,
        createdAt: new Date().toISOString()
      };

      if (req.query.strict === 'true' || req.headers['x-strict-validation'] === 'true') {
        return res.status(422).json({
          error: rejectionData.validationMessage,
          ...rejectionData
        });
      }

      return res.status(200).json(rejectionData);
    }

    // Genuine Calibrated Model Confidence (Validation Temperature Calibrated, 60% - 96% typical range)
    const actualCalibratedConfidence = typeof calibratedConfidence === 'number'
      ? calibratedConfidence
      : (typeof confidence === 'number' ? confidence : 0.85);
    const actualRawConfidence = typeof rawConfidence === 'number'
      ? rawConfidence
      : actualCalibratedConfidence;
    const safeDisplayedConfidence = actualCalibratedConfidence;

    let predictionRecord;

    if (isMongoAvailable()) {
      predictionRecord = await Prediction.create({
        status: 'accepted',
        isPotatoLeaf: true,
        validationStatus: 'valid_potato_leaf',
        stage1: stage1 || { isPotatoLeaf: true },
        imageUrl,
        imagePath: filePath,
        predictedClass,
        confidence: safeDisplayedConfidence,
        calibratedConfidence: actualCalibratedConfidence,
        rawConfidence: actualRawConfidence,
        displayedConfidence: safeDisplayedConfidence,
        isConfidenceCapped: false,
        maxDisplayLimit: 1.0,
        classProbabilities: probabilities,
        rawProbabilities: rawProbabilities || {},
        isLeaf: true,
        validationMessage: '',
        createdAt: new Date()
      });
    } else {
      predictionRecord = {
        _id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        status: 'accepted',
        isPotatoLeaf: true,
        validationStatus: 'valid_potato_leaf',
        stage1: stage1 || { isPotatoLeaf: true },
        imageUrl,
        imagePath: filePath,
        predictedClass,
        confidence: safeDisplayedConfidence,
        calibratedConfidence: actualCalibratedConfidence,
        rawConfidence: actualRawConfidence,
        displayedConfidence: safeDisplayedConfidence,
        isConfidenceCapped: false,
        maxDisplayLimit: 1.0,
        classProbabilities: probabilities,
        rawProbabilities: rawProbabilities || {},
        isLeaf: true,
        validationMessage: '',
        createdAt: new Date().toISOString()
      };
      localPredictions.unshift(predictionRecord);
    }

    res.status(201).json(predictionRecord);

  } catch (error) {
    console.error('[ERROR] Prediction Controller Error:', error.response?.data || error.message);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }
    const status = error.response?.status || 500;
    const message = error.response?.data?.detail || 'Failed to analyze leaf image. Ensure the Python AI service is running.';
    res.status(status).json({ error: message });
  }
};

/**
 * Retrieve paginated list of historical diagnoses.
 */
const getPredictions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const classFilter = req.query.classFilter;
    const sortBy = req.query.sortBy || 'newest';

    if (isMongoAvailable()) {
      const query = {};
      if (classFilter && classFilter !== 'all') {
        query.predictedClass = classFilter;
      }
      const sortOption = sortBy === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
      const totalRecords = await Prediction.countDocuments(query);
      const records = await Prediction.find(query)
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit);

      return res.json({
        data: records,
        pagination: {
          total: totalRecords,
          page,
          limit,
          totalPages: Math.ceil(totalRecords / limit)
        }
      });
    } else {
      let filtered = [...localPredictions];
      if (classFilter && classFilter !== 'all') {
        filtered = filtered.filter(p => p.predictedClass === classFilter);
      }
      filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortBy === 'oldest' ? dateA - dateB : dateB - dateA;
      });
      const total = filtered.length;
      const startIndex = (page - 1) * limit;
      const paginated = filtered.slice(startIndex, startIndex + limit);

      return res.json({
        data: paginated,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch predictions history.' });
  }
};

/**
 * Retrieve single prediction record by ID.
 */
const getPredictionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoAvailable()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid prediction ID format.' });
      }
      const record = await Prediction.findById(id);
      if (!record) return res.status(404).json({ error: 'Prediction record not found.' });
      return res.json(record);
    } else {
      const record = localPredictions.find(p => p._id === id);
      if (!record) return res.status(404).json({ error: 'Prediction record not found.' });
      return res.json(record);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving prediction detail.' });
  }
};

/**
 * Delete a prediction record and its associated leaf image.
 */
const deletePrediction = async (req, res) => {
  try {
    const { id } = req.params;
    let targetPath = null;

    if (isMongoAvailable()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid prediction ID.' });
      }
      const record = await Prediction.findById(id);
      if (!record) return res.status(404).json({ error: 'Record not found.' });

      targetPath = record.imagePath;
      await Prediction.findByIdAndDelete(id);
    } else {
      const index = localPredictions.findIndex(p => p._id === id);
      if (index === -1) return res.status(404).json({ error: 'Record not found.' });

      targetPath = localPredictions[index].imagePath;
      localPredictions.splice(index, 1);
    }

    if (targetPath) {
      const resolvedPath = path.resolve(targetPath);
      if (resolvedPath.startsWith(path.resolve(UPLOADS_DIR)) && fs.existsSync(resolvedPath)) {
        try { fs.unlinkSync(resolvedPath); } catch (e) {}
      }
    }

    res.json({ message: 'Prediction record and leaf image deleted successfully.', id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete prediction record.' });
  }
};

module.exports = {
  createPrediction,
  getPredictions,
  getPredictionById,
  deletePrediction
};
