'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import {
  DashboardIcon,
  UserCheckIcon,
  PatientsIcon,
  BlogIcon,
  LogoutIcon,
} from '@/components/Icons';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { href: '/users', label: 'User Approvals', icon: UserCheckIcon },
  { href: '/patients', label: 'Patients', icon: PatientsIcon },
  { href: '/blog', label: 'Blog', icon: BlogIcon },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      if (!user) {
        router.replace('/login');
      } else {
        setUserEmail(user.email);
      }
      setChecking(false);
    });
    return unsub;
  }, [router]);

  async function handleSignOut() {
    await signOut(auth);
    router.replace('/login');
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
          Loading…
        </div>
      </div>
    );
  }

  const initial = userEmail?.[0]?.toUpperCase() ?? 'A';

  return (
    <div className="h-screen flex overflow-hidden bg-slate-100">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-sm">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-bold">R</span>
          </div>
          <div>
            <span className="font-bold text-slate-900 text-sm">RMS Dental</span>
            <p className="text-xs text-slate-400">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User + sign out */}
        <div className="px-3 pb-4 border-t border-slate-100 pt-3 space-y-1">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-blue-700 text-xs font-semibold">{initial}</span>
            </div>
            <span className="text-xs text-slate-500 truncate flex-1">{userEmail}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogoutIcon size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
