const express = require('express');
const router = express.Router();
const {
  getInterviewQuestion,
  submitInterviewAnswer,
  getMockQuestions,
  submitMockInterview,
  generateAIInterview
} = require('../controllers/interviewController');

router.get('/question', getInterviewQuestion);
router.post('/submit', submitInterviewAnswer);
router.get('/mock/questions', getMockQuestions);
router.post('/mock/submit', submitMockInterview);
router.post('/generate', generateAIInterview);

module.exports = router;
