"use client";
import React, { useState, useEffect } from 'react'; // useEffect එකතු කරන්න
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false); // අලුත් State එක

  // Admin ලොග් වෙලාද කියලා බලන කොටස
  useEffect(() => {
    const adminToken = localStorage.getItem('isAdminLoggedIn');
    if (!adminToken) {
      router.push('/admin/login'); // ලොග් වෙලා නැත්නම් ලොග් වෙන පිටුවට විසි කරනවා
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  // චෙක් කරනකම් සුදු පාට තිරයක් පෙන්වනවා
  if (!isAuthorized) return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><p className="font-bold text-gray-500">Checking Authorization...</p></div>;

  return (
    <div className="bg-gray-100 font-sans flex h-screen overflow-hidden">
      
      {/* Mobile View සඳහා කලු පාට පසුබිම (Overlay) */}
      <div className={`fixed inset-0 bg-black/50 z-40 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setIsSidebarOpen(false)}></div>

      {/* වම් පැත්තේ Navigation Panel (Sidebar) */}
      <aside className={`w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static transition-transform duration-300 shadow-xl`}>
        <div className="p-6 border-b border-slate-800 font-bold text-xl flex items-center justify-between">
          <span>⚙️ Admin Panel</span>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">✖</button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin'); }} className="flex items-center space-x-3 bg-blue-600 px-4 py-3 rounded-lg text-white font-bold shadow-md"><span>🏠</span><span>මුල් තිරය</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/attendance'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-lg transition text-gray-300 hover:text-white"><span>✅</span><span>පැමිණීම (Attendance)</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/videos'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-lg transition text-gray-300 hover:text-white"><span>📺</span><span>වීඩියෝ පාඩම්</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/tutes'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-lg transition text-gray-300 hover:text-white"><span>📚</span><span>නිබන්ධන</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/questions'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-lg transition text-gray-300 hover:text-white"><span>📝</span><span>MCQ ප්‍රශ්න පත්‍ර</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/marks'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-lg transition text-gray-300 hover:text-white"><span>📊</span><span>ලකුණු ඇතුළත් කිරීම</span></a>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={() => router.push('/')} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg transition">⬅ මුල් පිටුවට</button>
        </div>
      </aside>

      {/* දකුණු පැත්තේ ප්‍රධාන කොටස */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        
        {/* ඉහළ Header එක (Mobile Menu බොත්තම මෙහි ඇත) */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-30 border-b border-gray-200">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 mr-4 text-slate-800 hover:bg-gray-100 rounded-lg transition">
              <span className="text-2xl font-bold">☰</span>
            </button>
            <h1 className="text-xl font-bold text-slate-800 hidden sm:block">Pramoda Chemistry LMS - Admin</h1>
          </div>
          <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">A</div>
            <span className="font-bold text-blue-900 text-sm hidden sm:block">Admin Mode</span>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">මොකක්ද අද කරන්න තියෙන්නේ? 🚀</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. පැමිණීම (අලුත්) */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border-t-8 border-teal-500 hover:shadow-lg transition transform hover:-translate-y-1">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">පැමිණීම</h2>
                  <p className="text-gray-500 text-sm">සිසුන්ගේ දෛනික පැමිණීම සටහන් කිරීම.</p>
                </div>
                <div className="text-5xl">✅</div>
              </div>
              <button onClick={() => router.push('/admin/attendance')} className="w-full bg-teal-50 text-teal-700 font-bold py-3 rounded-xl hover:bg-teal-100 transition">Attendance</button>
            </div>

            {/* අනිත් කාඩ්පත්... */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border-t-8 border-red-500 hover:shadow-lg transition transform hover:-translate-y-1">
              <div className="flex justify-between items-start mb-6">
                <div><h2 className="text-2xl font-bold text-gray-800 mb-2">වීඩියෝ</h2><p className="text-gray-500 text-sm">වීඩියෝ එක් කිරීම සහ සැඟවීම.</p></div>
                <div className="text-5xl">📺</div>
              </div>
              <button onClick={() => router.push('/admin/videos')} className="w-full bg-red-50 text-red-600 font-bold py-3 rounded-xl hover:bg-red-100 transition">කළමනාකරණය</button>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border-t-8 border-green-500 hover:shadow-lg transition transform hover:-translate-y-1">
              <div className="flex justify-between items-start mb-6">
                <div><h2 className="text-2xl font-bold text-gray-800 mb-2">නිබන්ධන</h2><p className="text-gray-500 text-sm">PDF සහ Marking Schemes.</p></div>
                <div className="text-5xl">📚</div>
              </div>
              <button onClick={() => router.push('/admin/tutes')} className="w-full bg-green-50 text-green-600 font-bold py-3 rounded-xl hover:bg-green-100 transition">කළමනාකරණය</button>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border-t-8 border-blue-500 hover:shadow-lg transition transform hover:-translate-y-1">
              <div className="flex justify-between items-start mb-6">
                <div><h2 className="text-2xl font-bold text-gray-800 mb-2">ප්‍රශ්න පත්‍ර</h2><p className="text-gray-500 text-sm">Online MCQ ප්‍රශ්න සැකසීම.</p></div>
                <div className="text-5xl">📝</div>
              </div>
              <button onClick={() => router.push('/admin/questions')} className="w-full bg-blue-50 text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-100 transition">කළමනාකරණය</button>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border-t-8 border-yellow-500 hover:shadow-lg transition transform hover:-translate-y-1 lg:col-span-2">
              <div className="flex justify-between items-start mb-6">
                <div><h2 className="text-2xl font-bold text-gray-800 mb-2">ලකුණු ඇතුළත් කිරීම</h2><p className="text-gray-500 text-sm">පන්ති කාමරයේ ප්‍රතිඵල ලේඛන යාවත්කාලීන කිරීම.</p></div>
                <div className="text-5xl">📊</div>
              </div>
              <button onClick={() => router.push('/admin/marks')} className="w-full bg-yellow-50 text-yellow-700 font-bold py-3 rounded-xl hover:bg-yellow-100 transition">ලකුණු සටහන් කරන්න</button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}