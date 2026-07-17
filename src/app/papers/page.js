"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function PaperDiscussionsPage() {
  const router = useRouter();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userName, setUserName] = useState('');
  const [avatar, setAvatar] = useState(null);

  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userYear, setUserYear] = useState('');
  
  const [selectedLesson, setSelectedLesson] = useState('All');

  const playerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
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
        if (localStorage.getItem('userAvatar')) setAvatar(localStorage.getItem('userAvatar'));
        setUserYear(userObj.alYear || 'All');

        const response = await fetch(`/api/videos?year=${userObj.alYear || 'All'}`, { cache: 'no-store' });
        const data = await response.json();
        
        if (data.videos) {
          // 🔴 මෙතනින් Paper කාණ්ඩයේ වීඩියෝ පමණක් වෙන් කර ගනී
          const paperDiscussions = data.videos.filter(v => v.category === 'Paper');
          if (paperDiscussions.length > 0) {
            setVideos(paperDiscussions);
            setCurrentVideo(paperDiscussions[0]);
          } else {
            setVideos([]);
            setCurrentVideo(null);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [router]);

  useEffect(() => {
    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'infoDelivery' && data.info) {
          if (data.info.currentTime !== undefined) setCurrentTime(data.info.currentTime);
          if (data.info.duration !== undefined) setDuration(data.info.duration);
          if (data.info.playbackRate !== undefined) setPlaybackRate(data.info.playbackRate);
          if (data.info.playerState !== undefined) setIsPlaying(data.info.playerState === 1);
        }
      } catch (e) {}
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

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

  const getDownloadUrl = (url) => {
    if (!url) return '#';
    if (url.includes('drive.google.com/file/d/')) {
      const match = url.match(/\/d\/(.+?)\//);
      if (match && match[1]) return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }
    return url;
  };

  const getSecuredVideoUrl = (ytId) => {
    if(!ytId) return "";
    return `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&showinfo=0&controls=0&disablekb=1&iv_load_policy=3&fs=0&enablejsapi=1`;
  };

  const onIframeLoad = () => {
    if (playerRef.current && playerRef.current.contentWindow) {
      playerRef.current.contentWindow.postMessage(JSON.stringify({ event: "listening" }), "*");
    }
  };

  const sendYouTubeCommand = (func, args = []) => {
    if (playerRef.current && playerRef.current.contentWindow) {
      playerRef.current.contentWindow.postMessage(JSON.stringify({ event: "command", func: func, args: args }), "*");
    }
  };

  const togglePlay = () => { if (isPlaying) sendYouTubeCommand("pauseVideo"); else sendYouTubeCommand("playVideo"); };
  const skipForward = () => sendYouTubeCommand("seekTo", [currentTime + 10, true]);
  const skipBackward = () => sendYouTubeCommand("seekTo", [Math.max(currentTime - 10, 0), true]);
  const toggleSpeed = () => {
    const nextSpeed = playbackRate >= 2 ? 0.5 : playbackRate + 0.5;
    sendYouTubeCommand("setPlaybackRate", [nextSpeed]);
    setPlaybackRate(nextSpeed);
  };
  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    sendYouTubeCommand("seekTo", [time, true]);
  };
  const handleToggleMute = () => { if (isMuted) { sendYouTubeCommand("unMute"); setIsMuted(false); } else { sendYouTubeCommand("mute"); setIsMuted(true); } };
  const handleVolumeDown = () => {
    const newVol = Math.max(volumeLevel - 10, 0);
    setVolumeLevel(newVol);
    sendYouTubeCommand("setVolume", [newVol]);
    if (newVol === 0) { sendYouTubeCommand("mute"); setIsMuted(true); }
  };
  const handleVolumeUp = () => {
    const newVol = Math.min(volumeLevel + 10, 100);
    setVolumeLevel(newVol);
    sendYouTubeCommand("setVolume", [newVol]);
    if (isMuted) { sendYouTubeCommand("unMute"); setIsMuted(false); }
  };
  const toggleFullScreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock("landscape").catch(() => {}); } catch (e) {}
    } else {
      setIsFullscreen(false);
      try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (e) {}
    }
  };

  const formatTime = (timeInSeconds) => {
    if (!timeInSeconds || isNaN(timeInSeconds)) return "0:00";
    const m = Math.floor(timeInSeconds / 60);
    const s = Math.floor(timeInSeconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const uniqueLessons = ['All', ...new Set(videos.map(v => v.lessonName || 'පොදු ප්‍රශ්න පත්‍ර'))];
  const filteredVideos = selectedLesson === 'All' ? videos : videos.filter(v => (v.lessonName || 'පොදු ප්‍රශ්න පත්‍ර') === selectedLesson);

  const bgMain = isDarkMode ? "bg-slate-950 text-slate-100" : "bg-purple-50/30 text-gray-800";
  const bgCard = isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-amber-100 shadow-sm";
  const textMuted = isDarkMode ? "text-slate-400" : "text-gray-500";
  const headerBg = isDarkMode ? "bg-slate-900 border-b border-slate-800" : "bg-white shadow-sm border-b border-gray-200";
  const inputBg = isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-amber-50 border-amber-100 text-amber-900";

  return (
    <div className={`font-sans flex h-screen overflow-hidden transition-colors duration-300 ${bgMain}`}>
      <div className={`fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)}></div>

      <aside className={`w-64 bg-purple-900 text-white flex flex-col fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static transition-transform duration-300 shadow-2xl`}>
        <div onClick={() => router.push('/')} className="p-6 border-b border-purple-800 font-bold text-xl tracking-wider cursor-pointer hover:opacity-80 transition flex items-center gap-2">
          <div className="bg-white text-purple-700 font-bold rounded-lg p-1.5 text-xs">YS</div>
          YCS<span className="text-purple-300">Physics</span>
        </div>      
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/dashboard'); }} className="flex items-center space-x-3 hover:bg-purple-800 px-4 py-3 rounded-lg transition">
            <span className="text-xl">🏠</span><span className="font-medium">මුල් තිරය</span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/videos'); }} className="flex items-center space-x-3 hover:bg-purple-800 px-4 py-3 rounded-lg transition">
            <span className="text-xl">📺</span><span className="font-medium">වීඩියෝ පාඩම්</span>
          </a>
          {/* අලුත් Paper Discussions Tab එක මෙන්න 👇 */}
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/papers'); }} className="flex items-center space-x-3 bg-purple-800 px-4 py-3 rounded-lg transition shadow-inner border border-purple-800/30">
            <span className="text-xl">📝</span><span className="font-bold text-white">ප්‍රශ්න පත්‍ර විවරණ</span>
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
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/settings'); }} className="flex items-center space-x-3 hover:bg-purple-800 px-4 py-3 rounded-lg transition">
            <span className="text-xl">⚙️</span><span className="font-medium">සැකසුම්</span>
          </a>
        </nav>
        <div className="p-4 border-t border-purple-800">
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 hover:bg-red-500 text-purple-200 hover:text-white p-3 rounded-xl transition">
            <div className="w-8 h-8 rounded-full bg-purple-950 flex items-center justify-center text-white font-bold text-sm">
              {userName.charAt(0)}
            </div>
            <span className="font-bold">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        <header className={`${headerBg} p-4 flex justify-between items-center sticky top-0 z-30 transition-colors duration-300`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className={`md:hidden p-2 rounded-lg transition ${isDarkMode ? 'text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}>
              <span className="text-2xl font-bold">☰</span>
            </button>
            <h1 className="text-xl font-extrabold flex items-center gap-2 text-amber-600">
              <span className="text-2xl hidden sm:block">📝</span> ප්‍රශ්න පත්‍ර විවරණ
            </h1>
          </div>
          <div className="flex items-center space-x-4 md:space-x-6">
            <button onClick={toggleTheme} className={`p-2 rounded-full transition-all focus:outline-none ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'}`}>
              {isDarkMode ? <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
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

        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
               <div className={`${bgCard} p-20 text-center flex flex-col items-center justify-center rounded-3xl border`}>
                 <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mb-4"></div>
                 <p className={`${textMuted} font-bold`}>ප්‍රශ්න පත්‍ර පූරණය වෙමින් පවතී...</p>
               </div>
            ) : currentVideo ? (
              <div className="animate-fade-in space-y-4">
                
                <div className={isFullscreen ? "fixed inset-0 z-[99999] bg-black w-screen h-[100dvh] flex flex-col justify-center select-none" : "aspect-video w-full bg-black relative rounded-2xl overflow-hidden shadow-lg select-none"} onContextMenu={(e) => e.preventDefault()}>
                  {isFullscreen && (
                    <button onClick={toggleFullScreen} className="absolute top-4 right-4 z-[1000] bg-white/20 p-2 rounded-full text-white hover:bg-white/40 border border-white/30 backdrop-blur-sm transition-all">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}

                  <div className="relative w-full h-full flex-grow">
                    <div className="absolute top-0 left-0 w-full h-[65px] md:h-[75px] z-[99] bg-black pointer-events-auto flex items-center px-4 md:px-5">
                      <span className="text-white/60 text-xs font-bold truncate max-w-xs md:max-w-md">{currentVideo.title}</span>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-[60px] md:h-[65px] z-[99] bg-black pointer-events-auto flex items-center justify-end px-4 md:px-5">
                      <span className="text-[10px] md:text-xs font-bold text-slate-500/80 mt-2 mr-1">YCS Physics</span>
                    </div>

                    <iframe 
                      ref={playerRef} onLoad={onIframeLoad}
                      className="absolute top-0 left-0 w-full h-full z-0 pointer-events-auto"
                      src={getSecuredVideoUrl(currentVideo.youtubeId)} title={currentVideo.title}
                      frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    ></iframe>
                  </div>
                </div>

                <div className={`p-4 md:p-5 rounded-2xl border shadow-sm flex flex-col gap-4 transition-all ${isDarkMode ? 'bg-slate-800/50 border-amber-900/30' : 'bg-amber-50/30 border-amber-100'}`}>
                  
                  <div className="flex items-center gap-3 w-full">
                    <span className={`text-xs font-bold w-10 text-right ${textMuted}`}>{formatTime(currentTime)}</span>
                    <input type="range" min="0" max={duration || 100} value={currentTime} onChange={handleSeek} style={{ background: `linear-gradient(to right, #dc2626 ${(currentTime / duration) * 100}%, ${isDarkMode ? '#334155' : '#e2e8f0'} ${(currentTime / duration) * 100}%)` }} className="flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-red-600 focus:outline-none" />
                    <span className={`text-xs font-bold w-10 ${textMuted}`}>{formatTime(duration)}</span>
                  </div>

                  <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                    <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                      <div className={`flex items-center rounded-xl border overflow-hidden shadow-sm flex-shrink-0 ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-amber-200'}`}>
                        <button onClick={togglePlay} className={`px-4 py-2.5 md:py-3 transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-amber-400' : 'hover:bg-amber-50 text-amber-700'}`}>{isPlaying ? <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg> : <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>}</button>
                        <button onClick={skipBackward} className={`px-3 py-2.5 md:py-3 transition-colors border-l ${isDarkMode ? 'hover:bg-slate-700 border-slate-600 text-slate-300' : 'hover:bg-amber-50 border-amber-200 text-slate-700'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" /></svg></button>
                        <button onClick={skipForward} className={`px-3 py-2.5 md:py-3 transition-colors border-l ${isDarkMode ? 'hover:bg-slate-700 border-slate-600 text-slate-300' : 'hover:bg-amber-50 border-amber-200 text-slate-700'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.334-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.334-4z" /></svg></button>
                      </div>
                      <button onClick={toggleSpeed} className={`px-4 py-2.5 md:py-3 rounded-xl border font-bold text-sm transition-colors shadow-sm flex-shrink-0 ${isDarkMode ? 'bg-slate-800 border-slate-600 text-red-400 hover:bg-slate-700' : 'bg-white border-amber-200 text-red-600 hover:bg-amber-50'}`}>{playbackRate}x Speed</button>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                      <div className={`flex items-center rounded-xl border overflow-hidden shadow-sm flex-shrink-0 ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-amber-200'}`}>
                        <button onClick={handleVolumeDown} className={`px-3 py-2.5 md:py-3 transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-amber-50 text-slate-700'}`}><svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 12H6" /></svg></button>
                        <button onClick={handleToggleMute} className={`px-3 py-2.5 md:py-3 transition-colors border-x ${isDarkMode ? 'hover:bg-slate-700 border-slate-600' : 'hover:bg-amber-50 border-amber-200'}`}>{isMuted ? <svg className="w-4 h-4 md:w-5 md:h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg> : <svg className="w-4 h-4 md:w-5 md:h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>}</button>
                        <button onClick={handleVolumeUp} className={`px-3 py-2.5 md:py-3 transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-amber-50 text-slate-700'}`}><svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg></button>
                      </div>

                      <button onClick={toggleFullScreen} className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 md:px-5 md:py-3 text-xs md:text-sm font-bold transition-all shadow-sm flex-shrink-0 ${isDarkMode ? 'bg-slate-800 border-slate-600 text-white hover:bg-slate-700' : 'bg-white border-amber-200 text-slate-800 hover:bg-amber-50'}`}>
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                        Full Screen
                      </button>

                      {currentVideo.tuteUrl ? (
                        <a href={getDownloadUrl(currentVideo.tuteUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-2.5 md:px-5 md:py-3 text-xs md:text-sm font-bold transition-all shadow-sm flex-shrink-0">
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 16l-5-5h3V4h4v7h3l-5 5zm9-2v6H3v-6H1v8h22v-8h-2z"/></svg>
                          Paper (PDF)
                        </a>
                      ) : (
                        <button disabled className={`flex items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-2.5 md:px-5 md:py-3 text-xs md:text-sm font-bold cursor-not-allowed flex-shrink-0 ${isDarkMode ? 'border-slate-700 text-slate-500' : 'border-gray-300 text-gray-400'}`}>
                          ⏳ PDF පසුවට
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border ${bgCard}`}>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="inline-block text-xs px-3 py-1 rounded-full font-bold bg-amber-600 text-white uppercase tracking-wider">
                      {currentVideo.category || 'Paper'}
                    </span>
                    {currentVideo.lessonName && (
                      <span className={`text-xs px-3 py-1 rounded-md font-bold ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-amber-100 text-amber-800'}`}>
                        📁 {currentVideo.lessonName}
                      </span>
                    )}
                  </div>
                  <h2 className={`text-xl md:text-2xl font-black leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{currentVideo.title}</h2>
                </div>

              </div>
            ) : (
              <div className={`${bgCard} border p-20 text-center rounded-3xl`}>
                <span className="text-6xl block mb-4 opacity-50">📭</span>
                <h3 className="text-xl font-bold mb-2">ප්‍රශ්න පත්‍ර කිසිවක් නැත</h3>
                <p className={textMuted}>ඔබේ පන්තියට ({userYear}) අදාළව දැනට ප්‍රශ්න පත්‍ර කිසිවක් පද්ධතියට එක් කර නොමැත.</p>
              </div>
            )}
          </div>

          {/* Right Column: Playlist */}
          {videos.length > 0 && (
            <div className="space-y-6">
              
              <div className={`${bgCard} border p-4 rounded-2xl`}>
                <label className="block text-xs font-black uppercase tracking-wider mb-2 text-amber-600">🔖 ප්‍රශ්න පත්‍ර වර්ෂය/කාණ්ඩය</label>
                <select 
                  value={selectedLesson} 
                  onChange={(e) => setSelectedLesson(e.target.value)}
                  className={`w-full rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500/30 transition border ${inputBg}`}
                >
                  {uniqueLessons.map((lesson, index) => (
                    <option key={index} value={lesson}>
                      {lesson === 'All' ? '📚 සියලුම ප්‍රශ්න පත්‍ර' : `📁 ${lesson}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className={`${bgCard} border p-5 rounded-3xl h-fit max-h-[70vh] flex flex-col`}>
                <h3 className="text-base font-black mb-4 border-b pb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2"><span>📝</span> ලැයිස්තුව</span>
                  <span className="bg-amber-100 text-amber-800 text-xs font-extrabold px-2.5 py-1 rounded-md">{filteredVideos.length}</span>
                </h3>
                
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                  {filteredVideos.map((video) => (
                    <div 
                      key={video._id} 
                      onClick={() => setCurrentVideo(video)}
                      className={`flex gap-3 p-2.5 rounded-2xl cursor-pointer transition border ${
                        currentVideo?._id === video._id 
                          ? 'bg-amber-500/10 border-amber-400 shadow-sm text-amber-600 font-bold' 
                          : 'border-transparent hover:bg-amber-50/50 hover:border-amber-100/50'
                      }`}
                    >
                      <div className="w-28 h-16 bg-slate-800 rounded-xl overflow-hidden flex-shrink-0 relative shadow-sm">
                        <img 
                          src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`} 
                          alt="thumbnail" 
                          className="w-full h-full object-cover opacity-80" 
                        />
                        {currentVideo?._id === video._id && (
                          <div className="absolute inset-0 bg-amber-600/70 flex items-center justify-center backdrop-blur-[1px]">
                            <span className="text-white text-base">▶</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 py-0.5 flex flex-col justify-center">
                        <h4 className={`text-xs line-clamp-2 leading-tight ${currentVideo?._id === video._id ? 'text-amber-600 font-black' : ''}`}>
                          {video.title}
                        </h4>
                        <span className={`text-[10px] mt-1.5 font-bold px-2 py-0.5 rounded-md w-fit border ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-gray-50 border-gray-100 text-gray-500'
                        }`}>
                          {video.category || 'Paper'}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {filteredVideos.length === 0 && (
                    <p className={`text-center text-xs italic py-8 ${textMuted}`}>මෙම කාණ්ඩය යටතේ ප්‍රශ්න පත්‍ර නොමැත.</p>
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