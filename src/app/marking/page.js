"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MarkingSchemesPage() {
  const router = useRouter();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [userClasses, setUserClasses] = useState([]);
  const [markings, setMarkings] = useState([]);
  const [userYear, setUserYear] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarkings = async () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) { router.push('/'); return; }
      
      const user = JSON.parse(userStr);
      setUserName(user.name);
      
      const classes = Array.isArray(user.classTypes) ? user.classTypes : ['Theory'];
      setUserClasses(classes);
      const userPhone = user.username || user.email || '';
      
      const storedAvatar = localStorage.getItem('userAvatar');
      if (storedAvatar) setAvatar(storedAvatar);

      const year = user.alYear || 'All';
      setUserYear(year);

      try {
        const res = await fetch(`/api/tutes?year=${year}`);
        const data = await res.json();
        
        if (data.tutes && data.tutes.length > 0) {
          
          const markingSchemes = data.tutes.filter(tute => {
            // 1. Marking Schemes පමණක් පෙරා ගැනීම
            if (tute.category !== 'Marking') return false;
            
            const tuteClasses = tute.classTypes || [];
            
            // 2. පන්ති වර්ගය පරීක්ෂාව
            if (tuteClasses.length > 0) {
              const hasClassAccess = tuteClasses.some(c => classes.includes(c));
              if (!hasClassAccess) return false;
            } else {
              // 🔴 පරණ Marking Schemes නම්, ළමයාට Paper Class තිබිය යුතුමයි
              if (!classes.includes('Paper')) return false;
            }

            // 3. Private පරීක්ෂාව
            if (tute.isPrivate) {
              const allowed = tute.allowedStudents || [];
              if (!allowed.includes(userPhone)) return false;
            }

            return true;
          });

          setMarkings(markingSchemes);
        } else {
          setMarkings([]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMarkings();
  }, [router]);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('user');
    router.push('/');
  };

  const hasPaperAccess = userClasses.includes('Paper');

  if (!loading && !hasPaperAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-md w-full">
          <span className="text-6xl mb-4 block">🔒</span>
          <h2 className="text-xl font-bold text-gray-800 mb-2">අවසර නැත</h2>
          <p className="text-gray-500 text-sm mb-6">මෙම Marking Schemes නැරඹීමට ඔබට Paper Class සඳහා ලියාපදිංචි වීමට අවශ්‍ය වේ.</p>
          <button onClick={() => router.push('/dashboard')} className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition w-full">මුල් තිරයට යන්න</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 font-sans text-gray-800 flex h-screen overflow-hidden">
      
      <div className={`fixed inset-0 bg-black/50 z-40 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setIsSidebarOpen(false)}></div>

      <aside className={`w-64 bg-purple-900 text-white flex flex-col fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static transition-transform duration-300 shadow-2xl`}>
        <div 
          onClick={() => router.push('/')} 
          className="p-6 border-b border-purple-800 font-bold text-xl tracking-wider cursor-pointer hover:opacity-80 transition"
        >
        YCS<span className="text-purple-300">Physics</span>
      </div>
       <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/dashboard'); }} className="flex items-center space-x-3 hover:bg-purple-800 px-4 py-3 rounded-lg transition">
            <span className="text-xl">🏠</span><span className="font-medium">මුල් තිරය</span>
          </a>
          
          {(userClasses.includes('Theory') || userClasses.includes('Revision')) && (
            <a href="#" onClick={(e) => { e.preventDefault(); router.push('/videos'); }} className="flex items-center space-x-3 hover:bg-purple-800 px-4 py-3 rounded-lg transition">
              <span className="text-xl">📺</span><span className="font-medium">වීඩියෝ පාඩම්</span>
            </a>
          )}

          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/exam'); }} className="flex items-center space-x-3 hover:bg-purple-800 px-4 py-3 rounded-lg transition">
            <span className="text-xl">💻</span><span className="font-medium">Online විභාග</span>
          </a>
          
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/tutes'); }} className="flex items-center space-x-3 hover:bg-purple-800 px-4 py-3 rounded-lg transition">
            <span className="text-xl">📚</span><span className="font-medium">නිබන්ධන</span>
          </a>

          {userClasses.includes('Paper') && (
            <>
              <a href="#" onClick={(e) => { e.preventDefault(); router.push('/paper-discussion'); }} className="flex items-center space-x-3 hover:bg-purple-800 px-4 py-3 rounded-lg transition">
                <span className="text-xl">📝</span><span className="font-medium">Paper Discussions</span>
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); router.push('/marking'); }} className="flex items-center space-x-3 bg-purple-800 px-4 py-3 rounded-lg transition shadow-inner border border-purple-800/30">
                <span className="text-xl">✅</span><span className="font-bold text-white">Marking Schemes</span>
              </a>
            </>
          )}

          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/dashboard/marks'); }} className="flex items-center space-x-3 hover:bg-purple-800 px-4 py-3 rounded-lg transition">
            <span className="text-xl">📊</span><span className="font-medium">ප්‍රගති වාර්තාව</span>
          </a>
          
          <div className="pt-4 border-t border-purple-800/50 mt-4 mb-2"></div>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/settings'); }} className="flex items-center space-x-3 hover:bg-purple-800 px-4 py-3 rounded-lg transition">
            <span className="text-xl">⚙️</span><span className="font-medium">සැකසුම්</span>
          </a>
        </nav>
        <div className="p-4 border-t border-purple-800">
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 hover:bg-red-500/20 p-3 rounded-lg transition text-purple-200 hover:text-red-400">
            <div className="w-8 h-8 rounded-full bg-purple-800 flex items-center justify-center text-white font-bold text-sm">
              {userName.charAt(0)}
            </div>
            <span className="font-bold">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-30 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition">
              <span className="text-2xl font-bold">☰</span>
            </button>
            <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <span className="text-2xl hidden sm:block">✅</span> Marking Schemes
            </h1>
          </div>
          
          <div className="flex items-center gap-3 bg-purple-50 px-4 py-2 rounded-full border border-purple-100">
            <div className="text-right hidden sm:block">
              <p className="font-bold text-sm text-purple-900">{userYear} A/L</p>
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-purple-500 overflow-hidden bg-purple-600 flex items-center justify-center font-bold text-white shadow-sm">
              {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : userName.charAt(0)}
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 pb-20 max-w-6xl mx-auto w-full">
          {loading ? (
             <div className="text-center mt-20 text-slate-500 font-bold text-lg animate-pulse">පූරණය වෙමින් පවතී... ⏳</div>
          ) : markings.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
              {markings.map(mark => (
                <div key={mark._id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:shadow-md transition gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase px-3 py-1 rounded-full mb-2 inline-block bg-green-100 text-green-700">
                      MARKING SCHEME
                    </span>
                    <h3 className="text-lg font-bold text-gray-800 leading-tight">{mark.isPrivate ? '🔒 ' : ''}{mark.title}</h3>
                  </div>
                  <a href={mark.pdfUrl} target="_blank" rel="noopener noreferrer" className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-sm border border-green-700 flex items-center gap-2 w-full sm:w-auto justify-center">
                    <span>📥</span> Download
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center mt-10">
              <span className="text-6xl block mb-4 opacity-50">📭</span>
              <h2 className="text-xl font-bold text-slate-700">දැනට Marking Schemes කිසිවක් එක් කර නොමැත.</h2>
              <p className="text-slate-500 mt-2">ඔබ අදාළ පන්ති වලට ඇතුළත් වී ඇත්දැයි පරීක්ෂා කරන්න.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}