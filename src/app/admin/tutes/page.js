"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminTutesPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false); 
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [formData, setFormData] = useState({ title: '', pdfUrl: '', category: 'Theory', alYear: '2026' });
  const [tutes, setTutes] = useState([]);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

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

  const fetchTutes = async () => {
    try {
      const res = await fetch('/api/tutes?admin=true', { cache: 'no-store' });
      const data = await res.json();
      if (data.tutes) setTutes(data.tutes);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    if (isAuthorized) fetchTutes();
  }, [isAuthorized]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const response = await fetch('/api/tutes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMsg({ type: 'success', text: 'නිබන්ධනය සාර්ථකව එක් කළා! ✅' });
        setFormData({ title: '', pdfUrl: '', category: 'Theory', alYear: '2026' });
        fetchTutes();
      } else { throw new Error('අසාර්ථකයි.'); }
    } catch (error) {
      setMsg({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
      setTimeout(() => setMsg({ type: '', text: '' }), 2000);
    }
  };

  const toggleVisibility = async (id, currentStatus) => {
    try {
      await fetch('/api/tutes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isVisible: !currentStatus })
      });
      fetchTutes();
    } catch (error) { console.error(error); }
  };

  const deleteTute = async (id) => {
    if (window.confirm('මෙම නිබන්ධනය ස්ථිරවම මකා දැමීමට ඔබට අවශ්‍යද?')) {
      try {
        await fetch('/api/tutes', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
        fetchTutes();
      } catch (error) { console.error(error); }
    }
  };

  const bgMain = isDarkMode ? "bg-slate-950 text-slate-100" : "bg-gray-100 text-gray-800";
  const bgCard = isDarkMode ? "bg-slate-900 border border-slate-800 shadow-none" : "bg-white border-transparent shadow-lg";
  const textMuted = isDarkMode ? "text-slate-400" : "text-gray-500";
  const headerBg = isDarkMode ? "bg-slate-900 border-b border-slate-800" : "bg-white shadow-sm border-b border-gray-200";
  const inputBg = isDarkMode ? "bg-slate-800 border-slate-700 text-white focus:ring-green-500/50" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-green-500";

  if (!isAuthorized) return <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-950 text-slate-400' : 'bg-slate-900 text-slate-400'}`}><p className="font-bold">පද්ධතියට ඇතුළු වෙමින් පවතී...</p></div>;

  return (
    <div className={`font-sans flex h-screen overflow-hidden transition-colors duration-300 ${bgMain}`}>
      
      <div className={`fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)}></div>

      <aside className={`w-64 bg-slate-950 text-white flex flex-col fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static transition-transform duration-300 shadow-xl border-r border-slate-800`}>
        <div className="p-6 border-b border-slate-800 font-bold text-xl flex items-center justify-between">
          <span>⚙️ Admin Panel</span>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">✖</button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-xl transition text-gray-300 hover:text-white"><span>🏠</span><span>මුල් තිරය</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/attendance'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-xl transition text-gray-300 hover:text-white"><span>✅</span><span>පැමිණීම (Attendance)</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/videos'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-xl transition text-gray-300 hover:text-white"><span>📺</span><span>වීඩියෝ පාඩම්</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/tutes'); }} className="flex items-center space-x-3 bg-green-600 px-4 py-3 rounded-xl text-white font-bold shadow-md"><span>📚</span><span>නිබන්ධන</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/questions'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-xl transition text-gray-300 hover:text-white"><span>📝</span><span>MCQ ප්‍රශ්න පත්‍ර</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/marks'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-xl transition text-gray-300 hover:text-white"><span>📊</span><span>ලකුණු ඇතුළත් කිරීම</span></a>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        <header className={`${headerBg} p-4 flex justify-between items-center sticky top-0 z-30 transition-colors duration-300`}>
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className={`md:hidden p-2 mr-4 rounded-lg transition ${isDarkMode ? 'text-white hover:bg-slate-800' : 'text-slate-800 hover:bg-gray-100'}`}><span className="text-2xl font-bold">☰</span></button>
            <h1 className="text-xl font-bold">📚 නිබන්ධන කළමනාකරණය</h1>
          </div>
          <button onClick={toggleTheme} className={`p-2 rounded-full transition-all focus:outline-none ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}>
            {isDarkMode ? <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
          </button>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1">
            <div className={`${bgCard} p-6 rounded-3xl border-t-8 border-t-green-500 h-fit sticky top-24`}>
              <h2 className="text-xl font-bold mb-6 text-center">📥 නව නිබන්ධනයක් එක් කිරීම</h2>
              {msg.text && <div className={`p-3 mb-4 rounded-lg text-sm font-bold text-center ${msg.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{msg.text}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>මාතෘකාව</label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className={`w-full px-4 py-3 rounded-xl border outline-none transition ${inputBg}`}/>
                </div>
                <div>
                  <label className={`block text-sm font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>PDF Link (Drive)</label>
                  <input type="url" required value={formData.pdfUrl} onChange={(e) => setFormData({...formData, pdfUrl: e.target.value})} className={`w-full px-4 py-3 rounded-xl border outline-none transition ${inputBg}`}/>
                </div>
                <div>
                  <label className={`block text-sm font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>වර්ගය (Category)</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className={`w-full px-4 py-3 rounded-xl border outline-none transition ${inputBg}`}>
                    <option value="Theory">සිද්ධාන්ත</option>
                    <option value="Revision">පුනරීක්ෂණ</option>
                    <option value="Marking">Marking Scheme</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>A/L Year</label>
                  <select value={formData.alYear} onChange={(e) => setFormData({...formData, alYear: e.target.value})} className={`w-full px-4 py-3 rounded-xl border outline-none transition ${inputBg}`}>
                    <option value="All">සියලුම සිසුන්</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                  </select>
                </div>
                <button type="submit" disabled={loading} className={`w-full text-white font-bold rounded-xl px-4 py-4 shadow-md transition mt-4 ${loading ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'}`}>
                  {loading ? 'රැඳී සිටින්න...' : 'පද්ධතියට එක් කරන්න'}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className={`${bgCard} p-6 rounded-3xl min-h-[500px]`}>
              <h2 className={`text-xl font-bold mb-6 border-b pb-4 flex items-center justify-between ${isDarkMode ? 'border-slate-800' : 'border-gray-200'}`}>
                <div><span className="mr-2">📂</span> පද්ධතියේ ඇති නිබන්ධන සහ විවරණ</div>
                <div className={`text-sm px-3 py-1 rounded-full ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-700'}`}>{tutes.length} Tutes</div>
              </h2>
              <div className="space-y-4">
                {tutes.length === 0 ? (
                  <div className={`text-center py-10 ${textMuted}`}><span className="text-5xl block mb-4 opacity-50">📭</span>දැනට නිබන්ධන කිසිවක් එක් කර නොමැත.</div>
                ) : (
                  tutes.map((tute) => (
                    <div key={tute._id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl border transition-all ${tute.isVisible === false ? (isDarkMode ? 'bg-slate-900/50 border-slate-800 opacity-60' : 'bg-gray-50 border-gray-200 opacity-60 grayscale') : (isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-green-100 shadow-sm hover:shadow-md')}`}>
                      <div className="flex-1 mb-4 sm:mb-0 w-full overflow-hidden">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${tute.category === 'Theory' ? (isDarkMode ? 'bg-purple-900/40 text-purple-400' : 'bg-purple-100 text-purple-700') : tute.category === 'Revision' ? (isDarkMode ? 'bg-orange-900/40 text-orange-400' : 'bg-orange-100 text-orange-700') : (isDarkMode ? 'bg-purple-900/40 text-purple-400' : 'bg-purple-100 text-purple-700')}`}>{tute.category}</span>
                          <span className={`text-[10px] px-2 py-1 rounded-md font-bold ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>{tute.alYear}</span>
                        </div>
                        <h3 className={`font-bold text-base md:text-lg truncate ${tute.isVisible === false ? (isDarkMode ? 'text-slate-500 line-through' : 'text-gray-500 line-through') : (isDarkMode ? 'text-slate-200' : 'text-gray-800')}`}>{tute.title}</h3>
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button onClick={() => toggleVisibility(tute._id, tute.isVisible !== false)} className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold text-sm transition-all transform hover:scale-105 shadow-sm ${tute.isVisible === false ? (isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300') : (isDarkMode ? 'bg-yellow-900/40 text-yellow-500 hover:bg-yellow-900/60 border border-yellow-900' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200')}`}>
                          {tute.isVisible === false ? '👁️ Show' : '🚫 Hide'}
                        </button>
                        <button onClick={() => deleteTute(tute._id)} className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold text-sm transition-all transform hover:scale-105 shadow-sm ${isDarkMode ? 'bg-red-900/30 text-red-500 hover:bg-red-900/50 border border-red-900/50' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}>🗑️ Erase</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}