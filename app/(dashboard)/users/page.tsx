'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { getIdToken } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { Toast, useToast } from '@/components/Toast';
import { Pagination } from '@/components/Pagination';
import { UserCheckIcon, CheckIcon, XIcon, TrashIcon, UsersIcon } from '@/components/Icons';

interface Request {
  id: string;
  name: string;
  email: string;
  password: string;
  qualification: string;
  linkedin: string;
}

interface ApprovedUser {
  uid: string;
  email: string;
  displayName: string;
  disabled: boolean;
  createdAt: string;
}

type Tab = 'pending' | 'approved';
const PAGE_SIZE = 15;

export default function UsersPage() {
  const [tab, setTab] = useState<Tab>('pending');
  const [requests, setRequests] = useState<Request[]>([]);
  const [approved, setApproved] = useState<ApprovedUser[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingApproved, setLoadingApproved] = useState(false);
  const [approvedFetched, setApprovedFetched] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const { toast, showToast, dismiss } = useToast();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'registerRequests'), snap => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() } as Request)));
      // order them by timestamp descending
      setRequests(prev => [...prev].sort((a, b) => b.id.localeCompare(a.id)));
      
      setLoadingRequests(false);
    });
    return unsub;
  }, []);

  async function fetchApproved() {
    if (approvedFetched) return;
    setLoadingApproved(true);
    try {
      const idToken = await getIdToken(auth.currentUser!);
      const res = await fetch('/api/list-users', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to load users');
      setApproved(data.users as ApprovedUser[]);
      setApprovedFetched(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load users';
      showToast(msg, 'error');
    } finally {
      setLoadingApproved(false);
    }
  }

  function switchTab(t: Tab) {
    setTab(t);
    setPage(1);
    if (t === 'approved') fetchApproved();
  }

  async function handleApprove(req: Request) {
    setProcessing(req.id);
    try {
      const idToken = await getIdToken(auth.currentUser!);
      const res = await fetch('/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ email: req.email, password: req.password, displayName: req.name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to create user');
      await deleteDoc(doc(db, 'registerRequests', req.id));
      setApprovedFetched(false); // invalidate cache so next tab visit re-fetches
      showToast(`${req.name} approved — account created.`, 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to approve.', 'error');
    } finally {
      setProcessing(null);
    }
  }

  async function handleReject(req: Request) {
    setProcessing(req.id);
    try {
      await deleteDoc(doc(db, 'registerRequests', req.id));
      showToast(`${req.name}'s request rejected.`, 'success');
    } catch {
      showToast('Failed to reject request.', 'error');
    } finally {
      setProcessing(null);
    }
  }

  async function handleDeleteUser(user: ApprovedUser) {
    if (!confirm(`Remove ${user.email} from the system? This cannot be undone.`)) return;
    setProcessing(user.uid);
    try {
      const idToken = await getIdToken(auth.currentUser!);
      const res = await fetch('/api/delete-user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ uid: user.uid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to remove user');
      setApproved(prev => prev.filter(u => u.uid !== user.uid));
      showToast(`${user.email} removed.`, 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to remove user.', 'error');
    } finally {
      setProcessing(null);
    }
  }

  const approvedPage = approved.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const approvedTotalPages = Math.ceil(approved.length / PAGE_SIZE);

  return (
    <div className="p-8 max-w-3xl">
      <Toast toast={toast} onDismiss={dismiss} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <p className="text-slate-500 text-sm mt-1">Manage registration requests and active dentist accounts</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
        <TabBtn active={tab === 'pending'} onClick={() => switchTab('pending')}>
          <UserCheckIcon size={14} />
          Pending
          {requests.length > 0 && (
            <span className="ml-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              {requests.length}
            </span>
          )}
        </TabBtn>
        <TabBtn active={tab === 'approved'} onClick={() => switchTab('approved')}>
          <UsersIcon size={14} />
          Approved Users
        </TabBtn>
      </div>

      {/* ── PENDING TAB ── */}
      {tab === 'pending' && (
        <>
          {loadingRequests && <Spinner label="Loading requests…" />}

          {!loadingRequests && requests.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheckIcon size={20} className="text-emerald-600" />
              </div>
              <p className="text-slate-700 font-medium">All caught up!</p>
              <p className="text-slate-400 text-sm mt-1">No pending registration requests.</p>
            </div>
          )}

          <div className="space-y-3">
            {requests.map(req => (
              <div key={req.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-amber-700 text-sm font-semibold">{req.name?.[0]?.toUpperCase() ?? '?'}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-slate-900">{req.name}</span>
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Pending</span>
                      </div>
                      <div className="text-sm text-slate-500 space-y-0.5">
                        <div>{req.email}</div>
                        {req.qualification && <div className="text-slate-400">{req.qualification}</div>}
                        {req.linkedin && (
                          <a href={req.linkedin} target="_blank" rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-xs block truncate">
                            {req.linkedin}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => handleApprove(req)} disabled={processing === req.id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 font-medium">
                      {processing === req.id
                        ? <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        : <CheckIcon size={14} />}
                      Approve
                    </button>
                    <button onClick={() => handleReject(req)} disabled={processing === req.id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white text-red-600 border border-red-200 text-sm rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
                      <XIcon size={14} />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── APPROVED TAB ── */}
      {tab === 'approved' && (
        <>
          {loadingApproved && <Spinner label="Loading users…" />}

          {!loadingApproved && approved.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <p className="text-slate-500">No approved users found.</p>
            </div>
          )}

          {!loadingApproved && approved.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">User</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Created</th>
                    <th className="px-4 py-3 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {approvedPage.map(user => (
                    <tr key={user.uid} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <span className="text-blue-700 text-xs font-semibold">
                              {(user.displayName || user.email)?.[0]?.toUpperCase() ?? '?'}
                            </span>
                          </div>
                          <span className="font-medium text-slate-900">{user.displayName || '—'}</span>
                          {user.disabled && (
                            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">Disabled</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{user.email}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteUser(user)}
                          disabled={processing === user.uid}
                          title="Remove user"
                          className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                        >
                          {processing === user.uid
                            ? <div className="w-3 h-3 border-2 border-slate-300 border-t-red-500 rounded-full animate-spin" />
                            : <TrashIcon size={14} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <Pagination
                page={page}
                totalPages={approvedTotalPages}
                totalItems={approved.length}
                pageSize={PAGE_SIZE}
                onPage={p => setPage(p)}
                itemLabel="user"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      {children}
    </button>
  );
}

function Spinner({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-slate-400 text-sm">
      <div className="w-4 h-4 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
      {label}
    </div>
  );
}
