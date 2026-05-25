const express = require('express');
const {
  getPatientHistory,
  addPatientHistoryEntry
} = require('../controllers/patientHistoryController');

const router = express.Router();

router.get('/:patientId', getPatientHistory);
router.post('/:patientId/entries', addPatientHistoryEntry);

module.exports = router;
