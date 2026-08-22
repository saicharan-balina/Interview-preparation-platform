const express = require('express');
const router = express.Router();
const { getPracticeQuestions, submitPractice, generateAIQuestions } = require('../controllers/practiceController');

router.get('/questions', getPracticeQuestions);
router.post('/submit', submitPractice);
router.post('/generate', generateAIQuestions);

module.exports = router;
