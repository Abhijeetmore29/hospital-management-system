import { Outlet } from 'react-router-dom';
import { DoctorSidebar } from './DoctorSidebar';
import { DoctorTopbar } from './DoctorTopbar';

export default function DoctorLayout() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <DoctorSidebar />
      <main className="flex-1 overflow-y-auto bg-slate-100">
        <DoctorTopbar />
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
