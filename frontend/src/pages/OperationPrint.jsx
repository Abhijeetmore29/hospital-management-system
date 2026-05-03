import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { PageHeader } from '../components/PageHeader';
import { isSignatureImage } from '../utils/signature';

export function OperationPrint() {
  const { operationId } = useParams();
  const [operation, setOperation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.operation(operationId)
      .then((data) => {
        setOperation(data);
        setLoading(false);
      })
      .catch(() => {
        setOperation(null);
        setLoading(false);
      });
  }, [operationId]);

  if (loading) {
    return <div className="panel">Loading surgery sheet...</div>;
  }

  if (!operation) {
    return <div className="panel">Operation record not found.</div>;
  }

  const printDate = operation.operationDate || operation.scheduledDate || operation.createdAt;

  return (
    <div className="stack">
      <PageHeader
        title="Operation Print"
        subtitle="Printable surgery sheet for operation details."
        action={
          <button className="primary-button" onClick={() => window.print()}>
            Print Surgery Sheet
          </button>
        }
      />
      <section className="print-sheet">
        <div className="print-header">
          <h2>City Care Hospital</h2>
          <p>Surgery and Operation Sheet</p>
        </div>
        <div className="print-grid">
          <div>
            <span>Patient Name</span>
            <strong>{operation.patient?.name}</strong>
          </div>
          <div>
            <span>Age / Gender</span>
            <strong>
              {operation.patient?.age} / {operation.patient?.gender}
            </strong>
          </div>
          <div>
            <span>Doctor</span>
            <strong>{operation.doctor?.name}</strong>
          </div>
          <div>
            <span>Operation Name</span>
            <strong>{operation.operationName}</strong>
          </div>
          <div>
            <span>Operation Type</span>
            <strong>{operation.operationType}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{operation.status}</strong>
          </div>
          <div>
            <span>Scheduled Date</span>
            <strong>{new Date(operation.scheduledDate).toLocaleDateString()}</strong>
          </div>
          <div>
            <span>Operation Date</span>
            <strong>{operation.operationDate ? new Date(operation.operationDate).toLocaleDateString() : '-'}</strong>
          </div>
          <div>
            <span>Theatre Room</span>
            <strong>{operation.theatreRoom || '-'}</strong>
          </div>
          <div>
            <span>Anesthesia</span>
            <strong>{operation.anesthesiaType || '-'}</strong>
          </div>
          <div>
            <span>Estimated Cost</span>
            <strong>Rs. {operation.estimatedCost}</strong>
          </div>
          <div>
            <span>Print Date</span>
            <strong>{new Date(printDate).toLocaleDateString()}</strong>
          </div>
        </div>
        <div className="print-section">
          <span>Pre-Op Diagnosis</span>
          <p>{operation.preOpDiagnosis || 'Not provided'}</p>
        </div>
        <div className="print-section">
          <span>Operation Notes</span>
          <pre>{operation.notes || 'No operation notes available.'}</pre>
        </div>
        <div className="signature-block">
          <div>
            <span>Surgeon Signature</span>
            {operation.doctor?.signature ? (
              isSignatureImage(operation.doctor.signature) ? (
                <img
                  className="signature-image signature-image-print"
                  src={operation.doctor.signature}
                  alt="Surgeon signature"
                />
              ) : (
                <div className="signature-text signature-text-print">{operation.doctor.signature}</div>
              )
            ) : (
              <div className="signature-line" />
            )}
          </div>
        </div>
      </section>
      <div className="quick-actions">
        <Link className="secondary-button" to="/operations">
          Back to Operations
        </Link>
      </div>
    </div>
  );
}
