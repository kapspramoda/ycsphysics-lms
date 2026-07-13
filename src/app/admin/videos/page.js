"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminVideosPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false); // Admin Lock State

  const [formData, setFormData] = useState({ title: '', url: '', category: 'Theory', alYear: '2026' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState([]);

  // Admin ලොග් වෙලාද බලන කොටස
  useEffect(() => {
    const adminToken = localStorage.getItem('isAdminLoggedIn');
    if (!adminToken) {
      router.push('/admin/login');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/videos?admin=true', { cache: 'no-store' });
      const data = await res.json();
      if (data.videos) setVideos(data.videos);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    if (isAuthorized) fetchVideos();
  }, [isAuthorized]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setMessage({ type: 'success', text: data.message });
      setFormData({ title: '', url: '', category: 'Theory', alYear: '2026' }); 
      fetchVideos();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 2000);
    }
  };

  const toggleVisibility = async (id, currentStatus) => {
    try {
      await fetch('/api/videos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isVisible: !currentStatus }) 
      });
      fetchVideos(); 
    } catch (error) { console.error(error); }
  };

  // ලොක් එක චෙක් කරනකම් පෙන්වන තිරය
  if (!isAuthorized) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><p className="font-bold text-slate-400">පද්ධතියට ඇතුළු වෙමින් පවතී...</p></div>;

  return (
    <div className="bg-gray-100 font-sans flex h-screen overflow-hidden">
      
      <div className={`fixed inset-0 bg-black/50 z-40 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setIsSidebarOpen(false)}></div>

      <aside className={`w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static transition-transform duration-300 shadow-xl`}>
        <div className="p-6 border-b border-slate-800 font-bold text-xl flex items-center justify-between">
          <span>⚙️ Admin Panel</span>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">✖</button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-lg transition text-gray-300 hover:text-white"><span>🏠</span><span>මුල් තිරය</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/attendance'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-lg transition text-gray-300 hover:text-white"><span>✅</span><span>පැමිණීම (Attendance)</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/videos'); }} className="flex items-center space-x-3 bg-red-600 px-4 py-3 rounded-lg text-white font-bold shadow-md"><span>📺</span><span>වීඩියෝ පාඩම්</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/tutes'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-lg transition text-gray-300 hover:text-white"><span>📚</span><span>නිබන්ධන</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/questions'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-lg transition text-gray-300 hover:text-white"><span>📝</span><span>MCQ ප්‍රශ්න පත්‍ර</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/marks'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-lg transition text-gray-300 hover:text-white"><span>📊</span><span>ලකුණු ඇතුළත් කිරීම</span></a>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="bg-white shadow-sm p-4 flex items-center sticky top-0 z-30 border-b border-gray-200">
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 mr-4 text-slate-800 hover:bg-gray-100 rounded-lg transition"><span className="text-2xl font-bold">☰</span></button>
          <h1 className="text-xl font-bold text-slate-800">📺 වීඩියෝ පාඩම් කළමනාකරණය</h1>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-md border-t-8 border-red-600 h-fit sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">▶️ නව වීඩියෝවක් එක් කිරීම</h2>
              {message.text && <div className={`p-3 mb-4 rounded-lg text-sm font-bold text-center ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message.text}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1">මාතෘකාව</label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-gray-50 border outline-none"/>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1">YouTube ලින්ක් එක</label>
                  <input type="url" required value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-gray-50 border outline-none"/>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1">වර්ගය (Category)</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-gray-50 border outline-none">
                    <option value="Theory">සිද්ධාන්ත</option>
                    <option value="Revision">පුනරීක්ෂණ</option>
                    <option value="Paper">ප්‍රශ්න පත්‍ර විවරණ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1">A/L Year</label>
                  <select value={formData.alYear} onChange={(e) => setFormData({...formData, alYear: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-gray-50 border outline-none">
                    <option value="All">සියලුම සිසුන්</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                  </select>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-red-600 text-white font-bold rounded-lg px-4 py-3 shadow-md hover:bg-red-700 transition mt-2">
                  {loading ? 'රැඳී සිටින්න...' : 'එක් කරන්න'}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-2xl shadow-md min-h-[500px]">
              <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4 flex items-center">
                <span className="mr-2">📂</span> පද්ධතියේ ඇති වීඩියෝ ලැයිස්තුව
              </h2>
              <div className="space-y-4">
                {videos.length === 0 ? (
                  <p className="text-center text-gray-500 py-10">දැනට වීඩියෝ කිසිවක් එක් කර නොමැත.</p>
                ) : (
                  videos.map((video) => (
                    <div key={video._id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border ${video.isVisible === false ? 'bg-gray-100 border-gray-300 opacity-75 grayscale' : 'bg-white border-blue-100 shadow-sm'}`}>
                      <div className="flex items-center gap-4 mb-4 sm:mb-0">
                        <img src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`} className="w-24 h-16 object-cover rounded-md border" />
                        <div>
                          <h3 className={`font-bold ${video.isVisible === false ? 'text-gray-600 line-through' : 'text-gray-800'}`}>{video.title}</h3>
                          <div className="flex gap-2 mt-1">
                            <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded font-bold">{video.alYear}</span>
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">{video.category}</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => toggleVisibility(video._id, video.isVisible !== false)} className={`w-full sm:w-auto px-4 py-2 rounded-lg font-bold text-sm transition-all transform hover:scale-105 hover:shadow-md ${video.isVisible === false ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}>
                        {video.isVisible === false ? '👁️ පෙන්වන්න' : '🚫 සඟවන්න'}
                      </button>
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