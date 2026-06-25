'use client';

import { useEffect, useState } from 'react';
import { collection, getCountFromServer, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { PatientsIcon, UserCheckIcon, BlogIcon, ChevronRightIcon } from '@/components/Icons';

interface RecentPatient {
  id: string;
  name: string;
  age: string;
  gender: string;
  date: string;
  patientid: string;
}

export default function DashboardPage() {
  const [totalPatients, setTotalPatients] = useState<number | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<number | null>(null);
  const [blogPosts, setBlogPosts] = useState<number | null>(null);
  const [recent, setRecent] = useState<RecentPatient[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [patients, requests, blogs] = await Promise.all([
          getCountFromServer(collection(db, 'Patient')),
          getCountFromServer(collection(db, 'registerRequests')),
          getCountFromServer(collection(db, 'blog')),
        ]);
        setTotalPatients(patients.data().count);
        setPendingApprovals(requests.data().count);
        setBlogPosts(blogs.data().count);
      } catch {
        setTotalPatients(0);
        setPendingApprovals(0);
        setBlogPosts(0);
      }

      try {
        const q = query(collection(db, 'Patient'), orderBy('date', 'desc'), limit(8));
        const snap = await getDocs(q);
        const seen = new Set<string>();
        const rows: RecentPatient[] = [];
        for (const d of snap.docs) {
          const data = d.data() as RecentPatient;
          const key = data.patientid || d.id;
          if (!seen.has(key)) {
            seen.add(key);
            rows.push({ ...data, id: d.id });
          }
        }
        setRecent(rows);
      } catch {
        // index may not exist yet — skip recent
      }
    }
    load();
  }, []);

  const stats = [
    {
      label: 'Total Assessments',
      value: totalPatients ?? '—',
      sub: 'patient records in database',
      icon: PatientsIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      href: '/patients',
    },
    {
      label: 'Pending Approvals',
      value: pendingApprovals ?? '—',
      sub: 'dentist registration requests',
      icon: UserCheckIcon,
      color: pendingApprovals ? 'text-amber-600' : 'text-slate-400',
      bg: pendingApprovals ? 'bg-amber-50' : 'bg-slate-50',
      href: '/users',
    },
    {
      label: 'Blog Posts',
      value: blogPosts ?? '—',
      sub: 'published articles in the app',
      icon: BlogIcon,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      href: '/blog',
    },
  ];

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Overview of RMS Dental app data</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, sub, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href} className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-all">
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-0.5">{value}</div>
            <div className="text-sm font-medium text-slate-700">{label}</div>
            <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <h2 className="font-semibold text-slate-800 mb-3 text-sm uppercase tracking-wide">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { href: '/users', label: 'Review pending registrations', Icon: UserCheckIcon },
            { href: '/blog/new', label: 'Write a new blog post', Icon: BlogIcon },
            { href: '/patients', label: 'Browse patient records', Icon: PatientsIcon },
          ].map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-sm transition-colors group"
            >
              <Icon size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
              {label}
              <ChevronRightIcon size={14} className="ml-auto text-slate-300 group-hover:text-slate-500" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent patients */}
      {recent.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800 text-sm">Recent patients</h2>
            <Link href="/patients" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Age</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Gender</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((p, i) => (
                <tr key={p.id} className={i < recent.length - 1 ? 'border-b border-slate-50' : ''}>
                  <td className="px-5 py-3 font-medium text-slate-900">{p.name || '—'}</td>
                  <td className="px-5 py-3 text-slate-500">{p.age || '—'}</td>
                  <td className="px-5 py-3 text-slate-500 capitalize">{p.gender || '—'}</td>
                  <td className="px-5 py-3 text-slate-400">{p.date || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
