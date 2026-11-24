const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');
const { upload } = require('../middleware/upload');

// POST /api/predictions - Upload and analyze potato leaf
router.post('/', upload.single('image'), predictionController.createPrediction);

// GET /api/predictions - Retrieve paginated list
router.get('/', predictionController.getPredictions);

// GET /api/predictions/:id - Retrieve single diagnosis
router.get('/:id', predictionController.getPredictionById);

// DELETE /api/predictions/:id - Delete diagnosis and image
router.delete('/:id', predictionController.deletePrediction);

module.exports = router;
