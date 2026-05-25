const asyncHandler = require('../utils/asyncHandler');
const fs = require('fs/promises');
const path = require('path');
const MedicalImage = require('../models/MedicalImage');
const ImagingReport = require('../models/ImagingReport');
const Patient = require('../models/Patient');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseDayRange(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { $gte: start, $lte: end };
}

function parseDataUrl(value) {
  const match = /^data:([^;]+);base64,(.+)$/.exec(value || '');
  if (!match) {
    return null;
  }

  return {
    mimeType: match[1],
    base64: match[2]
  };
}

function safeFileName(name) {
  return String(name || 'scan')
    .replace(/[^a-z0-9._-]+/gi, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function resolveExtension(fileName, mimeType) {
  const lowerName = String(fileName || '').toLowerCase();
  if (lowerName.endsWith('.dcm') || mimeType === 'application/dicom') {
    return '.dcm';
  }
  if (mimeType === 'image/jpeg' || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) {
    return '.jpg';
  }
  if (mimeType === 'image/png' || lowerName.endsWith('.png')) {
    return '.png';
  }
  if (mimeType === 'image/webp' || lowerName.endsWith('.webp')) {
    return '.webp';
  }
  if (mimeType === 'image/gif' || lowerName.endsWith('.gif')) {
    return '.gif';
  }
  return path.extname(lowerName) || '.bin';
}

async function removeStoredImage(filePath) {
  if (!filePath || /^data:/i.test(filePath) || /^https?:\/\//i.test(filePath)) {
    return;
  }

  const uploadsRoot = path.resolve(__dirname, '..', 'uploads');
  const candidatePath = path.resolve(__dirname, '..', String(filePath).replace(/^\/+/, ''));
  const relativePath = path.relative(uploadsRoot, candidatePath);

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return;
  }

  try {
    await fs.unlink(candidatePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

async function attachReports(images) {
  const imageIds = images.map((image) => image._id);
  const reports = await ImagingReport.find({ image: { $in: imageIds } })
    .populate('doctor', 'name email role signature profilePicture')
    .lean();

  const reportMap = new Map(reports.map((report) => [report.image.toString(), report]));

  return images.map((image) => ({
    ...image,
    report: reportMap.get(image._id.toString()) || null
  }));
}

async function buildQueryFromSearch(search) {
  if (!search) {
    return { query: {}, patientMatchIds: null };
  }

  const trimmed = search.trim();
  const query = {};
  const patientCriteria = [];

  if (/^[a-fA-F0-9]{24}$/.test(trimmed)) {
    patientCriteria.push({ _id: trimmed });
    query.patient = trimmed;
  } else {
    patientCriteria.push({ name: { $regex: escapeRegex(trimmed), $options: 'i' } });
  }

  const dayRange = parseDayRange(trimmed);
  if (dayRange) {
    query.scanDate = dayRange;
  }

  if (patientCriteria.length > 0) {
    const matchingPatients = await Patient.find({ $or: patientCriteria }).select('_id');
    const patientIds = matchingPatients.map((patient) => patient._id);

    if (patientIds.length > 0) {
      query.patient = query.patient || { $in: patientIds };
    } else if (!query.scanDate) {
      query.patient = { $in: [] };
    }
  }

  return { query };
}

const uploadMedicalImage = asyncHandler(async (req, res) => {
  const {
    patientId,
    doctorId,
    appointmentId,
    imageType,
    bodyPart,
    filePath,
    fileName,
    fileType,
    fileSize,
    scanDate,
    notes
  } = req.body;

  if (!patientId || !imageType || !bodyPart || !filePath || !scanDate) {
    res.status(400);
    throw new Error('patientId, imageType, bodyPart, filePath and scanDate are required');
  }

  const [patient, selectedDoctor, appointment] = await Promise.all([
    Patient.findById(patientId),
    req.user.role === 'doctor' ? User.findById(req.user._id) : User.findById(doctorId),
    appointmentId ? Appointment.findById(appointmentId) : Promise.resolve(null)
  ]);

  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  if (!selectedDoctor || selectedDoctor.role !== 'doctor') {
    res.status(400);
    throw new Error('Invalid doctor selected');
  }

  if (appointmentId && !appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  if (appointment && String(appointment.patient) !== String(patientId)) {
    res.status(400);
    throw new Error('Appointment does not belong to this patient');
  }

  const parsedData = parseDataUrl(filePath);
  let storedFilePath = filePath;
  let storedFileType = fileType || '';
  let storedFileSize = fileSize !== undefined && fileSize !== null ? Number(fileSize) : 0;

  if (parsedData) {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'medical-images');
    await fs.mkdir(uploadDir, { recursive: true });

    const extension = resolveExtension(fileName, parsedData.mimeType);
    const safeName = safeFileName(fileName || `scan-${Date.now()}`);
    const storageName = `${Date.now()}-${safeName}${extension}`;
    const absolutePath = path.join(uploadDir, storageName);

    await fs.writeFile(absolutePath, Buffer.from(parsedData.base64, 'base64'));

    storedFilePath = `/uploads/medical-images/${storageName}`;
    storedFileType = storedFileType || parsedData.mimeType;
    storedFileSize = Buffer.byteLength(parsedData.base64, 'base64');
  }

  const image = await MedicalImage.create({
    patient: patientId,
    doctor: selectedDoctor._id,
    appointment: appointmentId || undefined,
    imageType,
    bodyPart: bodyPart.trim(),
    filePath: storedFilePath,
    fileName: fileName || '',
    fileType: storedFileType,
    fileSize: storedFileSize,
    scanDate,
    notes: notes || '',
    createdBy: req.user._id
  });

  const populated = await MedicalImage.findById(image._id)
    .populate('patient', 'name age phone disease type status')
    .populate('doctor', 'name email role signature profilePicture')
    .populate('appointment', 'appointmentDate timeSlot reason')
    .lean();

  res.status(201).json({ ...populated, report: null });
});

const getMedicalImages = asyncHandler(async (req, res) => {
  const { patientId, doctorId, imageType, date, search } = req.query;
  const query = {};

  if (patientId) {
    query.patient = patientId;
  }

  if (doctorId) {
    query.doctor = doctorId;
  }

  if (imageType) {
    query.imageType = imageType;
  }

  if (date) {
    const dayRange = parseDayRange(date);
    if (dayRange) {
      query.scanDate = dayRange;
    }
  }

  if (search) {
    const { query: searchQuery } = await buildQueryFromSearch(search);
    Object.assign(query, searchQuery);
  }

  if (req.user.role === 'doctor') {
    query.doctor = req.user._id;
  }

  const images = await MedicalImage.find(query)
    .populate('patient', 'name age phone disease type status')
    .populate('doctor', 'name email role signature profilePicture')
    .populate('appointment', 'appointmentDate timeSlot reason')
    .sort({ scanDate: -1, createdAt: -1 })
    .lean();

  const imagesWithReports = await attachReports(images);
  res.json(imagesWithReports);
});

const getMedicalImageById = asyncHandler(async (req, res) => {
  const image = await MedicalImage.findById(req.params.id)
    .populate('patient', 'name age phone disease type status')
    .populate('doctor', 'name email role signature profilePicture')
    .populate('appointment', 'appointmentDate timeSlot reason')
    .lean();

  if (!image) {
    res.status(404);
    throw new Error('Medical image not found');
  }

  const report = await ImagingReport.findOne({ image: image._id })
    .populate('doctor', 'name email role signature profilePicture')
    .lean();

  res.json({
    ...image,
    report: report || null
  });
});

const saveImagingReport = asyncHandler(async (req, res) => {
  const { findings = '', status = 'draft' } = req.body;

  const image = await MedicalImage.findById(req.params.id);
  if (!image) {
    res.status(404);
    throw new Error('Medical image not found');
  }

  const existingReport = await ImagingReport.findOne({ image: image._id });
  if (existingReport && existingReport.status === 'final') {
    res.status(400);
    throw new Error('Finalized reports are read-only');
  }

  const nextStatus = status === 'final' ? 'final' : 'draft';

  const report = await ImagingReport.findOneAndUpdate(
    { image: image._id },
    {
      image: image._id,
      doctor: req.user._id,
      findings,
      status: nextStatus
    },
    {
      new: true,
      upsert: true,
      runValidators: true
    }
  ).populate('doctor', 'name email role signature profilePicture');

  image.status = 'Reviewed';
  await image.save();

  res.json(report);
});

const deleteMedicalImage = asyncHandler(async (req, res) => {
  const image = await MedicalImage.findById(req.params.id);

  if (!image) {
    res.status(404);
    throw new Error('Medical image not found');
  }

  await removeStoredImage(image.filePath);
  await ImagingReport.deleteOne({ image: image._id });
  await image.deleteOne();

  res.json({ message: 'Medical image deleted successfully' });
});

const getPublicMedicalImages = asyncHandler(async (req, res) => {
  const { patientId, phone } = req.query;

  if (!patientId || !phone) {
    res.status(400);
    throw new Error('patientId and phone are required');
  }

  const patient = await Patient.findById(patientId).select('name age phone disease type status');
  if (!patient || patient.phone.trim() !== String(phone).trim()) {
    res.status(404);
    throw new Error('Patient not found');
  }

  const images = await MedicalImage.find({ patient: patient._id })
    .populate('doctor', 'name email role signature profilePicture')
    .populate('appointment', 'appointmentDate timeSlot reason')
    .sort({ scanDate: -1, createdAt: -1 })
    .lean();

  const imagesWithReports = await attachReports(images);
  res.json({ patient, images: imagesWithReports });
});

module.exports = {
  uploadMedicalImage,
  getMedicalImages,
  getMedicalImageById,
  saveImagingReport,
  deleteMedicalImage,
  getPublicMedicalImages
};
