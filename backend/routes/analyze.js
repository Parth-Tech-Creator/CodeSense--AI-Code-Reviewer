const express = require('express');
const router = express.Router();
const analyzeController = require('../controllers/analyzeController');
const auth = require('../middleware/authMiddleware');

// Public route for analysis
router.post('/', analyzeController.analyzeAdvanced);

// Protected route for logged-in users to save analysis
router.post('/auth', auth, analyzeController.analyzeAdvanced);

// Streaming version of the protected analyze route
router.post('/auth/stream', auth, analyzeController.analyzeAdvancedStream);

// Grade an answer to an AI-generated interview question
router.post('/interview-feedback', analyzeController.gradeInterviewAnswer);

// Multi-file GitHub repository review
router.post('/repo', auth, analyzeController.analyzeRepo);

// Protected route to get history
router.get('/history', auth, analyzeController.getHistory);

module.exports = router;
