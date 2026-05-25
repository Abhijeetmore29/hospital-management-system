const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {
  uploadMedicalImage,
  getMedicalImages,
  getMedicalImageById,
  saveImagingReport,
  deleteMedicalImage,
  getPublicMedicalImages
} = require('../controllers/medicalImageController');

const router = express.Router();

router.get('/public', getPublicMedicalImages);

router.use(protect);
router.get('/', authorizeRoles('doctor', 'staff', 'admin'), getMedicalImages);
router.get('/:id', authorizeRoles('doctor', 'staff', 'admin'), getMedicalImageById);
router.post('/', authorizeRoles('doctor', 'staff', 'admin'), uploadMedicalImage);
router.patch('/:id/report', authorizeRoles('doctor'), saveImagingReport);
router.delete('/:id', authorizeRoles('doctor'), deleteMedicalImage);

module.exports = router;
