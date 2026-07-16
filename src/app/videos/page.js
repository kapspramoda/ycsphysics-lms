"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VideoLessonsPage() {
  const router = useRouter();
  
  // --- Global States ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userName, setUserName] = useState('');
  const [avatar, setAvatar] = useState(null);

  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userYear, setUserYear] = useState('');
  
  // පාඩම් අනුව (Lessons) වෙන් කර හඳුනා ගැනීමට
  const [selectedLesson, setSelectedLesson] = useState('All');

  useEffect(() => {
    // Check saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') setIsDarkMode(true);

    const fetchVideos = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          router.push('/auth');
          return;
        }

        const userObj = JSON.parse(storedUser);
        setUserName(userObj.name);
        
        const storedAvatar = localStorage.getItem('userAvatar');
        if (storedAvatar) setAvatar(storedAvatar);

        const year = userObj.alYear || 'All'; 
        setUserYear(year);

        const response = await fetch(`/api/videos?year=${year}`, {
          cache: 'no-store' 
        });
        
        const data = await response.json();
        
        if (data.videos && data.videos.length > 0) {
          setVideos(data.videos);
          setCurrentVideo(data.videos[0]);
        } else {
          setVideos([]);
          setCurrentVideo(null);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVideos();
  }, [router]);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('user');
    router.push('/auth');
  };

  // විද්‍යුත් පද්ධතියේ ඇති සියලුම වෙනස් පාඩම් (Unique Lessons) ලැයිස්තුව සකසා ගැනීම
  const uniqueLessons = ['All', ...new Set(videos.map(v => v.lessonName || 'සාමාන්‍ය විෂය කරුණු'))];

  // තෝරාගත් පාඩමට අනුව වීඩියෝ පෙරීම (Filter)
  const filteredVideos = selectedLesson === 'All' 
    ? videos 
    : videos.filter(v => (v.lessonName || 'Anura') === selectedLesson);

  // --- Theme Classes ---
  const bgMain = isDarkMode ? "bg-slate-950 text-slate-100" : "bg-purple-50/30 text-gray-800";
  const bgCard = isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-purple-100 shadow-sm";
  const textMuted = isDarkMode ? "text-slate-400" : "text-gray-500";
  const headerBg = isDarkMode ? "bg-slate-900 border-b border-slate-800" : "bg-white shadow-sm border-b border-gray-200";
  const inputBg = isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-purple-50 border-purple-100 text-purple-900";

  return (
    <div className={`font-sans flex h-screen overflow-hidden transition-colors duration-300 ${bgMain}`}>
      
      {/* Mobile Overlay */}
      <div className={`fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)}></div>

      {/* Sidebar Navigation (නොවෙනස්ව තබා ඇත) */}
      <aside className={`w-64 bg-purple-900 text-white flex flex-col fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static transition-transform duration-300 shadow-2xl`}>
        <div onClick={() => router.push('/')} className="p-6 border-b border-purple-800 font-bold text-xl tracking-wider cursor-pointer hover:opacity-80 transition col">
          YCS<span className="text-purple-300">Physics</span>
        </div>      
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/dashboard'); }} className="flex items-center space-x-3 hover:bg-purple-800 px-4 py-3 rounded-lg transition">
            <span className="text-xl">🏠</span><span className="font-medium">මුල් තිරය</span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/videos'); }} className="flex items-center space-x-3 bg-purple-800 px-4 py-3 rounded-lg transition">
            <span className="text-xl">📺</span><span className="font-medium">වීඩියෝ පාඩම්</span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/exam'); }} className="flex items-center space-x-3 hover:bg-purple-800 px-4 py-3 rounded-lg transition">
            <span className="text-xl">💻</span><span className="font-medium">Online විභාග</span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/tutes'); }} className="flex items-center space-x-3 hover:bg-purple-800 px-4 py-3 rounded-lg transition">
            <span className="text-xl">📚</span><span className="font-medium">නිබන්ධන</span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/marking'); }} className="flex items-center space-x-3 hover:bg-purple-800 px-4 py-3 rounded-lg transition">
            <span className="text-xl">✅</span><span className="font-medium">Marking Schemes</span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/dashboard/marks'); }} className="flex items-center space-x-3 hover:bg-purple-800 px-4 py-3 rounded-lg transition">
            <span className="text-xl">📊</span><span className="font-medium">ප්‍රගති වාර්තාව</span>
          </a>
          
          <div className="pt-4 border-t border-purple-800/50 mt-4 mb-2"></div>

          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/notifications'); }} className="flex items-center space-x-3 hover:bg-purple-800 px-4 py-3 rounded-lg transition">
            <span className="text-xl">🔔</span><span className="font-medium">දැනුම්දීම්</span>
          </a>
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        
        {/* Header */}
        <header className={`${headerBg} p-4 flex justify-between items-center sticky top-0 z-30 transition-colors duration-300`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className={`md:hidden p-2 rounded-lg transition ${isDarkMode ? 'text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}>
              <span className="text-2xl font-bold">☰</span>
            </button>
            <h1 className="text-xl font-extrabold flex items-center gap-2">
              <span className="text-2xl hidden sm:block">📺</span> වීඩියෝ පාඩම්
            </h1>
          </div>
          
          <div className="flex items-center space-x-4 md:space-x-6">
            {/* Dark Mode Toggle */}
            <button onClick={toggleTheme} className={`p-2 rounded-full transition-all focus:outline-none ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'}`}>
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              )}
            </button>

            <div className={`flex items-center gap-3 px-4 py-2 rounded-full border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-purple-50 border-purple-100'}`}>
              <div className="text-right hidden sm:block">
                <p className={`font-bold text-sm ${isDarkMode ? 'text-purple-400' : 'text-purple-900'}`}>{userYear} A/L</p>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-purple-500 overflow-hidden bg-purple-600 flex items-center justify-center font-bold text-white shadow-sm">
                {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : userName.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Player & Tute */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
               <div className={`${bgCard} p-20 text-center flex flex-col items-center justify-center rounded-3xl`}>
                 <div className="w-12 h-12 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                 <p className={`${textMuted} font-bold`}>වීඩියෝ පූරණය වෙමින් පවතී...</p>
               </div>
            ) : currentVideo ? (
              <div className={`${bgCard} rounded-3xl overflow-hidden animate-fade-in`}>
                
                {/* 20minutes.lk Secured Video Player Style */}
                <div className="relative w-full shadow-inner bg-black" style={{ paddingBottom: '56.25%' }}>
                  <iframe 
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${currentVideo.youtubeId}?autoplay=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&controls=1&disablekb=1`} 
                    title={currentVideo.title}
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>

                {/* Video Info Body */}
                <div className="p-6 md:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <span className="inline-block text-xs px-4 py-1.5 rounded-full font-extrabold bg-purple-600 text-white uppercase tracking-wider shadow-sm">
                      {currentVideo.category || 'Theory'}
                    </span>
                    {currentVideo.lessonName && (
                      <span className={`text-xs px-3 py-1.5 rounded-md font-bold ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-700'}`}>
                        📁 {currentVideo.lessonName}
                      </span>
                    )}
                  </div>
                  
                  <h2 className="text-2xl font-black leading-tight mb-6">{currentVideo.title}</h2>
                  
                  {/* --- නිබන්ධන භාගත කිරීමේ කොටස (Tute Section) --- */}
                  <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
                    isDarkMode ? 'bg-slate-800/50 border-purple-900/30' : 'bg-purple-50/40 border-purple-100/50'
                  }`}>
                    <div className="flex items-center gap-4 text-center sm:text-left">
                      <span className="text-4xl">📚</span>
                      <div>
                        <h4 className="font-bold text-base">මෙම පාඩමට අදාළ නිබන්ධනය (Tute PDF)</h4>
                        <p className={`text-xs mt-0.5 ${textMuted}`}>පන්තියේදී සාකච්ඡා කරන නිබන්ධනය මෙතැනින් ලබාගන්න.</p>
                      </div>
                    </div>
                    {currentVideo.tuteUrl ? (
                      <a 
                        href={currentVideo.tuteUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition transform hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto text-center"
                      >
                        📥 PDF එක බාගන්න
                      </a>
                    ) : (
                      <button 
                        disabled 
                        className={`text-xs font-bold px-4 py-3 rounded-xl border border-dashed cursor-not-allowed w-full sm:w-auto ${
                          isDarkMode ? 'border-slate-700 text-slate-500' : 'border-gray-200 text-gray-400'
                        }`}
                      >
                        ⏳ නිබන්ධනය සූදානම් වෙමින් පවතී
                      </button>
                    )}
                  </div>

                </div>
              </div>
            ) : (
              <div className={`${bgCard} p-20 text-center rounded-3xl`}>
                <span className="text-6xl block mb-4 opacity-50">📭</span>
                <h3 className="text-xl font-bold mb-2">වීඩියෝ කිසිවක් නැත</h3>
                <p className={textMuted}>ඔබේ පන්තියට ({userYear}) අදාළව දැනට වීඩියෝ කිසිවක් පද්ධතියට එක් කර නොමැත.</p>
              </div>
            )}
          </div>

          {/* Right Column: Lesson Selector & Playlist */}
          {videos.length > 0 && (
            <div className="space-y-6">
              
              {/* --- පාඩම් පෙරහන (Subject Lessons Dropdown Filter) --- */}
              <div className={`${bgCard} p-4 rounded-2xl`}>
                <label className="block text-xs font-black uppercase tracking-wider mb-2 text-purple-500">🔖 විෂය නිර්දේශයේ පාඩම් අනුව තෝරන්න</label>
                <select 
                  value={selectedLesson} 
                  onChange={(e) => setSelectedLesson(e.target.value)}
                  className={`w-full rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-purple-500/30 transition border ${inputBg}`}
                >
                  {uniqueLessons.map((lesson, index) => (
                    <option key={index} value={lesson}>
                      {lesson === 'All' ? '📚 සියලුම පාඩම්' : `📁 ${lesson}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Playlist Body */}
              <div className={`${bgCard} p-5 rounded-3xl h-fit max-h-[70vh] flex flex-col`}>
                <h3 className="text-base font-black mb-4 border-b pb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2"><span>🎬</span> වීඩියෝ ලැයිස්තුව</span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-extrabold px-2.5 py-1 rounded-md">{filteredVideos.length}</span>
                </h3>
                
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                  {filteredVideos.map(video => (
                    <div 
                      key={video._id} 
                      onClick={() => setCurrentVideo(video)}
                      className={`flex gap-3 p-2.5 rounded-2xl cursor-pointer transition border ${
                        currentVideo?._id === video._id 
                          ? 'bg-purple-600/10 border-purple-400 shadow-sm text-purple-500 font-bold' 
                          : 'border-transparent hover:bg-purple-50/20 hover:border-purple-100/30'
                      }`}
                    >
                      {/* Video Thumbnail Section */}
                      <div className="w-28 h-16 bg-slate-800 rounded-xl overflow-hidden flex-shrink-0 relative shadow-sm">
                        <img 
                          src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`} 
                          alt="thumbnail" 
                          className="w-full h-full object-cover opacity-80" 
                        />
                        {currentVideo?._id === video._id && (
                          <div className="absolute inset-0 bg-purple-600/70 flex items-center justify-center backdrop-blur-[1px]">
                            <span className="text-white text-base">▶</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Video Context Title */}
                      <div className="flex-1 py-0.5 flex flex-col justify-center">
                        <h4 className={`text-xs line-clamp-2 leading-tight ${currentVideo?._id === video._id ? 'text-purple-600 font-black' : ''}`}>
                          {video.title}
                        </h4>
                        <span className={`text-[10px] mt-1.5 font-bold px-2 py-0.5 rounded-md w-fit border ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-gray-50 border-gray-100 text-gray-500'
                        }`}>
                          {video.category || 'Theory'}
                        </span>
                      </div>

                    </div>
                  ))}
                  
                  {filteredVideos.length === 0 && (
                    <p className={`text-center text-xs italic py-8 ${textMuted}`}>මෙම පාඩම යටතේ වීඩියෝ නොමැත.</p>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}