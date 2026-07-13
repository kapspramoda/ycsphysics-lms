"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const router = useRouter();
  
  // --- Sidebar States ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [user, setUser] = useState(null);

  const [allNotifications, setAllNotifications] = useState([
    { id: 1, text: "2025 Model Paper 04 වෙබ් අඩවියට එක් කර ඇත.", type: "paper", date: "2026 අප්‍රේල් 16 - පෙ.ව 10:30", read: false },
    { id: 2, text: "ඔබේ Term Test ලකුණු යාවත්කාලීන විය. ලකුණු: 78%", type: "marks", date: "2026 අප්‍රේල් 15 - ප.ව 2:15", read: false },
    { id: 3, text: "හෙට රාත්‍රී 8.00 ට විශේෂ සජීවී පන්තියක් ඇත. Link එක ලබා ගන්න.", type: "class", date: "2026 අප්‍රේල් 14 - පෙ.ව 8:00", read: true }
   
  ]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/auth');
    } else {
      const userObj = JSON.parse(storedUser);
      setUser(userObj);
      setUserName(userObj.name);
      
      const storedAvatar = localStorage.getItem('userAvatar');
      if (storedAvatar) setAvatar(storedAvatar);
    }
  }, [router]);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('user');
    router.push('/auth');
  };

  const markAsRead = (id) => {
    setAllNotifications(allNotifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  if (!user) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-blue-600">පරීක්ෂා කරමින් පවතී...</div>;

  return (
    <div className="bg-gray-50 font-sans text-gray-800 flex h-screen overflow-hidden">
      
      {/* Mobile Overlay */}
      <div className={`fixed inset-0 bg-black/50 z-40 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setIsSidebarOpen(false)}></div>

      {/* Sidebar Navigation */}
      <aside className={`w-64 bg-blue-900 text-white flex flex-col fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static transition-transform duration-300 shadow-2xl`}>
        <div className="p-6 border-b border-blue-800 font-bold text-xl tracking-wider">
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
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-30 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition">
              <span className="text-2xl font-bold">☰</span>
            </button>
            <h1 className="text-xl font-extrabold text-blue-900 flex items-center gap-2">
              <span className="text-2xl hidden sm:block">🔔</span> සියලුම දැනුම්දීම්
            </h1>
          </div>
          
          <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
            <div className="text-right hidden sm:block">
              <p className="font-bold text-sm text-blue-900">{userName}</p>
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-blue-500 overflow-hidden bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm">
              {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : userName.charAt(0)}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-8 pb-20 max-w-4xl mx-auto w-full">
          <div className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden animate-fade-in">
            
            <div className="bg-blue-50 border-b border-blue-100 p-5 flex justify-between items-center">
              <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                ඔබේ පණිවිඩ
              </h2>
              <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-sm">
                නව දැනුම්දීම් {allNotifications.filter(n => !n.read).length}
              </span>
            </div>

            <div className="p-2">
              {allNotifications.map(n => (
                <div 
                  key={n.id} 
                  onClick={() => markAsRead(n.id)}
                  className={`p-5 border-b border-gray-50 flex items-start cursor-pointer transition ${n.read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/50 hover:bg-blue-50 border-l-4 border-l-blue-500'}`}
                >
                  <div className="text-3xl mr-4 mt-1">
                    {n.type === 'paper' ? '📝' : n.type === 'marks' ? '📊' : n.type === 'tute' ? '📚' : '📢'}
                  </div>
                  <div className="flex-1">
                    <p className={`text-gray-800 ${n.read ? 'font-normal' : 'font-bold'}`}>{n.text}</p>
                    <p className="text-sm text-gray-500 mt-1">{n.date}</p>
                  </div>
                  {!n.read && (
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 shadow-sm"></div>
                  )}
                </div>
              ))}
              
              {allNotifications.length === 0 && (
                <div className="text-center py-12 text-gray-400 bg-white">
                  <span className="text-5xl block mb-3 opacity-50">📭</span>
                  <p className="font-medium">ඔබට පෙන්වීමට නව දැනුම්දීම් කිසිවක් නැත.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}