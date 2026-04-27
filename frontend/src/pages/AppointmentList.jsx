import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { PageHeader } from '../components/PageHeader';

export function AppointmentList() {
  const [appointments, setAppointments] = useState([]);
  const [date, setDate] = useState('');

  useEffect(() => {
    api.appointments(date).then(setAppointments).catch(() => setAppointments([]));
  }, [date]);

  return (
    <div className="stack">
      <PageHeader title="Appointment List" subtitle="Review scheduled visits by date and doctor." />
      <section className="panel">
        <div className="toolbar">
          <input className="search-input" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          <button className="secondary-button" onClick={() => setDate('')}>
            Clear Filter
          </button>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-cell">
                    No appointments available.
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td>{appointment.patient?.name}</td>
                    <td>{appointment.doctor?.name}</td>
                    <td>{new Date(appointment.appointmentDate).toLocaleDateString()}</td>
                    <td>{appointment.timeSlot}</td>
                    <td>{appointment.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

