'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { Toast, useToast } from '@/components/Toast';
import { BlogIcon, PlusIcon, EditIcon, TrashIcon } from '@/components/Icons';

interface BlogPost {
  id: string;
  heading: string;
  body: string;
  date: string;
  citation: string;
  img: string;
  link: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast, showToast, dismiss } = useToast();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'blog'), snap => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost)));
      setLoading(false);
    });
    return unsub;
  }, []);

  async function handleDelete(post: BlogPost) {
    if (!confirm(`Delete "${post.heading}"? This cannot be undone.`)) return;
    setDeleting(post.id);
    try {
      await deleteDoc(doc(db, 'blog', post.id));
      showToast('Post deleted.', 'success');
    } catch {
      showToast('Failed to delete post.', 'error');
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <Toast toast={toast} onDismiss={dismiss} />

      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Blog</h1>
          <p className="text-slate-500 text-sm mt-1">Manage educational content shown in the app</p>
        </div>
        <Link
          href="/blog/new"
          className="flex items-center gap-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <PlusIcon size={15} />
          New post
        </Link>
      </div>

      <div className="h-8" />

      {loading && (
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <div className="w-4 h-4 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
          Loading posts…
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BlogIcon size={20} className="text-blue-600" />
          </div>
          <p className="text-slate-700 font-medium">No blog posts yet</p>
          <Link href="/blog/new" className="text-blue-600 text-sm hover:underline mt-1 inline-block">
            Write the first post →
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors">
            <div className="flex items-start gap-4">
              {/* Thumbnail */}
              {post.img ? (
                <img
                  src={post.img}
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover shrink-0 bg-slate-100"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <BlogIcon size={22} className="text-blue-400" />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 truncate">{post.heading || 'Untitled'}</h3>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">{post.body}</p>
                <div className="flex items-center gap-3 mt-2">
                  {post.date && <span className="text-xs text-slate-400">{post.date}</span>}
                  {post.citation && (
                    <span className="text-xs text-slate-400 truncate">· {post.citation}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 shrink-0">
                <Link
                  href={`/blog/${post.id}/edit`}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors"
                >
                  <EditIcon size={13} />
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(post)}
                  disabled={deleting === post.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {deleting === post.id ? (
                    <div className="w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                  ) : (
                    <TrashIcon size={13} />
                  )}
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
