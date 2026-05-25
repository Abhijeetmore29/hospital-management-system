import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, buildFileUrl } from '../services/api';
import { PageHeader } from '../components/PageHeader';

const initialForm = {
  patientId: '',
  doctorId: '',
  appointmentId: '',
  imageType: 'X-Ray',
  bodyPart: '',
  scanDate: new Date().toISOString().slice(0, 10),
  notes: '',
  files: []
};

const reportDraft = {
  findings: '',
  status: 'draft'
};

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Unable to read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

function isViewableImage(fileType, filePath) {
  return (fileType || '').startsWith('image/') || (filePath || '').startsWith('data:image/');
}

function formatDate(value) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleDateString();
}

function getImageTitle(image) {
  return [image.imageType, image.bodyPart].filter(Boolean).join(' - ');
}

export function MedicalImaging() {
  const { user } = useAuth();
  const [images, setImages] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState('');
  const [imageTypeFilter, setImageTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [form, setForm] = useState(initialForm);
  const [selectedImageId, setSelectedImageId] = useState('');
  const [reportForm, setReportForm] = useState(reportDraft);
  const [zoom, setZoom] = useState(1);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [reportSaving, setReportSaving] = useState(false);

  const selectedImage = useMemo(
    () => images.find((image) => image._id === selectedImageId) || images[0] || null,
    [images, selectedImageId]
  );

  const filteredAppointments = useMemo(() => {
    if (!form.patientId) {
      return appointments;
    }

    return appointments.filter((appointment) => String(appointment.patient?._id) === String(form.patientId));
  }, [appointments, form.patientId]);

  useEffect(() => {
    if (user?.role === 'doctor') {
      setForm((current) => ({ ...current, doctorId: user._id }));
    }
  }, [user]);

  useEffect(() => {
    let active = true;

    function loadData() {
      Promise.all([api.patients(), api.doctors(), api.appointments()])
        .then(([patientData, doctorData, appointmentData]) => {
          if (!active) {
            return;
          }

          setPatients(patientData);
          setDoctors(doctorData);
          setAppointments(appointmentData);
        })
        .catch(() => {
          if (!active) {
            return;
          }

          setPatients([]);
          setDoctors([]);
          setAppointments([]);
        });
    }

    loadData();
    window.addEventListener('doctor:list:updated', loadData);

    return () => {
      active = false;
      window.removeEventListener('doctor:list:updated', loadData);
    };
  }, []);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      const query = new URLSearchParams();
      if (search.trim()) {
        query.set('search', search.trim());
      }
      if (imageTypeFilter) {
        query.set('imageType', imageTypeFilter);
      }
      if (dateFilter) {
        query.set('date', dateFilter);
      }

      api
        .medicalImages(query.toString() ? `?${query.toString()}` : '')
        .then((data) => {
          if (!active) {
            return;
          }

          setImages(data);
          setSelectedImageId((current) => {
            if (current && data.some((item) => item._id === current)) {
              return current;
            }
            return data[0]?._id || '';
          });
        })
        .catch(() => {
          if (!active) {
            return;
          }

          setImages([]);
          setSelectedImageId('');
        });
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search, imageTypeFilter, dateFilter]);

  useEffect(() => {
    if (!selectedImage) {
      setReportForm(reportDraft);
      setZoom(1);
      return;
    }

    setReportForm({
      findings: selectedImage.report?.findings || '',
      status: selectedImage.report?.status || 'draft'
    });
    setZoom(1);
  }, [selectedImage]);

  function updateField(event) {
    const { name, value, files } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === 'files' ? Array.from(files || []) : value
    }));
  }

  function updateReport(event) {
    const { name, value } = event.target;
    setReportForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      if (!form.files.length) {
        throw new Error('Please choose at least one scan image');
      }

      const selectedDoctorId = user?.role === 'doctor' ? user._id : form.doctorId;
      if (!selectedDoctorId) {
        throw new Error('Please select a doctor');
      }

      const uploads = await Promise.all(
        form.files.map(async (file) => {
          const dataUrl = await readFileAsDataUrl(file);
          return api.createMedicalImage({
            patientId: form.patientId,
            doctorId: selectedDoctorId,
            appointmentId: form.appointmentId || undefined,
            imageType: form.imageType,
            bodyPart: form.bodyPart,
            scanDate: form.scanDate,
            notes: form.notes,
            filePath: String(dataUrl),
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size
          });
        })
      );

      setMessage(`${uploads.length} scan${uploads.length > 1 ? 's' : ''} uploaded successfully.`);
      setForm((current) => ({
        ...initialForm,
        patientId: current.patientId,
        doctorId: user?.role === 'doctor' ? user._id : current.doctorId,
        scanDate: current.scanDate
      }));

      const refreshQuery = new URLSearchParams();
      if (search.trim()) {
        refreshQuery.set('search', search.trim());
      }
      if (imageTypeFilter) {
        refreshQuery.set('imageType', imageTypeFilter);
      }
      if (dateFilter) {
        refreshQuery.set('date', dateFilter);
      }

      const latest = await api.medicalImages(refreshQuery.toString() ? `?${refreshQuery.toString()}` : '');
      setImages(latest);
      setSelectedImageId(latest[0]?._id || '');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveReport(nextStatus) {
    if (!selectedImage) {
      return;
    }

    setReportSaving(true);
    setMessage('');

    try {
      const report = await api.saveImagingReport(selectedImage._id, {
        findings: reportForm.findings,
        status: nextStatus
      });

      setImages((current) =>
        current.map((image) =>
          image._id === selectedImage._id
            ? {
                ...image,
                report
              }
            : image
        )
      );
      setMessage(nextStatus === 'final' ? 'Report finalized successfully.' : 'Report saved as draft.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setReportSaving(false);
    }
  }

  async function handleDelete(imageId) {
    if (!window.confirm('Delete this medical image?')) {
      return;
    }

    try {
      await api.deleteMedicalImage(imageId);
      const next = images.filter((image) => image._id !== imageId);
      setImages(next);
      setSelectedImageId(next[0]?._id || '');
      setMessage('Medical image deleted.');
    } catch (error) {
      setMessage(error.message);
    }
  }

  const selectedFileUrl = buildFileUrl(selectedImage?.filePath || '');
  const canDelete = user?.role === 'admin';
  const isFinalized = selectedImage?.report?.status === 'final';

  return (
    <div className="stack imaging-shell">
      <PageHeader
        title="Medical Imaging"
        subtitle="Upload, review, print, and manage X-Ray, CT, MRI, and other scan records."
      />

      <section className="panel imaging-upload">
        <div className="panel-head">
          <h3>Upload Scan</h3>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            <span>Patient</span>
            <select name="patientId" value={form.patientId} onChange={updateField} required>
              <option value="">Select patient</option>
              {patients.map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.name} - {patient._id}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Doctor</span>
            {user?.role === 'doctor' ? (
              <input value={user.name} disabled />
            ) : (
              <select name="doctorId" value={form.doctorId} onChange={updateField} required>
                <option value="">Select doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            )}
          </label>
          <label>
            <span>Appointment</span>
            <select name="appointmentId" value={form.appointmentId} onChange={updateField}>
              <option value="">Optional visit/appointment</option>
              {filteredAppointments.map((appointment) => (
                <option key={appointment._id} value={appointment._id}>
                  {appointment.patient?.name} - {formatDate(appointment.appointmentDate)} {appointment.timeSlot}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Image Type</span>
            <select name="imageType" value={form.imageType} onChange={updateField}>
              <option value="X-Ray">X-Ray</option>
              <option value="CT Scan">CT Scan</option>
              <option value="MRI">MRI</option>
              <option value="Ultrasound">Ultrasound</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label>
            <span>Body Part</span>
            <input name="bodyPart" value={form.bodyPart} onChange={updateField} placeholder="Chest, Head, Knee..." required />
          </label>
          <label>
            <span>Scan Date</span>
            <input name="scanDate" type="date" value={form.scanDate} onChange={updateField} required />
          </label>
          <label className="full-span">
            <span>Notes / Remarks</span>
            <textarea name="notes" rows="3" value={form.notes} onChange={updateField} />
          </label>
          <label className="full-span">
            <span>Images</span>
            <input
              name="files"
              type="file"
              accept="image/*,.dcm,.dicom,application/dicom"
              multiple
              onChange={updateField}
              required
            />
          </label>
          <div className="full-span actions-row">
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? 'Uploading...' : 'Upload Scan'}
            </button>
          </div>
          {message ? <p className="form-message full-span">{message}</p> : null}
        </form>
      </section>

      <section className="panel imaging-toolbar">
        <div className="toolbar">
          <input
            className="search-input"
            placeholder="Search by patient name, patient ID, or date"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select value={imageTypeFilter} onChange={(event) => setImageTypeFilter(event.target.value)}>
            <option value="">All Types</option>
            <option value="X-Ray">X-Ray</option>
            <option value="CT Scan">CT Scan</option>
            <option value="MRI">MRI</option>
            <option value="Ultrasound">Ultrasound</option>
            <option value="Other">Other</option>
          </select>
          <input className="search-input" type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              setSearch('');
              setImageTypeFilter('');
              setDateFilter('');
            }}
          >
            Clear Filters
          </button>
        </div>
      </section>

      <div className="imaging-grid">
        <section className="panel imaging-list">
          <div className="panel-head">
            <h3>Scan Records</h3>
            <span className="muted">{images.length} record{images.length === 1 ? '' : 's'}</span>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>ID</th>
                  <th>Doctor</th>
                  <th>Type</th>
                  <th>Body Part</th>
                  <th>Date</th>
                  <th>Report</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {images.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-cell">
                      No scans found.
                    </td>
                  </tr>
                ) : (
                  images.map((image) => (
                    <tr key={image._id} className={image._id === selectedImageId ? 'row-active' : ''}>
                      <td>{image.patient?.name}</td>
                      <td>{image.patient?._id}</td>
                      <td>{image.doctor?.name}</td>
                      <td>{image.imageType}</td>
                      <td>{image.bodyPart}</td>
                      <td>{formatDate(image.scanDate)}</td>
                      <td>
                        <span className={`status-pill ${image.report?.status === 'final' ? 'completed' : 'scheduled'}`}>
                          {image.report?.status || 'draft'}
                        </span>
                      </td>
                      <td className="inline-actions">
                        <button type="button" className="text-link button-link" onClick={() => setSelectedImageId(image._id)}>
                          View
                        </button>
                        <a className="text-link" href={buildFileUrl(image.filePath)} download={image.fileName || undefined}>
                          Download
                        </a>
                        {canDelete ? (
                          <button type="button" className="text-link button-link danger-link" onClick={() => handleDelete(image._id)}>
                            Delete
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel imaging-detail imaging-print-card">
          {selectedImage ? (
            <>
              <div className="panel-head">
                <div>
                  <h3>{getImageTitle(selectedImage)}</h3>
                  <p className="muted">
                    {selectedImage.patient?.name} - {selectedImage.doctor?.name}
                  </p>
                </div>
                <div className="inline-actions">
                  <button type="button" className="secondary-button" onClick={() => window.print()}>
                    Print
                  </button>
                  <a className="secondary-button" href={buildFileUrl(selectedImage.filePath)} download={selectedImage.fileName || undefined}>
                    Download
                  </a>
                </div>
              </div>

              <div className="imaging-viewer">
                <div className="imaging-viewer-stage">
                  {isViewableImage(selectedImage.fileType, selectedImage.filePath) ? (
                    <img
                      src={selectedFileUrl}
                      alt={getImageTitle(selectedImage)}
                      style={{ transform: `scale(${zoom})` }}
                      className="imaging-image"
                    />
                  ) : (
                    <object data={selectedFileUrl} type={selectedImage.fileType || 'application/octet-stream'} className="imaging-object">
                      <p>
                        This file type cannot be rendered inline by the browser. Use Download to open it in a DICOM viewer.
                      </p>
                    </object>
                  )}
                </div>

                {isViewableImage(selectedImage.fileType, selectedImage.filePath) ? (
                  <div className="imaging-zoom-controls">
                    <button type="button" className="secondary-button" onClick={() => setZoom((current) => Math.max(0.5, +(current - 0.1).toFixed(2)))}>
                      -
                    </button>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={zoom}
                      onChange={(event) => setZoom(Number(event.target.value))}
                    />
                    <button type="button" className="secondary-button" onClick={() => setZoom((current) => Math.min(3, +(current + 0.1).toFixed(2)))}>
                      +
                    </button>
                    <button type="button" className="secondary-button" onClick={() => setZoom(1)}>
                      Reset
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="patient-summary imaging-summary">
                <div>
                  <span>Patient</span>
                  <strong>{selectedImage.patient?.name}</strong>
                </div>
                <div>
                  <span>Doctor</span>
                  <strong>{selectedImage.doctor?.name}</strong>
                </div>
                <div>
                  <span>Scan Date</span>
                  <strong>{formatDate(selectedImage.scanDate)}</strong>
                </div>
                <div>
                  <span>Appointment</span>
                  <strong>{selectedImage.appointment?._id || '-'}</strong>
                </div>
              </div>

              <section className="imaging-report">
                <div className="panel-head">
                  <h3>Doctor Report</h3>
                  <span className={`status-pill ${isFinalized ? 'completed' : 'scheduled'}`}>
                    {selectedImage.report?.status || 'draft'}
                  </span>
                </div>
                <label className="full-span">
                  <span>Findings / Observations</span>
                  <textarea
                    name="findings"
                    rows="8"
                    value={reportForm.findings}
                    onChange={updateReport}
                    disabled={isFinalized}
                    placeholder="Write the findings and interpretation here."
                  />
                </label>
                <div className="actions-row">
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={isFinalized || reportSaving}
                    onClick={() => handleSaveReport('draft')}
                  >
                    {reportSaving ? 'Saving...' : 'Save Draft'}
                  </button>
                  <button
                    type="button"
                    className="primary-button"
                    disabled={isFinalized || reportSaving}
                    onClick={() => handleSaveReport('final')}
                  >
                    {reportSaving ? 'Saving...' : 'Finalize Report'}
                  </button>
                </div>
                {isFinalized ? <p className="form-message">This report is finalized and read-only.</p> : null}
              </section>

              <section className="imaging-notes">
                <h3>Scan Notes</h3>
                <p>{selectedImage.notes || 'No doctor remarks were added for this scan.'}</p>
              </section>

              <section className="imaging-print-area">
                <div className="print-header">
                  <h2>City Care Hospital</h2>
                  <p>Medical Imaging Report</p>
                </div>
                <div className="print-grid">
                  <div>
                    <span>Patient</span>
                    <strong>{selectedImage.patient?.name}</strong>
                  </div>
                  <div>
                    <span>Doctor</span>
                    <strong>{selectedImage.doctor?.name}</strong>
                  </div>
                  <div>
                    <span>Image Type</span>
                    <strong>{selectedImage.imageType}</strong>
                  </div>
                  <div>
                    <span>Body Part</span>
                    <strong>{selectedImage.bodyPart}</strong>
                  </div>
                  <div>
                    <span>Scan Date</span>
                    <strong>{formatDate(selectedImage.scanDate)}</strong>
                  </div>
                  <div>
                    <span>Status</span>
                    <strong>{selectedImage.report?.status || 'draft'}</strong>
                  </div>
                </div>
                <div className="imaging-viewer-stage imaging-print-view">
                  {isViewableImage(selectedImage.fileType, selectedImage.filePath) ? (
                    <img className="imaging-image imaging-image-print" src={selectedFileUrl} alt={getImageTitle(selectedImage)} />
                  ) : (
                    <div className="imaging-object imaging-object-print">
                      DICOM file available for download.
                    </div>
                  )}
                </div>
                <div className="print-section">
                  <span>Doctor Findings</span>
                  <pre>{selectedImage.report?.findings || 'No report has been written yet.'}</pre>
                </div>
                <div className="print-section">
                  <span>Doctor Remarks</span>
                  <p>{selectedImage.notes || 'No additional remarks.'}</p>
                </div>
                <div className="signature-block">
                  <div>
                    <span>Doctor Signature</span>
                    <div className="signature-line" />
                  </div>
                </div>
              </section>
            </>
          ) : (
            <div className="empty-panel">Select a scan to view the image and report.</div>
          )}
        </section>
      </div>
    </div>
  );
}
