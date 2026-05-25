const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

const { loadEnv } = require('./config/env');
const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');
const pricingRoutes = require('./routes/pricingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const operationRoutes = require('./routes/operationRoutes');
const medicalImageRoutes = require('./routes/medicalImageRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { getDoctors } = require('./controllers/userController');
const { getOpdQueue } = require('./controllers/appointmentController');
const consultationRoutes = require('./routes/consultationRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const billingRoutes = require('./routes/billingRoutes');
const paymentSettingsRoutes = require('./routes/paymentSettingsRoutes');

const env = loadEnv();
const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      const isLocalOrigin =
        typeof origin === 'string' &&
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

      if (!origin || origin === env.clientUrl || isLocalOrigin) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin ${origin}`));
    },
    credentials: true
  })
);
app.use(compression());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'hospital-management-system' });
});
app.get('/api/doctors', getDoctors);
app.get('/api/opd-queue', getOpdQueue);

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/operations', operationRoutes);
app.use('/api/medical-images', medicalImageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/payment-settings', paymentSettingsRoutes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  await connectDB(env.mongoUri);
  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
}

if (require.main === module) {
  start().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = app;
