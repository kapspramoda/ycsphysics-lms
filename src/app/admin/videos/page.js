"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminVideosPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // 🔴 අලුත්: Form එක සඳහා අවශ්‍ය සියලුම අංග
  const initialFormState = { 
    title: '', url: '', lessonName: '', tuteUrl: '', 
    videoType: 'Lesson', // 'Lesson' හෝ 'PaperDiscussion'
    isTheory: true, isRevision: false, isPaper: false, // පන්ති
    is2027: true, is2028: false, // වර්ෂ
    isPrivate: false, allowedStudents: '' 
  };
  const [formData, setFormData] = useState(initialFormState);
  
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState([]);
  
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

  const existingLessons = [...new Set(videos.map(v => v.lessonName).filter(Boolean))];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // 🔴 පන්ති ටික Array එකකට ගැනීම
    const classTypes = [];
    if (formData.isTheory) classTypes.push('Theory');
    if (formData.isRevision) classTypes.push('Revision');
    if (formData.isPaper) classTypes.push('Paper');

    // 🔴 වර්ෂ ටික Array එකකට ගැනීම
    const alYears = [];
    if (formData.is2027) alYears.push('2027');
    if (formData.is2028) alYears.push('2028');

    if (classTypes.length === 0) {
      setMessage({ type: 'error', text: 'අවම වශයෙන් එක් පන්ති වර්ගයක් හෝ තෝරන්න!' });
      setLoading(false); return;
    }
    if (alYears.length === 0) {
      setMessage({ type: 'error', text: 'අවම වශයෙන් එක් වර්ෂයක් හෝ තෝරන්න!' });
      setLoading(false); return;
    }

    try {
      const method = isEditing ? 'PUT' : 'POST';
      const payload = {
        title: formData.title,
        url: formData.url,
        videoType: formData.videoType,
        lessonName: formData.lessonName,
        tuteUrl: formData.tuteUrl,
        classTypes: classTypes,
        alYears: alYears,
        isPrivate: formData.isPrivate,
        allowedStudents: formData.isPrivate && typeof formData.allowedStudents === 'string' 
          ? formData.allowedStudents.split(',').map(s => s.trim()).filter(Boolean) 
          : []
      };

      if (isEditing) payload.id = editId;

      const response = await fetch('/api/videos', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "දෝෂයක් මතු විය.");

      setMessage({ type: 'success', text: isEditing ? 'සාර්ථකව යාවත්කාලීන කරන ලදී! ✅' : 'නව වීඩියෝව සාර්ථකව එක් කළා! ✅' });
      
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

  const handleEdit = (video) => {
    setFormData({
      title: video.title,
      url: `https://www.youtube.com/watch?v=${video.youtubeId}`,
      videoType: video.videoType || 'Lesson',
      lessonName: video.lessonName || '',
      tuteUrl: video.tuteUrl || '',
      isTheory: video.classTypes?.includes('Theory') || false,
      isRevision: video.classTypes?.includes('Revision') || false,
      isPaper: video.classTypes?.includes('Paper') || false,
      is2027: video.alYears?.includes('2027') || false,
      is2028: video.alYears?.includes('2028') || false,
      isPrivate: video.isPrivate || false,
      allowedStudents: video.allowedStudents && video.allowedStudents.length > 0 ? video.allowedStudents.join(', ') : ''
    });
    setIsEditing(true);
    setEditId(video._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setEditId(null);
    setMessage({ type: '', text: '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("මෙය මකා දැමීමට අවශ්‍ය බව විශ්වාසද?")) return;
    try {
      const response = await fetch(`/api/videos?id=${id}`, { method: 'DELETE' });
      if (response.ok) fetchVideos();
    } catch (error) { console.error(error); }
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

  if (!isAuthorized) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><p className="font-bold text-slate-400">Loading...</p></div>;

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
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/students'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-xl transition text-gray-300 hover:text-white"><span>👥</span><span>සිසුන් කළමනාකරණය</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/attendance'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-lg transition text-gray-300 hover:text-white"><span>✅</span><span>පැමිණීම</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/videos'); }} className="flex items-center space-x-3 bg-red-600 px-4 py-3 rounded-lg text-white font-bold shadow-md"><span>📺</span><span>වීඩියෝ සහ Paper Class</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/tutes'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-lg transition text-gray-300 hover:text-white"><span>📚</span><span>නිබන්ධන</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/questions'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-lg transition text-gray-300 hover:text-white"><span>📝</span><span>MCQ ප්‍රශ්න පත්‍ර</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/marks'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-lg transition text-gray-300 hover:text-white"><span>📊</span><span>ලකුණු</span></a>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative scroll-smooth">
        <header className="bg-white shadow-sm p-4 flex items-center sticky top-0 z-30 border-b border-gray-200">
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 mr-4 text-slate-800 hover:bg-gray-100 rounded-lg transition"><span className="text-2xl font-bold">☰</span></button>
          <h1 className="text-xl font-bold text-slate-800">📺 වීඩියෝ සහ Paper Discussions</h1>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1">
            <div className={`bg-white p-6 rounded-2xl shadow-md border-t-8 h-fit sticky top-24 transition-colors ${isEditing ? 'border-amber-500' : 'border-red-600'}`}>
              <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
                {isEditing ? '✏️ යාවත්කාලීන කිරීම' : '▶️ අලුතින් එක් කිරීම'}
              </h2>
              
              {message.text && (
                <div className={`p-3 mb-4 rounded-lg text-sm font-bold text-center ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* 🔴 අලුත්: වීඩියෝ වර්ගය තේරීම */}
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1">මෙය කුමක්ද?</label>
                  <select value={formData.videoType} onChange={(e) => setFormData({...formData, videoType: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-gray-50 border outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500">
                    <option value="Lesson">📺 වීඩියෝ පාඩමක් (Lesson)</option>
                    <option value="PaperDiscussion">📝 ප්‍රශ්න පත්‍ර සාකච්ඡාවක් (Paper Discussion)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1">මාතෘකාව (Title)</label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-gray-50 border outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"/>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1">YouTube ලින්ක් එක</label>
                  <input type="url" required value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-gray-50 border outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"/>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1">පාඩමේ නම (Lesson)</label>
                  <input type="text" list="lessons" required value={formData.lessonName} onChange={(e) => setFormData({...formData, lessonName: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-gray-50 border outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"/>
                  <datalist id="lessons">
                    {existingLessons.map((lesson, idx) => <option key={idx} value={lesson} />)}
                  </datalist>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1">PDF නිබන්ධනයේ ලින්ක් එක (Drive URL)</label>
                  <input type="url" value={formData.tuteUrl} onChange={(e) => setFormData({...formData, tuteUrl: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-gray-50 border outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" />
                </div>

                {/* 🔴 අලුත්: පන්ති සහ වර්ෂ Checkboxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border bg-red-50/50 border-red-100">
                    <label className="block text-xs font-bold mb-3 text-red-800">පන්ති වර්ගය (කිහිපයක් තේරිය හැක):</label>
                    <div className="flex flex-col gap-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={formData.isTheory} onChange={(e) => setFormData({...formData, isTheory: e.target.checked})} className="w-5 h-5 accent-red-600 rounded" />
                        <span className="text-sm font-bold text-gray-700">Theory</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={formData.isRevision} onChange={(e) => setFormData({...formData, isRevision: e.target.checked})} className="w-5 h-5 accent-red-600 rounded" />
                        <span className="text-sm font-bold text-gray-700">Revision</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={formData.isPaper} onChange={(e) => setFormData({...formData, isPaper: e.target.checked})} className="w-5 h-5 accent-red-600 rounded" />
                        <span className="text-sm font-bold text-gray-700">Paper Class</span>
                      </label>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border bg-red-50/50 border-red-100">
                    <label className="block text-xs font-bold mb-3 text-red-800">A/L වර්ෂය (කිහිපයක් තේරිය හැක):</label>
                    <div className="flex flex-col gap-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={formData.is2027} onChange={(e) => setFormData({...formData, is2027: e.target.checked})} className="w-5 h-5 accent-red-600 rounded" />
                        <span className="text-sm font-bold text-gray-700">2027</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={formData.is2028} onChange={(e) => setFormData({...formData, is2028: e.target.checked})} className="w-5 h-5 accent-red-600 rounded" />
                        <span className="text-sm font-bold text-gray-700">2028</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <input type="checkbox" id="isPrivate" checked={formData.isPrivate} onChange={(e) => setFormData({...formData, isPrivate: e.target.checked})} className="w-5 h-5 accent-purple-600 rounded cursor-pointer" />
                  <label htmlFor="isPrivate" className="font-bold text-purple-900 text-sm cursor-pointer">තෝරාගත් සිසුන්ට පමණක් පෙනෙන Private Video එකක්ද?</label>
                </div>

                {formData.isPrivate && (
                  <div className="animate-fade-in">
                    <label className="block text-gray-700 text-sm font-bold mb-1">අවසර ඇති සිසුන්ගේ WhatsApp අංක (කොමාවකින් වෙන් කර ඇතුළත් කරන්න)</label>
                    <textarea 
                      required 
                      placeholder="උදා: 0712345678, 0771234567"
                      value={formData.allowedStudents} 
                      onChange={(e) => setFormData({...formData, allowedStudents: e.target.value})} 
                      className="w-full px-4 py-2 rounded-lg bg-gray-50 border outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 min-h-[80px]"
                    />
                  </div>
                )}

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
                            {video.isPrivate ? '🔒 ' : ''}{video.title}
                          </h3>
                          <div className="text-xs text-gray-500 mt-0.5 truncate">
                            📁 {video.lessonName || 'පාඩමක් නැත'} {video.tuteUrl ? ' • 📥 Tute' : ''}
                          </div>
                          
                          {/* 🔴 අලුත්: Tags පෙන්වන කොටස */}
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded font-bold border border-amber-200">
                              {video.videoType === 'PaperDiscussion' ? '📝 Paper Discussion' : '📺 Lesson'}
                            </span>
                            
                            {video.alYears?.map((y, i) => (
                              <span key={i} className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold border border-blue-200">{y}</span>
                            ))}
                            
                            {video.classTypes?.map((c, i) => (
                              <span key={i} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded font-bold border border-gray-200">{c}</span>
                            ))}
                            
                            {video.isPrivate && <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded font-bold border border-purple-200">Private</span>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 mt-2 sm:mt-0">
                        <button onClick={() => toggleVisibility(video._id, video.isVisible !== false)} title={video.isVisible === false ? "සිසුන්ට පෙන්වන්න" : "සිසුන්ගෙන් සඟවන්න"} className={`p-2 rounded-lg transition-colors ${video.isVisible === false ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}>
                          {video.isVisible === false ? '👁️' : '🚫'}
                        </button>
                        <button onClick={() => handleEdit(video)} title="වෙනස් කරන්න" className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">✏️</button>
                        <button onClick={() => handleDelete(video._id)} title="මකා දමන්න" className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors">🗑️</button>
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