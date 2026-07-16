"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminVideosPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // අලුත් ෆෝල්ඩර් අංග (lessonName සහ tuteUrl) ඇතුළත් කර ඇත
  const initialFormState = { title: '', url: '', category: 'Theory', alYear: 'All', lessonName: '', tuteUrl: '' };
  const [formData, setFormData] = useState(initialFormState);
  
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState([]);
  
  // Edit කිරීම සඳහා අවශ්‍ය States
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

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

  // පද්ධතියේ දැනටමත් ඇති පාඩම් නම් ලැයිස්තුවක් සෑදීම (Admin ට ලේසි වීමට)
  const existingLessons = [...new Set(videos.map(v => v.lessonName).filter(Boolean))];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Edit කරනවාද, අලුතින් දානවාද යන්න තීරණය කිරීම
      const method = isEditing ? 'PUT' : 'POST';
      const payload = isEditing ? { id: editId, ...formData } : formData;

      const response = await fetch('/api/videos', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "දෝෂයක් මතු විය.");

      setMessage({ type: 'success', text: isEditing ? 'වීඩියෝව සාර්ථකව යාවත්කාලීන කරන ලදී!' : 'නව වීඩියෝව සාර්ථකව එක් කරන ලදී!' });
      
      // ෆෝම් එක හිස් කිරීම
      setFormData(initialFormState);
      setIsEditing(false);
      setEditId(null);
      
      fetchVideos();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  // Edit බොත්තම එබූ විට
  const handleEdit = (video) => {
    setFormData({
      title: video.title,
      url: `https://www.youtube.com/watch?v=${video.youtubeId}`, // DB එකේ තියෙන ID එකෙන් ආයෙත් ලින්ක් එක හදනවා
      category: video.category || 'Theory',
      alYear: video.alYear || 'All',
      lessonName: video.lessonName || '',
      tuteUrl: video.tuteUrl || ''
    });
    setIsEditing(true);
    setEditId(video._id);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // ෆෝම් එක ගාවට උඩටම යනවා
  };

  // Cancel Edit බොත්තම එබූ විට
  const cancelEdit = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setEditId(null);
    setMessage({ type: '', text: '' });
  };

  // Delete බොත්තම එබූ විට
  const handleDelete = async (id) => {
    if (!window.confirm("මෙම වීඩියෝව සම්පූර්ණයෙන්ම මකා දැමීමට අවශ්‍ය බව ඔබට විශ්වාසද? (මෙය නැවත ලබා ගත නොහැක!)")) return;
    
    try {
      const response = await fetch(`/api/videos?id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setMessage({ type: 'success', text: 'වීඩියෝව සාර්ථකව මකා දමන ලදී.' });
        fetchVideos();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      console.error(error);
      alert("මකා දැමීමේදී දෝෂයක් මතු විය.");
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

  if (!isAuthorized) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><p className="font-bold text-slate-400">පද්ධතියට ඇතුළු වෙමින් පවතී...</p></div>;

  return (
    <div className="bg-gray-100 font-sans flex h-screen overflow-hidden">
      
      <div className={`fixed inset-0 bg-black/50 z-40 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setIsSidebarOpen(false)}></div>

      {/* Navigation (ඔබ ඉල්ලූ පරිදි කිසිදු වෙනසක් කර නොමැත) */}
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

      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative scroll-smooth">
        <header className="bg-white shadow-sm p-4 flex items-center sticky top-0 z-30 border-b border-gray-200">
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 mr-4 text-slate-800 hover:bg-gray-100 rounded-lg transition"><span className="text-2xl font-bold">☰</span></button>
          <h1 className="text-xl font-bold text-slate-800">📺 වීඩියෝ පාඩම් කළමනාකරණය</h1>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1">
            <div className={`bg-white p-6 rounded-2xl shadow-md border-t-8 h-fit sticky top-24 transition-colors ${isEditing ? 'border-amber-500' : 'border-red-600'}`}>
              <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
                {isEditing ? '✏️ වීඩියෝව යාවත්කාලීන කිරීම' : '▶️ නව වීඩියෝවක් එක් කිරීම'}
              </h2>
              
              {message.text && (
                <div className={`p-3 mb-4 rounded-lg text-sm font-bold text-center ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* 1. මාතෘකාව */}
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1">මාතෘකාව (Title)</label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-gray-50 border outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"/>
                </div>
                
                {/* 2. YouTube ලින්ක් එක */}
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1">YouTube ලින්ක් එක</label>
                  <input type="url" required value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-gray-50 border outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"/>
                </div>

                {/* 3. පාඩමේ නම (Lesson Name) - Datalist සමග */}
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1">පාඩමේ නම (Lesson)</label>
                  <input 
                    type="text" 
                    list="lessons" 
                    required 
                    placeholder="උදා: තාපය, යාන්ත්‍ර විද්‍යාව"
                    value={formData.lessonName} 
                    onChange={(e) => setFormData({...formData, lessonName: e.target.value})} 
                    className="w-full px-4 py-2 rounded-lg bg-gray-50 border outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                  <datalist id="lessons">
                    {existingLessons.map((lesson, idx) => (
                      <option key={idx} value={lesson} />
                    ))}
                  </datalist>
                </div>

                {/* 4. නිබන්ධනයේ ලින්ක් එක (Tute URL) */}
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1">PDF නිබන්ධනයේ ලින්ක් එක (Drive URL)</label>
                  <input 
                    type="url" 
                    placeholder="පසුව දැමීමට හිස්ව තබන්න"
                    value={formData.tuteUrl} 
                    onChange={(e) => setFormData({...formData, tuteUrl: e.target.value})} 
                    className="w-full px-4 py-2 rounded-lg bg-gray-50 border outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>

                {/* 5. වර්ගය (Category) සහ 6. A/L Year එක පේළියට */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-1">වර්ගය</label>
                    <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-gray-50 border outline-none focus:border-red-500">
                      <option value="Theory">Theory</option>
                      <option value="Revision">Revision</option>
                      <option value="Paper">Paper</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-1">A/L Year</label>
                    <select value={formData.alYear} onChange={(e) => setFormData({...formData, alYear: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-gray-50 border outline-none focus:border-red-500">
                      <option value="All">සියලුම</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                      <option value="2028">2028</option>
                    </select>
                  </div>
                </div>

                {/* Buttons */}
                <div className="pt-2">
                  <button type="submit" disabled={loading} className={`w-full text-white font-bold rounded-lg px-4 py-3 shadow-md transition ${isEditing ? 'bg-amber-500 hover:bg-amber-600' : 'bg-red-600 hover:bg-red-700'}`}>
                    {loading ? 'රැඳී සිටින්න...' : (isEditing ? 'යාවත්කාලීන කරන්න' : 'එක් කරන්න')}
                  </button>
                  {isEditing && (
                    <button type="button" onClick={cancelEdit} className="w-full mt-3 bg-gray-200 text-gray-700 font-bold rounded-lg px-4 py-3 hover:bg-gray-300 transition">
                      අවලංගු කරන්න
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-2xl shadow-md min-h-[500px]">
              <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4 flex items-center justify-between">
                <div><span className="mr-2">📂</span> පද්ධතියේ ඇති වීඩියෝ ලැයිස්තුව</div>
                <div className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">{videos.length} Videos</div>
              </h2>
              
              <div className="space-y-4">
                {videos.length === 0 ? (
                  <p className="text-center text-gray-500 py-10">දැනට වීඩියෝ කිසිවක් එක් කර නොමැත.</p>
                ) : (
                  videos.map((video) => (
                    <div key={video._id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border transition-all ${video.isVisible === false ? 'bg-gray-50 border-gray-200 opacity-80' : 'bg-white border-gray-100 shadow-sm hover:shadow-md'}`}>
                      
                      <div className="flex items-start gap-4 mb-4 sm:mb-0 w-full sm:w-auto overflow-hidden">
                        <div className="relative flex-shrink-0">
                          <img src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`} className={`w-28 h-16 object-cover rounded-md border ${video.isVisible === false ? 'grayscale opacity-70' : ''}`} />
                          {video.isVisible === false && <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 rounded">Hidden</span>}
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <h3 className={`font-bold text-sm truncate ${video.isVisible === false ? 'text-gray-500 line-through' : 'text-gray-800'}`} title={video.title}>
                            {video.title}
                          </h3>
                          <div className="text-xs text-gray-500 mt-0.5 truncate">
                            📁 {video.lessonName || 'පාඩමක් නැත'} {video.tuteUrl ? ' • 📥 Tute' : ''}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold">{video.alYear}</span>
                            <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded font-bold">{video.category}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons (Hide, Edit, Delete) */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 mt-2 sm:mt-0">
                        
                        <button 
                          onClick={() => toggleVisibility(video._id, video.isVisible !== false)} 
                          title={video.isVisible === false ? "සිසුන්ට පෙන්වන්න" : "සිසුන්ගෙන් සඟවන්න"}
                          className={`p-2 rounded-lg transition-colors ${video.isVisible === false ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
                        >
                          {video.isVisible === false ? '👁️' : '🚫'}
                        </button>

                        <button 
                          onClick={() => handleEdit(video)} 
                          title="වෙනස් කරන්න"
                          className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                        >
                          ✏️
                        </button>

                        <button 
                          onClick={() => handleDelete(video._id)} 
                          title="මකා දමන්න"
                          className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                        >
                          🗑️
                        </button>

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