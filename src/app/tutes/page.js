"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentTutes() {
  const router = useRouter();
  
  // --- Sidebar States ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [avatar, setAvatar] = useState(null);

  const [tutes, setTutes] = useState([]);
  const [userYear, setUserYear] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTutes = async () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) { router.push('/auth'); return; }
      
      const user = JSON.parse(userStr);
      setUserName(user.name);
      
      const storedAvatar = localStorage.getItem('userAvatar');
      if (storedAvatar) setAvatar(storedAvatar);

      const year = user.alYear || 'All';
      setUserYear(year);

      try {
        const res = await fetch(`/api/tutes?year=${year}`);
        const data = await res.json();
        setTutes(data.tutes || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTutes();
  }, [router]);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('user');
    router.push('/auth');
  };

  return (
    <div className="bg-gray-50 font-sans text-gray-800 flex h-screen overflow-hidden">
      
      {/* Mobile Overlay */}
      <div className={`fixed inset-0 bg-black/50 z-40 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setIsSidebarOpen(false)}></div>

      {/* Sidebar Navigation */}
      <aside className={`w-64 bg-blue-900 text-white flex flex-col fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static transition-transform duration-300 shadow-2xl`}>
        <div 
          onClick={() => router.push('/')} 
           className="p-6 border-b border-blue-800 font-bold text-xl tracking-wider cursor-pointer hover:opacity-80 transition"
            >
             Pramoda<span className="text-blue-300">Chemistry</span>
          </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
  <a href="#" onClick={(e) => { e.preventDefault(); router.push('/dashboard'); }} className="flex items-center space-x-3 hover:bg-blue-800 px-4 py-3 rounded-lg transition">
    <span className="text-xl">🏠</span><span className="font-medium">මුල් තිරය</span>
  </a>
  <a href="#" onClick={(e) => { e.preventDefault(); router.push('/videos'); }} className="flex items-center space-x-3 hover:bg-blue-800 px-4 py-3 rounded-lg transition">
    <span className="text-xl">📺</span><span className="font-medium">වීඩියෝ පාඩම්</span>
  </a>
  <a href="#" onClick={(e) => { e.preventDefault(); router.push('/exam'); }} className="flex items-center space-x-3 hover:bg-blue-800 px-4 py-3 rounded-lg transition">
    <span className="text-xl">💻</span><span className="font-medium">Online විභාග</span>
  </a>
  <a href="#" onClick={(e) => { e.preventDefault(); router.push('/tutes'); }} className="flex items-center space-x-3 hover:bg-blue-800 px-4 py-3 rounded-lg transition">
    <span className="text-xl">📚</span><span className="font-medium">නිබන්ධන</span>
  </a>
  <a href="#" onClick={(e) => { e.preventDefault(); router.push('/marking'); }} className="flex items-center space-x-3 hover:bg-blue-800 px-4 py-3 rounded-lg transition">
    <span className="text-xl">✅</span><span className="font-medium">Marking Schemes</span>
  </a>
  <a href="#" onClick={(e) => { e.preventDefault(); router.push('/dashboard/marks'); }} className="flex items-center space-x-3 hover:bg-blue-800 px-4 py-3 rounded-lg transition">
    <span className="text-xl">📊</span><span className="font-medium">ප්‍රගති වාර්තාව</span>
  </a>
  
  {/* අලුතින් එකතු කළ දැනුම්දීම් සහ සැකසුම් */}
  <div className="pt-4 border-t border-blue-800/50 mt-4 mb-2"></div>

  <a href="#" onClick={(e) => { e.preventDefault(); router.push('/notifications'); }} className="flex items-center space-x-3 hover:bg-blue-800 px-4 py-3 rounded-lg transition">
    <span className="text-xl">🔔</span><span className="font-medium">දැනුම්දීම්</span>
  </a>
  <a href="#" onClick={(e) => { e.preventDefault(); router.push('/settings'); }} className="flex items-center space-x-3 hover:bg-blue-800 px-4 py-3 rounded-lg transition">
    <span className="text-xl">⚙️</span><span className="font-medium">සැකසුම්</span>
  </a>
</nav>
        <div className="p-4 border-t border-blue-800">
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 hover:bg-red-500/20 p-3 rounded-lg transition text-blue-200 hover:text-red-400">
            <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-white font-bold text-sm">
              {userName.charAt(0)}
            </div>
            <span className="font-bold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-30 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition">
              <span className="text-2xl font-bold">☰</span>
            </button>
            <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <span className="text-2xl hidden sm:block">📚</span> නිබන්ධන
            </h1>
          </div>
          
          <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
            <div className="text-right hidden sm:block">
              <p className="font-bold text-sm text-blue-900">{userYear} A/L</p>
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-blue-500 overflow-hidden bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm">
              {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : userName.charAt(0)}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-8 pb-20 max-w-6xl mx-auto w-full">
          {loading ? (
             <div className="text-center mt-20 text-slate-500 font-bold text-lg animate-pulse">පූරණය වෙමින් පවතී... ⏳</div>
          ) : tutes.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
              {tutes.map(tute => (
                <div key={tute._id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:shadow-md transition gap-4">
                  <div>
                    <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full mb-2 inline-block ${
                      tute.category === 'Theory' ? 'bg-blue-100 text-blue-700' : 
                      tute.category === 'Revision' ? 'bg-amber-100 text-amber-700' : 
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {tute.category}
                    </span>
                    <h3 className="text-lg font-bold text-gray-800 leading-tight">{tute.title}</h3>
                  </div>
                  <a href={tute.pdfUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-sm border border-blue-700 flex items-center gap-2 w-full sm:w-auto justify-center">
                    <span>📥</span> Download
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center mt-10">
              <span className="text-6xl block mb-4 opacity-50">📭</span>
              <h2 className="text-xl font-bold text-slate-700">දැනට නිබන්ධන කිසිවක් එක් කර නොමැත.</h2>
              <p className="text-slate-500 mt-2">කරුණාකර පසුව නැවත පරීක්ෂා කරන්න.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}