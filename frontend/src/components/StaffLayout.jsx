import { Outlet } from 'react-router-dom';
import { StaffSidebar } from './StaffSidebar';

export default function StaffLayout() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <StaffSidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
