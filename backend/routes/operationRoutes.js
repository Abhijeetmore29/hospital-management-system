const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {
  createOperation,
  getOperations,
  getOperationById,
  updateOperation
} = require('../controllers/operationController');

const router = express.Router();

router.use(protect);
router.get('/', authorizeRoles('doctor', 'staff'), getOperations);
router.get('/:id', authorizeRoles('doctor', 'staff'), getOperationById);
router.post('/', authorizeRoles('doctor', 'staff'), createOperation);
router.patch('/:id', authorizeRoles('doctor', 'staff'), updateOperation);

module.exports = router;

