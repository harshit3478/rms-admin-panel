'use client';

import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Field, inputCls } from '@/components/Field';

export default function NewBlogPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    heading: '', body: '', img: '', link: '', citation: '', date: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.heading.trim() || !form.body.trim()) {
      setError('Heading and body are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await addDoc(collection(db, 'blog'), {
        heading: form.heading.trim(),
        body: form.body.trim(),
        img: form.img.trim(),
        link: form.link.trim(),
        citation: form.citation.trim(),
        date: form.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      });
      router.push('/blog');
    } catch {
      setError('Failed to save post. Check Firestore rules.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/blog" className="hover:text-slate-700 transition-colors">Blog</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">New post</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">New blog post</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Heading *">
          <input
            value={form.heading}
            onChange={e => set('heading', e.target.value)}
            className={inputCls}
            placeholder="Article title"
          />
        </Field>

        <Field label="Body *">
          <textarea
            value={form.body}
            onChange={e => set('body', e.target.value)}
            rows={8}
            className={`${inputCls} resize-y`}
            placeholder="Article content…"
          />
        </Field>

        <Field label="Image URL" hint="Direct link to a cover image (optional)">
          <input
            value={form.img}
            onChange={e => set('img', e.target.value)}
            className={inputCls}
            placeholder="https://…"
          />
        </Field>

        <Field label="Reference link" hint="External source link (optional)">
          <input
            value={form.link}
            onChange={e => set('link', e.target.value)}
            className={inputCls}
            placeholder="https://…"
          />
        </Field>

        <Field label="Citation" hint="Author or source name (optional)">
          <input
            value={form.citation}
            onChange={e => set('citation', e.target.value)}
            className={inputCls}
            placeholder="e.g. Dr. Shetty, 2024"
          />
        </Field>

        <Field label="Date" hint="Leave blank to use today's date">
          <input
            value={form.date}
            onChange={e => set('date', e.target.value)}
            className={inputCls}
            placeholder="e.g. Jun 11, 2026"
          />
        </Field>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {saving ? 'Publishing…' : 'Publish post'}
          </button>
          <Link
            href="/blog"
            className="px-5 py-2 rounded-lg text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
