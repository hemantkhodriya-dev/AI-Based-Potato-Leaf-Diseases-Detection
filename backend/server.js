const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const mongoose = require('mongoose');
require('dotenv').config();

const Prediction = require('./models/Prediction');

const app = express();
const PORT = process.env.PORT || 5000;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/potatocare';

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Security & Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'DELETE'] }));
app.use(express.json());

// Serve static uploaded images and test samples
app.use('/uploads', express.static(UPLOADS_DIR));
const SAMPLES_DIR = path.join(__dirname, 'samples');
if (fs.existsSync(SAMPLES_DIR)) {
  app.use('/samples', express.static(SAMPLES_DIR));
}

// Memory / Local Storage Fallback if MongoDB is not connected
let isMongoConnected = false;
const localPredictions = [];

mongoose.connect(MONGO_URI)
  .then(() => {
    isMongoConnected = true;
    console.log('[SUCCESS] Connected to MongoDB Atlas/Local Database');
  })
  .catch((err) => {
    isMongoConnected = false;
    console.warn('[NOTE] MongoDB connection unavailable. Operating with local memory store fallback:', err.message);
  });

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedExt = ['.jpg', '.jpeg', '.png'].includes(ext) ? ext : '.jpg';
    const uniqueName = `leaf-${Date.now()}-${Math.round(Math.random() * 1e9)}${sanitizedExt}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/octet-stream'];
  const ext = path.extname(file.originalname || '').toLowerCase();
  const allowedExts = ['.jpg', '.jpeg', '.png'];

  if (allowedExts.includes(ext) || allowedMimeTypes.includes((file.mimetype || '').toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only JPG, JPEG, and PNG images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// Health Check
app.get('/api/health', async (req, res) => {
  let aiHealth = { status: 'down', message: 'AI Service unreachable' };
  try {
    const aiRes = await axios.get(`${AI_SERVICE_URL}/health`, { timeout: 60000 });
    aiHealth = aiRes.data;
  } catch (err) {
    aiHealth = { status: 'offline', error: err.message };
  }

  res.json({
    status: 'ok',
    service: 'PotatoCare Backend API',
    database: isMongoConnected ? 'MongoDB' : 'Memory Storage Fallback',
    aiServiceUrl: AI_SERVICE_URL,
    aiServiceStatus: aiHealth,
    timestamp: new Date().toISOString()
  });
});

// Create Prediction Record (Upload & Classify)
app.post('/api/predictions', (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size exceeds maximum allowable limit of 10MB.' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded. Please upload a potato leaf image.' });
    }

    const filePath = req.file.path;
    const fileName = req.file.filename;

    try {
      // Forward file stream to Python FastAPI service
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath), {
        filename: req.file.originalname,
        contentType: req.file.mimetype
      });

      const aiResponse = await axios.post(`${AI_SERVICE_URL}/predict`, formData, {
        headers: { ...formData.getHeaders() },
        timeout: 60000
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
        isConfidenceCapped,
        maxDisplayLimit,
        probabilities,
        rawProbabilities,
        isLeaf
      } = aiResponse.data;
      const imageBase64 = fs.readFileSync(filePath, { encoding: 'base64' });
      const imageUrl = data:${req.file.mimetype};base64,${imageBase64};

      // Check if Stage 1 rejected (Non-potato plant or invalid object)
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
      const isCapped = false;

      let predictionRecord;

      if (isMongoConnected) {
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
      console.error('[ERROR] Error processing prediction:', error.response?.data || error.message);
      
      // Clean up uploaded file on failure
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      const status = error.response?.status || 500;
      const message = error.response?.data?.detail || 'Failed to analyze leaf image. Ensure the Python AI service is running.';
      res.status(status).json({ error: message });
    }
  });
});

// Get Paginated Predictions List
app.get('/api/predictions', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const classFilter = req.query.classFilter;
    const sortBy = req.query.sortBy || 'newest';

    if (isMongoConnected) {
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
      // Memory Store logic
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
});

// Get Single Prediction Record
app.get('/api/predictions/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected) {
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
});

// Delete Prediction Record
app.delete('/api/predictions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let targetPath = null;

    if (isMongoConnected) {
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

    // Safely delete file if path is inside UPLOADS_DIR (prevent path traversal)
    if (targetPath) {
      const resolvedPath = path.resolve(targetPath);
      if (resolvedPath.startsWith(path.resolve(UPLOADS_DIR)) && fs.existsSync(resolvedPath)) {
        fs.unlinkSync(resolvedPath);
      }
    }

    res.json({ message: 'Prediction record and leaf image deleted successfully.', id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete prediction record.' });
  }
});

// Serve production React build if dist exists
const FRONTEND_DIST = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/samples')) {
      return next();
    }
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[UNHANDLED ERROR]', err);
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(` 🚀 PotatoCare Backend API listening on port ${PORT}`);
  console.log(` 🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`==================================================\n`);
});
