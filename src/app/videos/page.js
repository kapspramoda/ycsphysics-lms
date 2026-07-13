"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VideoLessonsPage() {
  const router = useRouter();
  
  // --- Sidebar States ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [avatar, setAvatar] = useState(null);

  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userYear, setUserYear] = useState('');

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          router.push('/auth');
          return;
        }

        const userObj = JSON.parse(storedUser);
        
        // Sidebar එකට නම සහ පින්තූරය
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
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-30 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition">
              <span className="text-2xl font-bold">☰</span>
            </button>
            <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <span className="text-2xl hidden sm:block">📺</span> වීඩියෝ පාඩම්
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
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2">
            {loading ? (
               <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-20 text-center flex flex-col items-center justify-center animate-fade-in">
                 <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                 <p className="text-gray-500 font-bold">වීඩියෝ පූරණය වෙමින් පවතී...</p>
               </div>
            ) : currentVideo ? (
              <div className="bg-white rounded-3xl shadow-md overflow-hidden border border-slate-100 animate-fade-in">
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe 
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${currentVideo.youtubeId}?autoplay=1`} 
                    title={currentVideo.title}
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="p-6 md:p-8">
                  <span className={`inline-block text-xs px-3 py-1 rounded-full font-bold mb-3 uppercase ${
                    currentVideo.category === 'Theory' ? 'bg-blue-100 text-blue-700' : 
                    currentVideo.category === 'Revision' ? 'bg-amber-100 text-amber-700' : 
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {currentVideo.category}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-800 leading-tight">{currentVideo.title}</h2>
                  <p className="text-gray-500 mt-2 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">💡 මෙම වීඩියෝව අවසන් වනතුරු නැරඹීමට වග බලා ගන්න.</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-20 text-center animate-fade-in">
                <span className="text-6xl block mb-4 opacity-50">📭</span>
                <h3 className="text-xl font-bold text-gray-800 mb-2">වීඩියෝ කිසිවක් නැත</h3>
                <p className="text-gray-500">ඔබේ පන්තියට ({userYear}) අදාළව දැනට වීඩියෝ කිසිවක් පද්ධතියට එක් කර නොමැත.</p>
              </div>
            )}
          </div>

          {/* Playlist Section */}
          {videos.length > 0 && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 h-fit max-h-[85vh] flex flex-col">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-4 flex items-center gap-2">
                <span>📚</span> අනෙකුත් වීඩියෝ ({videos.length})
              </h3>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {videos.map(video => (
                  <div 
                    key={video._id} 
                    onClick={() => setCurrentVideo(video)}
                    className={`flex gap-4 p-3 rounded-2xl cursor-pointer transition border ${currentVideo?._id === video._id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'border-transparent hover:bg-gray-50 hover:border-gray-200'}`}
                  >
                    <div className="w-32 h-20 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0 relative shadow-sm">
                      <img src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`} alt="thumbnail" className="w-full h-full object-cover" />
                      {currentVideo?._id === video._id && (
                        <div className="absolute inset-0 bg-blue-600 bg-opacity-60 flex items-center justify-center backdrop-blur-[1px]">
                          <span className="text-white text-xl shadow-sm">▶</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 py-1 flex flex-col justify-center">
                      <h4 className={`font-bold text-sm line-clamp-2 leading-tight ${currentVideo?._id === video._id ? 'text-blue-900' : 'text-gray-800'}`}>
                        {video.title}
                      </h4>
                      <span className="text-xs text-gray-500 mt-1.5 block font-medium bg-white px-2 py-0.5 rounded-md w-fit border border-gray-100">{video.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}