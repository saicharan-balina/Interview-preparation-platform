const express = require('express');
const router = express.Router();
const { getDashboard, getProfile, updateProfile, getRevision, generateAIRevision } = require('../controllers/dashboardController');

router.get('/', getDashboard);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/revision', getRevision);
router.post('/revision/generate', generateAIRevision);

module.exports = router;
