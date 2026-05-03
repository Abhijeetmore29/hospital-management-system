import { useMemo, useState } from 'react';
import { buildFileUrl, publicApi } from '../services/api';
import { PageHeader } from '../components/PageHeader';

function isViewableImage(fileType, filePath) {
  return (fileType || '').startsWith('image/') || (filePath || '').startsWith('data:image/');
}

function formatDate(value) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleDateString();
}

function readRecords(records, imageTypeFilter, dateFilter) {
  return records.filter((record) => {
    const matchesType = !imageTypeFilter || record.imageType === imageTypeFilter;
    const matchesDate = !dateFilter || new Date(record.scanDate).toISOString().slice(0, 10) === dateFilter;
    return matchesType && matchesDate;
  });
}

export function PatientImagingPortal() {
  const [patientId, setPatientId] = useState('');
  const [phone, setPhone] = useState('');
  const [patient, setPatient] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState('');
  const [imageTypeFilter, setImageTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const selectedImage = useMemo(
    () => images.find((image) => image._id === selectedImageId) || images[0] || null,
    [images, selectedImageId]
  );

  const filteredImages = useMemo(
    () => readRecords(images, imageTypeFilter, dateFilter),
    [images, imageTypeFilter, dateFilter]
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await publicApi.medicalImagesAccess({ patientId, phone });
      setPatient(response.patient);
      setImages(response.images);
      setSelectedImageId(response.images[0]?._id || '');
      setZoom(1);
    } catch (error) {
      setPatient(null);
      setImages([]);
      setSelectedImageId('');
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  const selectedFileUrl = buildFileUrl(selectedImage?.filePath || '');

  return (
    <div className="stack">
      <PageHeader
        title="Patient Imaging Access"
        subtitle="Read-only portal for patients to view, download, and print their scan records."
      />

      <section className="panel">
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            <span>Patient ID</span>
            <input value={patientId} onChange={(event) => setPatientId(event.target.value)} placeholder="Paste patient ID" required />
          </label>
          <label>
            <span>Phone</span>
            <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Registered phone number" required />
          </label>
          <div className="full-span actions-row">
            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'View Scans'}
            </button>
          </div>
          {message ? <p className="form-message full-span error">{message}</p> : null}
        </form>
      </section>

      {patient ? (
        <>
          <section className="panel">
            <div className="patient-summary">
              <div>
                <span>Patient</span>
                <strong>{patient.name}</strong>
              </div>
              <div>
                <span>Patient ID</span>
                <strong>{patient._id}</strong>
              </div>
              <div>
                <span>Disease</span>
                <strong>{patient.disease}</strong>
              </div>
              <div>
                <span>Phone</span>
                <strong>{patient.phone}</strong>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="toolbar">
              <select value={imageTypeFilter} onChange={(event) => setImageTypeFilter(event.target.value)}>
                <option value="">All Types</option>
                <option value="X-Ray">X-Ray</option>
                <option value="CT Scan">CT Scan</option>
                <option value="MRI">MRI</option>
                <option value="Ultrasound">Ultrasound</option>
                <option value="Other">Other</option>
              </select>
              <input className="search-input" type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
              <button type="button" className="secondary-button" onClick={() => { setImageTypeFilter(''); setDateFilter(''); }}>
                Clear Filters
              </button>
            </div>
          </section>

          <div className="imaging-grid">
            <section className="panel imaging-list">
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Body Part</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredImages.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="empty-cell">
                          No scans available.
                        </td>
                      </tr>
                    ) : (
                      filteredImages.map((image) => (
                        <tr key={image._id} className={image._id === selectedImageId ? 'row-active' : ''}>
                          <td>{image.imageType}</td>
                          <td>{image.bodyPart}</td>
                          <td>{formatDate(image.scanDate)}</td>
                          <td>{image.report?.status || 'draft'}</td>
                          <td className="inline-actions">
                            <button type="button" className="text-link button-link" onClick={() => setSelectedImageId(image._id)}>
                              View
                            </button>
                            <a className="text-link" href={buildFileUrl(image.filePath)} download={image.fileName || undefined}>
                              Download
                            </a>
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
                      <h3>{selectedImage.imageType}</h3>
                      <p className="muted">{selectedImage.bodyPart}</p>
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
                          alt={selectedImage.imageType}
                          style={{ transform: `scale(${zoom})` }}
                          className="imaging-image"
                        />
                      ) : (
                        <object data={selectedFileUrl} type={selectedImage.fileType || 'application/octet-stream'} className="imaging-object">
                          <p>This file type cannot be rendered inline by the browser. Use Download to open it in a DICOM viewer.</p>
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

                  <section className="imaging-report read-only">
                    <h3>Doctor Report</h3>
                    <p className={`status-pill ${selectedImage.report?.status === 'final' ? 'completed' : 'scheduled'}`}>
                      {selectedImage.report?.status || 'draft'}
                    </p>
                    <pre>{selectedImage.report?.findings || 'No report has been written yet.'}</pre>
                  </section>
                </>
              ) : (
                <div className="empty-panel">No scan selected.</div>
              )}
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}
