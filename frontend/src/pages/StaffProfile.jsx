import { useEffect, useState } from 'react';
import { api, buildFileUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';

const fields = [
  ['Full Name', 'name'],
  ['Email', 'email'],
  ['Phone', 'phone'],
  ['Role', 'role'],
  ['Department', 'department'],
  ['Experience', 'experience'],
  ['Qualification', 'qualification'],
  ['Address', 'address'],
  ['Joined Date', 'joinedDate']
];

export function StaffProfile() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(authUser);

  useEffect(() => {
    api.me().then((res) => setUser(res.user)).catch(() => setUser(authUser));
  }, [authUser]);

  if (!user) return <div className="p-6 text-slate-500">Loading...</div>;

  const joined = user.joinedDate ? new Date(user.joinedDate).toLocaleDateString() : '-';
  const avatar = user.profileImage || user.profilePicture || '';

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Hospital Module</p>
            <h1 className="mt-2 text-4xl font-bold text-slate-800">Staff Profile</h1>
            <p className="mt-1 text-slate-500">Manage staff information</p>
          </div>
          <button className="rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white">Edit Profile</button>
        </div>
      </div>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          {avatar ? (
            <img src={buildFileUrl(avatar)} alt="Profile" className="h-28 w-28 shrink-0 rounded-full object-cover ring-4 ring-blue-100" />
          ) : (
            <div className="grid h-28 w-28 shrink-0 place-items-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-3xl font-bold text-white">
              {(user.name || 'U').split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-slate-900">{user.name || '-'}</h2>
            <p className="mt-1 text-slate-500">{user.department || 'Staff'}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">Personal Info</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {fields.map(([label, key]) => (
            <div key={label} className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</div>
              <div className="mt-1 font-medium text-slate-900">{key === 'joinedDate' ? joined : (user[key] || '-')}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
