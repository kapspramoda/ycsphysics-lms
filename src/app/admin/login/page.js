"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Admin කෙනෙක් කියලා බ්‍රවුසරයේ මතක තියාගන්නවා
        localStorage.setItem('isAdminLoggedIn', 'true');
        router.push('/admin'); // Admin Dashboard එකට යවනවා
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans p-4">
      <div className="max-w-md w-full bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700">
        
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">⚙️</div>
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-slate-400 mt-2 text-sm">Pramoda Chemistry LMS - පද්ධති කළමනාකරණය</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm font-bold text-center mb-6">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-slate-300 text-sm font-bold mb-2">Admin ඊමේල් ලිපිනය</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-700 border border-slate-600 text-white outline-none focus:border-blue-500 transition" placeholder="admin@example.com"/>
          </div>
          <div>
            <label className="block text-slate-300 text-sm font-bold mb-2">මුරපදය (Password)</label>
            <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-700 border border-slate-600 text-white outline-none focus:border-blue-500 transition" placeholder="••••••••"/>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold rounded-xl px-4 py-4 shadow-lg hover:bg-blue-700 transition transform hover:-translate-y-1 mt-4">
            {loading ? 'පරීක්ෂා කරමින්...' : 'ඇතුල් වන්න (Login)'}
          </button>
        </form>

        <button onClick={() => router.push('/')} className="w-full mt-6 text-slate-400 hover:text-white text-sm font-bold transition">
          ← මුල් පිටුවට යන්න
        </button>

      </div>
    </div>
  );
}