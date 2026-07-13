"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function StudentMarksPage() {
  const router = useRouter();
  const [marksData, setMarksData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // --- Sidebar සඳහා States ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user'); 
    
    if (!storedUser) {
      router.push('/auth');
    } else {
      setIsAuthorized(true);
      const userObj = JSON.parse(storedUser);
      const userEmail = userObj.email;
      
      // Sidebar එකට නම සහ පින්තූරය ගන්නවා
      setUserName(userObj.name);
      const storedAvatar = localStorage.getItem('userAvatar');
      if (storedAvatar) setAvatar(storedAvatar);

      const fetchMarks = async () => {
        try {
          const res = await fetch(`/api/my-marks?email=${userEmail}`);
          const data = await res.json();
          if (data.marks) setMarksData(data.marks);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

      fetchMarks();
    }
  }, [router]);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('user');
    router.push('/auth');
  };

  if (!isAuthorized) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-blue-600">පරීක්ෂා කරමින් පවතී...</div>;
  }

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
        
        {/* Header with Hamburger Menu */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-30 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition">
              <span className="text-2xl font-bold">☰</span>
            </button>
            <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <span className="text-2xl hidden sm:block">📊</span> මගේ ප්‍රගතිය
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
        <div className="p-4 md:p-8 pb-20 max-w-6xl mx-auto w-full">
          {loading ? (
            <div className="text-center mt-20 text-slate-500 font-bold text-lg animate-pulse">ලකුණු පූරණය වෙමින් පවතී... ⏳</div>
          ) : marksData.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center mt-10">
              <span className="text-6xl block mb-4 opacity-50">📭</span>
              <h2 className="text-xl font-bold text-slate-700">තවමත් ලකුණු ඇතුළත් කර නොමැත.</h2>
              <p className="text-slate-500 mt-2">ප්‍රශ්න පත්‍ර සඳහා ලකුණු ඇතුළත් කළ පසු මෙහි ප්‍රස්තාරය දිස්වනු ඇත.</p>
            </div>
          ) : (
            <div className="space-y-8 animate-fade-in">
              
              {/* Line Graph Card */}
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-md border border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 mb-6 border-b pb-4 flex items-center gap-2">
                  <span className="text-blue-500">📈</span> ලකුණු විචලනය
                </h2>
                <div className="h-[300px] sm:h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={marksData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="paperName" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontWeight: 'bold', fontSize: '14px' }}/>
                      <Line type="monotone" dataKey="score" name="මගේ ලකුණු" stroke="#2563eb" strokeWidth={4} dot={{ r: 5, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="highestScore" name="පන්තියේ වැඩිම ලකුණ" stroke="#16a34a" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: '#16a34a' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Marks Table Card */}
              <div className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden">
                <div className="bg-blue-50 border-b border-blue-100 p-5">
                  <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                    <span>📝</span> සවිස්තරාත්මක ලකුණු සටහන
                  </h2>
                </div>
                <div className="overflow-x-auto p-4 custom-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 text-sm uppercase tracking-wider">
                        <th className="p-4 rounded-tl-xl w-12 text-center">#</th>
                        <th className="p-4">ප්‍රශ්න පත්‍රය</th>
                        <th className="p-4 text-center">මගේ ලකුණු</th>
                        <th className="p-4 text-center text-green-700">පන්තියේ වැඩිම ලකුණ</th>
                        <th className="p-4 rounded-tr-xl text-center">පරතරය (Gap)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marksData.map((mark, idx) => {
                        const gap = mark.highestScore - mark.score;
                        return (
                          <tr key={mark._id} className="border-b hover:bg-slate-50 transition border-slate-100">
                            <td className="p-4 text-center font-bold text-slate-400">{idx + 1}</td>
                            <td className="p-4 font-bold text-slate-800 text-base">{mark.paperName}</td>
                            <td className="p-4 text-center">
                              <span className={`text-xl font-black ${mark.score >= 75 ? 'text-blue-600' : mark.score >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                                {mark.score}%
                              </span>
                            </td>
                            <td className="p-4 text-center font-black text-lg text-green-600">
                              {mark.highestScore}%
                            </td>
                            <td className="p-4 text-center">
                              {gap === 0 ? (
                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold text-sm">🏆 Highest!</span>
                              ) : (
                                <span className="bg-red-50 text-red-500 px-3 py-1 rounded-full font-bold text-sm">-{gap}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}