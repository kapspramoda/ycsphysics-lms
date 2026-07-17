"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Notifications State
  const [notiMessage, setNotiMessage] = useState('');
  const [notiGroup, setNotiGroup] = useState('All');
  const [notiLoading, setNotiLoading] = useState(false);
  const [notiFeedback, setNotiFeedback] = useState({ type: '', text: '' });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') setIsDarkMode(true);

    const adminToken = localStorage.getItem('isAdminLoggedIn');
    if (!adminToken) {
      router.push('/admin/login');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    if (!notiMessage.trim()) return;
    setNotiLoading(true);
    setNotiFeedback({ type: '', text: '' });

    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: notiMessage, alYear: notiGroup })
      });
      const data = await res.json();
      if (res.ok) {
        setNotiFeedback({ type: 'success', text: data.message });
        setNotiMessage('');
      } else {
        setNotiFeedback({ type: 'error', text: data.message });
      }
    } catch (error) {
      setNotiFeedback({ type: 'error', text: 'තාක්ෂණික දෝෂයක් මතු විය.' });
    } finally {
      setNotiLoading(false);
      setTimeout(() => setNotiFeedback({ type: '', text: '' }), 3000);
    }
  };

  const bgMain = isDarkMode ? "bg-slate-950 text-slate-100" : "bg-gray-100 text-gray-800";
  const bgCard = isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-transparent";
  const textMuted = isDarkMode ? "text-slate-400" : "text-gray-500";
  const headerBg = isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200";
  const inputBg = isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900";

  if (!isAuthorized) return <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-gray-100 text-gray-500'}`}><p className="font-bold">Checking Authorization...</p></div>;

  return (
    <div className={`font-sans flex h-screen overflow-hidden transition-colors duration-300 ${bgMain}`}>
      
      <div className={`fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)}></div>

      <aside className={`w-64 bg-slate-950 text-white flex flex-col fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static transition-transform duration-300 shadow-xl border-r border-slate-800`}>
        <div className="p-6 border-b border-slate-800 font-bold text-xl flex items-center justify-between">
          <span>⚙️ Admin Panel</span>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">✖</button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin'); }} className="flex items-center space-x-3 bg-purple-600 px-4 py-3 rounded-xl text-white font-bold shadow-md"><span>🏠</span><span>මුල් තිරය</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/attendance'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-xl transition text-gray-300 hover:text-white"><span>✅</span><span>පැමිණීම (Attendance)</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/videos'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-xl transition text-gray-300 hover:text-white"><span>📺</span><span>වීඩියෝ පාඩම්</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/tutes'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-xl transition text-gray-300 hover:text-white"><span>📚</span><span>නිබන්ධන</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/questions'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-xl transition text-gray-300 hover:text-white"><span>📝</span><span>MCQ ප්‍රශ්න පත්‍ර</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/marks'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-xl transition text-gray-300 hover:text-white"><span>📊</span><span>ලකුණු ඇතුළත් කිරීම</span></a>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={() => router.push('/')} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition">⬅ මුල් පිටුවට</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        <header className={`${headerBg} p-4 flex justify-between items-center sticky top-0 z-30 border-b transition-colors duration-300`}>
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className={`md:hidden p-2 mr-4 rounded-lg transition ${isDarkMode ? 'text-white hover:bg-slate-800' : 'text-slate-800 hover:bg-gray-100'}`}>
              <span className="text-2xl font-bold">☰</span>
            </button>
            <h1 className="text-xl font-bold hidden sm:block">YCS Physics LMS - Admin</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={toggleTheme} className={`p-2 rounded-full transition-all focus:outline-none ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'}`}>
              {isDarkMode ? <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
            </button>
            <div className={`flex items-center gap-3 px-4 py-2 rounded-full border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-purple-50 border-purple-100'}`}>
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">A</div>
              <span className={`font-bold text-sm hidden sm:block ${isDarkMode ? 'text-purple-400' : 'text-purple-900'}`}>Admin Mode</span>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
          
          {/* අලුතින් එක් කළ Notification Form එක */}
          <div className={`${bgCard} p-6 md:p-8 rounded-3xl shadow-sm border mb-8 border-l-8 border-l-amber-500`}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📢</span>
              <h2 className="text-xl md:text-2xl font-bold">සිසුන්ට පණිවිඩයක් යවන්න</h2>
            </div>
            {notiFeedback.text && <div className={`p-3 mb-4 rounded-lg text-sm font-bold text-center ${notiFeedback.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{notiFeedback.text}</div>}
            
            <form onSubmit={handleNotificationSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <input type="text" placeholder="ඔබගේ පණිවිඩය මෙහි ටයිප් කරන්න..." required value={notiMessage} onChange={(e) => setNotiMessage(e.target.value)} className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-amber-500/50 ${inputBg}`} />
                </div>
                <div className="md:col-span-1">
                  <select value={notiGroup} onChange={(e) => setNotiGroup(e.target.value)} className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-amber-500/50 ${inputBg}`}>
                    <option value="All">සියලුම සිසුන්ට</option>
                    <option value="2026">2026 සිසුන්ට</option>
                    <option value="2027">2027 සිසුන්ට</option>
                    <option value="2028">2028 සිසුන්ට</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={notiLoading} className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3 rounded-xl shadow-md transition">
                {notiLoading ? 'යවමින් පවතී...' : 'පණිවිඩය පළ කරන්න'}
              </button>
            </form>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold mb-6">මොකක්ද අද කරන්න තියෙන්නේ? 🚀</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className={`${bgCard} p-8 rounded-3xl shadow-sm border border-t-8 border-t-teal-500 hover:shadow-lg transition transform hover:-translate-y-1`}>
              <div className="flex justify-between items-start mb-6">
                <div><h2 className="text-2xl font-bold mb-2">පැමිණීම</h2><p className={`text-sm ${textMuted}`}>සිසුන්ගේ දෛනික පැමිණීම සටහන් කිරීම.</p></div>
                <div className="text-5xl">✅</div>
              </div>
              <button onClick={() => router.push('/admin/attendance')} className={`w-full font-bold py-3 rounded-xl transition ${isDarkMode ? 'bg-teal-900/50 text-teal-400 hover:bg-teal-900' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'}`}>Attendance</button>
            </div>

            <div className={`${bgCard} p-8 rounded-3xl shadow-sm border border-t-8 border-t-red-500 hover:shadow-lg transition transform hover:-translate-y-1`}>
              <div className="flex justify-between items-start mb-6">
                <div><h2 className="text-2xl font-bold mb-2">වීඩියෝ</h2><p className={`text-sm ${textMuted}`}>වීඩියෝ එක් කිරීම සහ සැඟවීම.</p></div>
                <div className="text-5xl">📺</div>
              </div>
              <button onClick={() => router.push('/admin/videos')} className={`w-full font-bold py-3 rounded-xl transition ${isDarkMode ? 'bg-red-900/50 text-red-400 hover:bg-red-900' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>කළමනාකරණය</button>
            </div>

            <div className={`${bgCard} p-8 rounded-3xl shadow-sm border border-t-8 border-t-green-500 hover:shadow-lg transition transform hover:-translate-y-1`}>
              <div className="flex justify-between items-start mb-6">
                <div><h2 className="text-2xl font-bold mb-2">නිබන්ධන</h2><p className={`text-sm ${textMuted}`}>PDF සහ Marking Schemes.</p></div>
                <div className="text-5xl">📚</div>
              </div>
              <button onClick={() => router.push('/admin/tutes')} className={`w-full font-bold py-3 rounded-xl transition ${isDarkMode ? 'bg-green-900/50 text-green-400 hover:bg-green-900' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>කළමනාකරණය</button>
            </div>

            <div className={`${bgCard} p-8 rounded-3xl shadow-sm border border-t-8 border-t-purple-500 hover:shadow-lg transition transform hover:-translate-y-1`}>
              <div className="flex justify-between items-start mb-6">
                <div><h2 className="text-2xl font-bold mb-2">ප්‍රශ්න පත්‍ර</h2><p className={`text-sm ${textMuted}`}>Online MCQ ප්‍රශ්න සැකසීම.</p></div>
                <div className="text-5xl">📝</div>
              </div>
              <button onClick={() => router.push('/admin/questions')} className={`w-full font-bold py-3 rounded-xl transition ${isDarkMode ? 'bg-purple-900/50 text-purple-400 hover:bg-purple-900' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'}`}>කළමනාකරණය</button>
            </div>

            <div className={`${bgCard} p-8 rounded-3xl shadow-sm border border-t-8 border-t-yellow-500 hover:shadow-lg transition transform hover:-translate-y-1 lg:col-span-2`}>
              <div className="flex justify-between items-start mb-6">
                <div><h2 className="text-2xl font-bold mb-2">ලකුණු ඇතුළත් කිරීම</h2><p className={`text-sm ${textMuted}`}>පන්ති කාමරයේ ප්‍රතිඵල ලේඛන යාවත්කාලීන කිරීම.</p></div>
                <div className="text-5xl">📊</div>
              </div>
              <button onClick={() => router.push('/admin/marks')} className={`w-full font-bold py-3 rounded-xl transition ${isDarkMode ? 'bg-yellow-900/50 text-yellow-400 hover:bg-yellow-900' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'}`}>ලකුණු සටහන් කරන්න</button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}