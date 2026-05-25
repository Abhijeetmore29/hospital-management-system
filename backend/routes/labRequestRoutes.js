const express = require('express');
const {
  listLabRequests,
  createLabRequest,
  getLabRequestById,
  updateLabRequest
} = require('../controllers/labRequestController');

const router = express.Router();

router.get('/', listLabRequests);
router.post('/', createLabRequest);
router.get('/:id', getLabRequestById);
router.patch('/:id', updateLabRequest);

module.exports = router;
