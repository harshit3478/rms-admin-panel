'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SearchIcon, ChevronDownIcon, ChevronUpIcon } from '@/components/Icons';
import { Pagination } from '@/components/Pagination';

interface Assessment {
  id: string;
  name: string;
  age: string;
  gender: string;
  phnum: string;
  uid: string;
  date: string;
  time: string;
  patientid: string;
  address: string;
  appointmentNum: string;
  'RMS Digital Anxiety Scale'?: string;
  'fis scale score'?: string;
  'vpt score'?: string;
  'rms-ps score'?: string;
  [key: string]: string | undefined;
}

interface PatientGroup {
  key: string;
  name: string;
  age: string;
  gender: string;
  phnum: string;
  patientid: string;
  latestDate: string;
  assessments: Assessment[];
}

const PAGE_SIZE = 20;

function scaleTag(label: string, value: string) {
  return (
    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium mr-1.5 mb-1">
      <span className="text-blue-400 font-normal">{label}</span>
      {value}
    </span>
  );
}

function PatientRow({ group }: { group: PatientGroup }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <tr
        className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-blue-700 text-xs font-semibold">{group.name?.[0]?.toUpperCase() ?? '?'}</span>
            </div>
            <div>
              <div className="font-medium text-slate-900 text-sm">{group.name || '—'}</div>
              {group.patientid && <div className="text-xs text-slate-400">ID: {group.patientid}</div>}
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-slate-600">{group.age || '—'}</td>
        <td className="px-4 py-3 text-sm text-slate-600 capitalize">{group.gender || '—'}</td>
        <td className="px-4 py-3 text-sm text-slate-600">{group.phnum || '—'}</td>
        <td className="px-4 py-3">
          <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full font-medium">
            {group.assessments.length} assessment{group.assessments.length !== 1 ? 's' : ''}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-slate-400">{group.latestDate || '—'}</td>
        <td className="px-4 py-3 text-slate-400">
          {open ? <ChevronUpIcon size={14} /> : <ChevronDownIcon size={14} />}
        </td>
      </tr>
      {open && group.assessments.map((a, i) => (
        <tr key={a.id} className={`bg-blue-50/30 border-b border-blue-100/50 text-sm ${i === group.assessments.length - 1 ? 'border-b-2 border-slate-200' : ''}`}>
          <td className="px-4 py-2.5 pl-14 text-slate-500">
            <span className="text-xs text-slate-400">Assessment {i + 1}</span>
          </td>
          <td className="px-4 py-2.5 text-slate-500" colSpan={3}>
            <div className="flex flex-wrap">
              {a['RMS Digital Anxiety Scale'] && scaleTag('Anxiety', a['RMS Digital Anxiety Scale'])}
              {a['fis scale score'] && scaleTag('FIS', a['fis scale score'])}
              {a['vpt score'] && scaleTag('VPT', a['vpt score'])}
              {a['rms-ps score'] && scaleTag('PS', a['rms-ps score'])}
              {!a['RMS Digital Anxiety Scale'] && !a['fis scale score'] && !a['vpt score'] && !a['rms-ps score'] && (
                <span className="text-xs text-slate-400 italic">No scale scores recorded</span>
              )}
            </div>
          </td>
          <td className="px-4 py-2.5 text-slate-400 text-xs">{a.appointmentNum ? `Appt #${a.appointmentNum}` : ''}</td>
          <td className="px-4 py-2.5 text-slate-400 text-xs">{a.date || ''}</td>
          <td />
        </tr>
      ))}
    </>
  );
}

export default function PatientsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const q = query(collection(db, 'Patient'), orderBy('date', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setAssessments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Assessment)));
      setLoading(false);
    }, () => {
      const unsub2 = onSnapshot(collection(db, 'Patient'), snap => {
        setAssessments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Assessment)));
        setLoading(false);
      });
      return unsub2;
    });
    return unsub;
  }, []);

  // Group by patientid (fall back to name+phnum)
  const grouped = useMemo<PatientGroup[]>(() => {
    const map = new Map<string, Assessment[]>();
    for (const a of assessments) {
      const key = a.patientid?.trim() || `${a.name?.trim()}__${a.phnum?.trim()}`;
      const arr = map.get(key) ?? [];
      arr.push(a);
      map.set(key, arr);
    }
    return Array.from(map.entries()).map(([key, list]) => {
      const latest = list[0];
      return {
        key,
        name: latest.name ?? '',
        age: latest.age ?? '',
        gender: latest.gender ?? '',
        phnum: latest.phnum ?? '',
        patientid: latest.patientid ?? '',
        latestDate: latest.date ?? '',
        assessments: list,
      };
    });
  }, [assessments]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return grouped;
    return grouped.filter(g =>
      g.name.toLowerCase().includes(q) ||
      g.phnum.includes(q) ||
      g.patientid.toLowerCase().includes(q)
    );
  }, [grouped, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSearch(v: string) {
    setSearch(v);
    setPage(1);
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
        <p className="text-slate-500 text-sm mt-1">
          All patient assessment records — grouped by patient, expand to see individual assessments
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <SearchIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, phone, or patient ID…"
          value={search}
          onChange={e => handleSearch(e.target.value)}
          className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <div className="w-4 h-4 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
          Loading patients…
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <p className="text-slate-500">{search ? 'No patients match your search.' : 'No patient records yet.'}</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Patient</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Age</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Gender</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Assessments</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Latest</th>
                  <th className="px-4 py-3 w-8" />
                </tr>
              </thead>
              <tbody>
                {paginated.map(group => (
                  <PatientRow key={group.key} group={group} />
                ))}
              </tbody>
            </table>

            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              onPage={p => setPage(p)}
              itemLabel="patient"
            />
          </div>
        </>
      )}
    </div>
  );
}
