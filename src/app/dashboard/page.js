"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function DashboardPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // --- අලුතින් එකතු කළ States ---
  const [userName, setUserName] = useState('');
  const [alYear, setAlYear] = useState('');
  const [center, setCenter] = useState('');
  
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [avatar, setAvatar] = useState(null); 

  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // --- Physical Marks States ---
  const [chartLabels, setChartLabels] = useState(['දත්ත නැත']);
  const [chartScores, setChartScores] = useState([0]);
  const [averageMark, setAverageMark] = useState(0);

  // --- Online Marks States ---
  const [onlineLabels, setOnlineLabels] = useState(['දත්ත නැත']);
  const [onlineScores, setOnlineScores] = useState([0]);
  const [onlineAverage, setOnlineAverage] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/auth');
    } else {
      const userObj = JSON.parse(storedUser);
      setUserName(userObj.name);
      
      // --- අලුතින් LocalStorage එකෙන් දත්ත ගැනීම ---
      setAlYear(userObj.alYear || '');
      setCenter(userObj.center || '');
      
      setIsAuthorized(true);

      const storedAvatar = localStorage.getItem('userAvatar');
      if (storedAvatar) setAvatar(storedAvatar);

      const storedTodos = localStorage.getItem('userTodos');
      if (storedTodos) setTodos(JSON.parse(storedTodos));

      const fetchMarks = async () => {
        try {
          const response = await fetch(`/api/marks?email=${userObj.email || userObj.username}`);
          const data = await response.json();
          if (data.marks && data.marks.length > 0) {
            
            // 1. Physical Marks වෙන් කිරීම
            const physical = data.marks.filter(m => m.examType !== 'Online');
            if (physical.length > 0) {
              setChartLabels(physical.map(m => m.paperName));
              const pScores = physical.map(m => m.score);
              setChartScores(pScores);
              setAverageMark(Math.round(pScores.reduce((sum, mark) => sum + mark, 0) / pScores.length));
            }

            // 2. Online Marks වෙන් කිරීම
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

  // --- Physical Chart Data ---
  const chartData = {
    labels: chartLabels,
    datasets: [{
      label: 'ලකුණු (%)',
      data: chartScores,
      borderColor: '#2563EB',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      borderWidth: 2,
      pointBackgroundColor: '#FACC15',
      fill: true,
      tension: 0.4
    }]
  };

  // --- Online Chart Data ---
  const onlineChartData = {
    labels: onlineLabels,
    datasets: [{
      label: 'Online ලකුණු (%)',
      data: onlineScores,
      borderColor: '#10B981', 
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderWidth: 2,
      pointBackgroundColor: '#FACC15',
      fill: true,
      tension: 0.4
    }]
  };

  if (!isAuthorized) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-blue-600 tracking-widest">Loading...</div>;

  return (
    <div className="bg-gray-50 font-sans text-gray-800 flex h-screen overflow-hidden">
      
      <div className={`fixed inset-0 bg-black/50 z-40 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setIsSidebarOpen(false)}></div>

      <aside className={`w-64 bg-blue-900 text-white flex flex-col fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static transition-transform duration-300`}>
        <div 
          onClick={() => router.push('/')} 
          className="p-6 border-b border-blue-800 font-bold text-xl tracking-wider cursor-pointer hover:opacity-80 transition"
            >
            YCS<span className="text-blue-300">Physics</span>
            </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/dashboard'); }} className="flex items-center space-x-3 hover:bg-blue-800 px-4 py-3 rounded-lg transition">
            <span className="text-xl">🏠</span><span className="font-medium">මුල් තිරය</span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/videos'); }} className="flex items-center space-x-3 hover:bg-blue-800 px-4 py-3 rounded-lg transition">
            <span className="text-xl">📺</span><span className="font-medium">වීඩියෝ පාඩම්</span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/simulation'); }} className="flex items-center space-x-3 hover:bg-blue-800 px-4 py-3 rounded-lg transition">
            <span className="text-xl">🧪</span><span className="font-medium">Simulations</span>
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
          
          <div className="pt-4 border-t border-blue-800/50 mt-4 mb-2"></div>

          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/notifications'); }} className="flex items-center space-x-3 hover:bg-blue-800 px-4 py-3 rounded-lg transition">
            <span className="text-xl">🔔</span><span className="font-medium">දැනුම්දීම්</span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/settings'); }} className="flex items-center space-x-3 hover:bg-blue-800 px-4 py-3 rounded-lg transition">
            <span className="text-xl">⚙️</span><span className="font-medium">සැකසුම්</span>
          </a>
        </nav>
        <div className="p-4 border-t border-blue-800">
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 hover:bg-red-500 p-3 rounded-lg transition text-blue-200 hover:text-white"><span>🚪</span><span>Logout</span></button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-gray-600"><span className="text-2xl">☰</span></button>
          <div className="hidden md:block text-gray-400 font-medium">A/L Physics අඛණ්ඩ අධ්‍යයන පද්ධතිය</div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="font-bold text-sm">{userName}</p>
                {/* --- මෙතනත් Batch එක සහ Center එක පේන්න හැදුවා --- */}
                <p className="text-xs text-green-500 font-bold">{alYear} {center ? `| ${center}` : 'Online'}</p>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-blue-500 overflow-hidden bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : userName.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-10 space-y-10 max-w-7xl mx-auto w-full">
          
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-3xl p-8 md:p-10 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold">ආයුබෝවන් {userName.split(' ')[0]}! 👋</h2>
              
              {/* --- මෙන්න මෙතන ලස්සන Badge එකක් විදිහට එකතු කළා --- */}
              <div className="mt-3 mb-2 inline-block">
                <span className="bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs px-4 py-1.5 rounded-full font-bold shadow-sm tracking-wide">
                  🎓 {alYear} A/L Student {center && `| 🏛️ ${center} Center`}
                </span>
              </div>
              
              <p className="text-blue-100 mt-2 md:text-lg">දවසේ ඔබේ අධ්‍යයන කටයුතු සැලසුම් කරමු.</p>
            </div>
            <span className="absolute right-10 bottom-0 text-9xl opacity-10 hidden sm:block">👨‍🔬</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            
            <div onClick={() => router.push('/videos')} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-t-4 border-t-red-500 hover:shadow-lg transition duration-300 transform hover:-translate-y-1 cursor-pointer group flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition duration-300">📺</div>
              <h3 className="text-lg font-bold mb-1 group-hover:text-red-600 transition">වීඩියෝ පාඩම්</h3>
              <p className="text-gray-500 text-xs">සිද්ධාන්ත සහ පුනරීක්ෂණ</p>
            </div>

            <div onClick={() => router.push('/exam')} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-t-4 border-t-blue-500 hover:shadow-lg transition duration-300 transform hover:-translate-y-1 cursor-pointer group flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition duration-300">💻</div>
              <h3 className="text-lg font-bold mb-1 group-hover:text-blue-600 transition">Online විභාග</h3>
              <p className="text-gray-500 text-xs">MCQ ප්‍රශ්න පත්‍ර</p>
            </div>

            <div onClick={() => router.push('/tutes')} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-t-4 border-t-green-500 hover:shadow-lg transition duration-300 transform hover:-translate-y-1 cursor-pointer group flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition duration-300">📚</div>
              <h3 className="text-lg font-bold mb-1 group-hover:text-green-600 transition">නිබන්ධන</h3>
              <p className="text-gray-500 text-xs">PDF බාගත කරගන්න</p>
            </div>

            <div onClick={() => router.push('/marking')} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-t-4 border-t-purple-500 hover:shadow-lg transition duration-300 transform hover:-translate-y-1 cursor-pointer group flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition duration-300">✅</div>
              <h3 className="text-lg font-bold mb-1 group-hover:text-purple-600 transition">Marking</h3>
              <p className="text-gray-500 text-xs">ලකුණු දීමේ පටිපාටිය</p>
            </div>
            
            <div onClick={() => router.push('/dashboard/marks')} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-t-4 border-t-amber-500 hover:shadow-lg transition duration-300 transform hover:-translate-y-1 cursor-pointer group flex flex-col items-center text-center lg:col-span-1 sm:col-span-2">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition duration-300 relative">
                 📊
                 <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white"></span>
              </div>
              <h3 className="text-lg font-bold mb-1 group-hover:text-amber-600 transition">ප්‍රගති වාර්තාව</h3>
              <p className="text-gray-500 text-xs">මගේ ලකුණු සහ ප්‍රස්ථාර</p>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-md transition">
              <div className="flex justify-between items-start mb-6 border-b pb-4">
                <div>
                  <h3 className="text-xl font-bold flex items-center"><span className="mr-2 text-blue-600">🏛️</span> පන්ති කාමරයේ ලකුණු</h3>
                  <p className="text-gray-500 text-sm mt-1">සාමාන්‍යය: <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">{averageMark}%</span></p>
                </div>
              </div>
              <div className="h-48 w-full">
                <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { display: true, grid: { display: false } } } }} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-md transition">
              <div className="flex justify-between items-start mb-6 border-b pb-4">
                <div>
                  <h3 className="text-xl font-bold flex items-center"><span className="mr-2 text-green-600">🌐</span> Online ලකුණු</h3>
                  <p className="text-gray-500 text-sm mt-1">සාමාන්‍යය: <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded font-bold">{onlineAverage}%</span></p>
                </div>
              </div>
              <div className="h-48 w-full">
                <Line data={onlineChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { display: true, grid: { display: false } } } }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center border-b pb-4"><span className="mr-2 text-2xl">🎯</span> මගේ වැඩ සැලැස්ම (Study Planner)</h3>
            <form onSubmit={handleAddTodo} className="flex flex-col sm:flex-row gap-3 mb-8">
              <input type="text" value={newTodo} onChange={(e) => setNewTodo(e.target.value)} placeholder="අද දවසේ කළ යුතු වැඩක්..." className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border focus:border-blue-500 outline-none transition" />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition shadow-md">එකතු කරන්න</button>
            </form>
            <div className="space-y-3">
              {todos.map(todo => (
                <div key={todo.id} className={`flex justify-between items-center p-4 rounded-xl border transition ${todo.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-blue-100 shadow-sm'}`}>
                  <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => toggleTodo(todo.id)}>
                    <input type="checkbox" checked={todo.completed} onChange={() => {}} className="w-5 h-5 accent-blue-600 cursor-pointer" />
                    <span className={`text-lg ${todo.completed ? 'line-through text-gray-400' : 'font-medium text-gray-800'}`}>{todo.text}</span>
                  </div>
                  <button onClick={() => deleteTodo(todo.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition text-lg">🗑️</button>
                </div>
              ))}
              {todos.length === 0 && <p className="text-center text-gray-400 italic py-4">තවමත් වැඩ සැලසුම් කර නොමැත.</p>}
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}