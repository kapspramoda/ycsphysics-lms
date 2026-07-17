"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function DashboardPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userName, setUserName] = useState('');
  const [alYear, setAlYear] = useState('');
  const [center, setCenter] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [avatar, setAvatar] = useState(null); 
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');

  // අලුත් Notification State
  const [systemNotification, setSystemNotification] = useState(null);

  const [chartLabels, setChartLabels] = useState(['දත්ත නැත']);
  const [chartScores, setChartScores] = useState([0]);
  const [averageMark, setAverageMark] = useState(0);

  const [onlineLabels, setOnlineLabels] = useState(['දත්ත නැත']);
  const [onlineScores, setOnlineScores] = useState([0]);
  const [onlineAverage, setOnlineAverage] = useState(0);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') setIsDarkMode(true);

    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/auth');
    } else {
      const userObj = JSON.parse(storedUser);
      setUserName(userObj.name);
      setAlYear(userObj.alYear || '');
      setCenter(userObj.center || '');
      setIsAuthorized(true);

      const storedAvatar = localStorage.getItem('userAvatar');
      if (storedAvatar) setAvatar(storedAvatar);

      const storedTodos = localStorage.getItem('userTodos');
      if (storedTodos) setTodos(JSON.parse(storedTodos));

      // Fetch Notification
      const fetchNotification = async () => {
        try {
          const res = await fetch(`/api/notifications?year=${userObj.alYear || 'All'}`);
          const data = await res.json();
          if(data.notification) setSystemNotification(data.notification.message);
        } catch(e) {}
      };
      fetchNotification();

      const fetchMarks = async () => {
        try {
          const response = await fetch(`/api/marks?email=${userObj.email || userObj.username}`);
          const data = await response.json();
          if (data.marks && data.marks.length > 0) {
            const physical = data.marks.filter(m => m.examType !== 'Online');
            if (physical.length > 0) {
              setChartLabels(physical.map(m => m.paperName));
              const pScores = physical.map(m => m.score);
              setChartScores(pScores);
              setAverageMark(Math.round(pScores.reduce((sum, mark) => sum + mark, 0) / pScores.length));
            }
            const online = data.marks.filter(m => m.examType === 'Online');
            if (online.length > 0) {
              setOnlineLabels(online.map(m => m.paperName));
              const oScores = online.map(m => m.score);
              setOnlineScores(oScores);
              setOnlineAverage(Math.round(oScores.reduce((sum, mark) => sum + mark, 0) / oScores.length));
            }
          }
        } catch (error) { console.error(error); }
      };
      fetchMarks();
    }
  }, [router]);

  useEffect(() => {
    if (isAuthorized) localStorage.setItem('userTodos', JSON.stringify(todos));
  }, [todos, isAuthorized]);

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

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (newTodo.trim() === '') return;
    setTodos([...todos, { id: Date.now(), text: newTodo, completed: false }]);
    setNewTodo('');
  };
  
  const toggleTodo = (id) => setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  const deleteTodo = (id) => setTodos(todos.filter(todo => todo.id !== id));

  const bgMain = isDarkMode ? "bg-slate-950 text-slate-100" : "bg-purple-50/30 text-gray-800";
  const bgCard = isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-purple-100";
  const textMuted = isDarkMode ? "text-slate-400" : "text-gray-500";
  const headerBg = isDarkMode ? "bg-slate-900 border-b border-slate-800" : "bg-white shadow-sm";

  const chartData = {
    labels: chartLabels,
    datasets: [{
      label: 'ලකුණු (%)', data: chartScores, borderColor: '#9333EA', 
      backgroundColor: isDarkMode ? 'rgba(147, 51, 234, 0.2)' : 'rgba(147, 51, 234, 0.1)',
      borderWidth: 2, pointBackgroundColor: '#FACC15', fill: true, tension: 0.4
    }]
  };

  const onlineChartData = {
    labels: onlineLabels,
    datasets: [{
      label: 'Online ලකුණු (%)', data: onlineScores, borderColor: '#10B981', 
      backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
      borderWidth: 2, pointBackgroundColor: '#FACC15', fill: true, tension: 0.4
    }]
  };

  if (!isAuthorized) return <div className={`min-h-screen flex items-center justify-center font-bold tracking-widest ${isDarkMode ? 'bg-slate-900 text-purple-400' : 'bg-gray-50 text-purple-600'}`}>Loading...</div>;

  return (
    <div className={`font-sans flex h-screen overflow-hidden transition-colors duration-300 ${bgMain}`}>
      
      <div className={`fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)}></div>

      <aside className={`w-64 bg-purple-900 text-white flex flex-col fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static transition-transform duration-300 shadow-xl shadow-purple-900/20`}>
        <div onClick={() => router.push('/')} className="p-6 border-b border-purple-800 font-bold text-xl tracking-wider cursor-pointer hover:opacity-80 transition flex items-center gap-2">
          <div className="bg-white text-purple-700 font-bold rounded-lg p-1.5 text-xs">YS</div>
          YCS<span className="text-purple-300">Physics</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/dashboard'); }} className="flex items-center space-x-3 bg-purple-800 text-white px-4 py-3 rounded-xl transition shadow-inner">
            <span className="text-xl">🏠</span><span className="font-bold">මුල් තිරය</span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/videos'); }} className="flex items-center space-x-3 hover:bg-purple-800/80 text-purple-200 hover:text-white px-4 py-3 rounded-xl transition">
            <span className="text-xl">📺</span><span className="font-medium">වීඩියෝ පාඩම්</span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/simulation'); }} className="flex items-center space-x-3 hover:bg-purple-800/80 text-purple-200 hover:text-white px-4 py-3 rounded-xl transition">
            <span className="text-xl">🧪</span><span className="font-medium">Simulations</span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/exam'); }} className="flex items-center space-x-3 hover:bg-purple-800/80 text-purple-200 hover:text-white px-4 py-3 rounded-xl transition">
            <span className="text-xl">💻</span><span className="font-medium">Online විභාග</span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/tutes'); }} className="flex items-center space-x-3 hover:bg-purple-800/80 text-purple-200 hover:text-white px-4 py-3 rounded-xl transition">
            <span className="text-xl">📚</span><span className="font-medium">නිබන්ධන</span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/marking'); }} className="flex items-center space-x-3 hover:bg-purple-800/80 text-purple-200 hover:text-white px-4 py-3 rounded-xl transition">
            <span className="text-xl">✅</span><span className="font-medium">Marking Schemes</span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/dashboard/marks'); }} className="flex items-center space-x-3 hover:bg-purple-800/80 text-purple-200 hover:text-white px-4 py-3 rounded-xl transition">
            <span className="text-xl">📊</span><span className="font-medium">ප්‍රගති වාර්තාව</span>
          </a>
          
          <div className="pt-4 border-t border-purple-800 mt-4 mb-2"></div>

          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/notifications'); }} className="flex items-center space-x-3 hover:bg-purple-800/80 text-purple-200 hover:text-white px-4 py-3 rounded-xl transition">
            <span className="text-xl">🔔</span><span className="font-medium">දැනුම්දීම්</span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/settings'); }} className="flex items-center space-x-3 hover:bg-purple-800/80 text-purple-200 hover:text-white px-4 py-3 rounded-xl transition">
            <span className="text-xl">⚙️</span><span className="font-medium">සැකසුම්</span>
          </a>
        </nav>
        <div className="p-4 border-t border-purple-800">
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 hover:bg-red-500 text-purple-200 hover:text-white p-3 rounded-xl transition border border-transparent hover:border-red-500/30"><span>🚪</span><span className="font-bold">Logout</span></button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className={`${headerBg} p-4 flex justify-between items-center sticky top-0 z-30 transition-colors duration-300`}>
          <button onClick={() => setIsSidebarOpen(true)} className={`md:hidden p-2 ${isDarkMode ? 'text-white' : 'text-gray-600'}`}><span className="text-2xl">☰</span></button>
          <div className={`hidden md:block font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>A/L Physics අඛණ්ඩ අධ්‍යයන පද්ධතිය</div>
          
          <div className="flex items-center space-x-4 md:space-x-6">
            <button onClick={toggleTheme} className={`p-2 rounded-full transition-all focus:outline-none ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'}`}>
              {isDarkMode ? <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
            </button>

            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="font-bold text-sm">{userName}</p>
                <p className="text-xs text-green-500 font-bold">{alYear} {center ? `| ${center}` : 'Online'}</p>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-purple-500 overflow-hidden bg-purple-100 flex items-center justify-center font-bold text-purple-600">
                {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : userName.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto w-full">
          
          {/* අලුතින් එක් කළ System Notification Banner එක */}
          {systemNotification && (
            <div className="bg-amber-100 dark:bg-amber-900/40 border-l-8 border-amber-500 p-4 md:p-5 rounded-r-2xl shadow-sm flex items-start gap-4 animate-fade-in">
              <span className="text-3xl mt-1">📢</span>
              <div>
                <h4 className="text-amber-800 dark:text-amber-400 font-extrabold text-sm md:text-base mb-1">විශේෂ පණිවිඩයයි</h4>
                <p className="text-amber-900/80 dark:text-amber-200 text-sm font-bold whitespace-pre-wrap">{systemNotification}</p>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-r from-purple-700 to-fuchsia-600 rounded-3xl p-8 md:p-10 text-white shadow-lg shadow-purple-900/20 relative overflow-hidden mt-2">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">ආයුබෝවන් {userName.split(' ')[0]}! 👋</h2>
              
              <div className="mt-4 mb-2 inline-block">
                <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs px-4 py-1.5 rounded-full font-bold shadow-sm tracking-wide">
                  🎓 {alYear} A/L Student {center && `| 🏛️ ${center} Center`}
                </span>
              </div>
              
              <p className="text-purple-100 mt-2 md:text-lg font-medium">දවසේ ඔබේ අධ්‍යයන කටයුතු සැලසුම් කරමු.</p>
            </div>
            <span className="absolute right-10 bottom-0 text-9xl opacity-10 hidden sm:block mix-blend-overlay">⚛️</span>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            
            <div onClick={() => router.push('/videos')} className={`${bgCard} p-6 rounded-2xl shadow-sm border border-t-4 border-t-red-500 hover:shadow-lg transition duration-300 transform hover:-translate-y-1 cursor-pointer group flex flex-col items-center text-center`}>
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition duration-300">📺</div>
              <h3 className="text-lg font-bold mb-1 group-hover:text-red-500 transition">වීඩියෝ පාඩම්</h3>
              <p className={`text-xs ${textMuted}`}>සිද්ධාන්ත සහ පුනරීක්ෂණ</p>
            </div>

            <div onClick={() => router.push('/exam')} className={`${bgCard} p-6 rounded-2xl shadow-sm border border-t-4 border-t-purple-500 hover:shadow-lg transition duration-300 transform hover:-translate-y-1 cursor-pointer group flex flex-col items-center text-center`}>
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition duration-300">💻</div>
              <h3 className="text-lg font-bold mb-1 group-hover:text-purple-500 transition">Online විභාග</h3>
              <p className={`text-xs ${textMuted}`}>MCQ ප්‍රශ්න පත්‍ර</p>
            </div>

            <div onClick={() => router.push('/tutes')} className={`${bgCard} p-6 rounded-2xl shadow-sm border border-t-4 border-t-green-500 hover:shadow-lg transition duration-300 transform hover:-translate-y-1 cursor-pointer group flex flex-col items-center text-center`}>
              <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition duration-300">📚</div>
              <h3 className="text-lg font-bold mb-1 group-hover:text-green-500 transition">නිබන්ධන</h3>
              <p className={`text-xs ${textMuted}`}>PDF බාගත කරගන්න</p>
            </div>

            <div onClick={() => router.push('/marking')} className={`${bgCard} p-6 rounded-2xl shadow-sm border border-t-4 border-t-fuchsia-500 hover:shadow-lg transition duration-300 transform hover:-translate-y-1 cursor-pointer group flex flex-col items-center text-center`}>
              <div className="w-14 h-14 bg-fuchsia-50 text-fuchsia-600 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition duration-300">✅</div>
              <h3 className="text-lg font-bold mb-1 group-hover:text-fuchsia-500 transition">Marking</h3>
              <p className={`text-xs ${textMuted}`}>ලකුණු දීමේ පටිපාටිය</p>
            </div>
            
            <div onClick={() => router.push('/dashboard/marks')} className={`${bgCard} p-6 rounded-2xl shadow-sm border border-t-4 border-t-amber-500 hover:shadow-lg transition duration-300 transform hover:-translate-y-1 cursor-pointer group flex flex-col items-center text-center lg:col-span-1 sm:col-span-2`}>
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition duration-300 relative">
                 📊<span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white"></span>
              </div>
              <h3 className="text-lg font-bold mb-1 group-hover:text-amber-500 transition">ප්‍රගති වාර්තාව</h3>
              <p className={`text-xs ${textMuted}`}>මගේ ලකුණු සහ ප්‍රස්ථාර</p>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${bgCard} p-6 rounded-2xl shadow-sm border hover:shadow-md transition`}>
              <div className={`flex justify-between items-start mb-6 border-b pb-4 ${isDarkMode ? 'border-slate-800' : 'border-purple-50'}`}>
                <div>
                  <h3 className="text-xl font-bold flex items-center"><span className="mr-2 text-purple-600">🏛️</span> පන්ති කාමරයේ ලකුණු</h3>
                  <p className={`text-sm mt-2 ${textMuted}`}>සාමාන්‍යය: <span className="bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-md font-bold">{averageMark}%</span></p>
                </div>
              </div>
              <div className="h-48 w-full"><Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { display: true, grid: { display: false } } } }} /></div>
            </div>

            <div className={`${bgCard} p-6 rounded-2xl shadow-sm border hover:shadow-md transition`}>
              <div className={`flex justify-between items-start mb-6 border-b pb-4 ${isDarkMode ? 'border-slate-800' : 'border-purple-50'}`}>
                <div>
                  <h3 className="text-xl font-bold flex items-center"><span className="mr-2 text-green-600">🌐</span> Online ලකුණු</h3>
                  <p className={`text-sm mt-2 ${textMuted}`}>සාමාන්‍යය: <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-md font-bold">{onlineAverage}%</span></p>
                </div>
              </div>
              <div className="h-48 w-full"><Line data={onlineChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { display: true, grid: { display: false } } } }} /></div>
            </div>
          </div>

          <div className={`${bgCard} rounded-2xl shadow-sm border p-8`}>
            <h3 className={`text-xl font-bold mb-6 flex items-center border-b pb-4 ${isDarkMode ? 'border-slate-800' : 'border-purple-50'}`}><span className="mr-2 text-2xl">🎯</span> මගේ වැඩ සැලැස්ම (Study Planner)</h3>
            <form onSubmit={handleAddTodo} className="flex flex-col sm:flex-row gap-3 mb-8">
              <input type="text" value={newTodo} onChange={(e) => setNewTodo(e.target.value)} placeholder="අද දවසේ කළ යුතු වැඩක්..." className={`flex-1 px-5 py-3 rounded-xl border outline-none transition focus:ring-2 focus:ring-purple-500/30 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-purple-500' : 'bg-purple-50/50 border-purple-100 focus:border-purple-500 focus:bg-white'}`} />
              <button type="submit" className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white font-bold px-8 py-3 rounded-xl transition shadow-md">එකතු කරන්න</button>
            </form>
            <div className="space-y-3">
              {todos.map(todo => (
                <div key={todo.id} className={`flex justify-between items-center p-4 rounded-xl border transition ${todo.completed ? (isDarkMode ? 'bg-slate-900 border-slate-800 opacity-60' : 'bg-gray-50 border-gray-200 opacity-70') : (isDarkMode ? 'bg-slate-800 border-purple-900/50 shadow-sm' : 'bg-white border-purple-100 shadow-sm')}`}>
                  <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => toggleTodo(todo.id)}>
                    <input type="checkbox" checked={todo.completed} onChange={() => {}} className="w-5 h-5 accent-purple-600 cursor-pointer rounded" />
                    <span className={`text-lg ${todo.completed ? (isDarkMode ? 'line-through text-slate-500' : 'line-through text-gray-400') : (isDarkMode ? 'font-medium text-slate-200' : 'font-medium text-gray-800')}`}>{todo.text}</span>
                  </div>
                  <button onClick={() => deleteTodo(todo.id)} className={`p-2 rounded-lg transition text-lg ${isDarkMode ? 'text-slate-500 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}>🗑️</button>
                </div>
              ))}
              {todos.length === 0 && <p className={`text-center italic py-4 ${textMuted}`}>තවමත් වැඩ සැලසුම් කර නොමැත.</p>}
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}