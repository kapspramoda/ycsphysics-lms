"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminAttendancePage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // --- Dark Mode State ---
  const [isDarkMode, setIsDarkMode] = useState(false);

  const today = new Date().toISOString().split('T')[0]; 
  const currentMonth = today.substring(0, 7); 

  const [formData, setFormData] = useState({ date: today, alYear: '2026', email: '', status: 'Present', note: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  
  const [allStudents, setAllStudents] = useState([]); 
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  
  // Table View States
  const [viewMonth, setViewMonth] = useState(currentMonth); 
  const [selectedYearView, setSelectedYearView] = useState('2026'); 
  const [selectedCenterView, setSelectedCenterView] = useState(''); // මධ්‍යස්ථානය තේරීමට

  // Quick Mark States
  const [quickMarkDate, setQuickMarkDate] = useState(today);
  const [quickMarkNote, setQuickMarkNote] = useState('');

  // 1. Load Data
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') setIsDarkMode(true);

    const adminToken = localStorage.getItem('isAdminLoggedIn');
    if (!adminToken) {
      router.push('/admin/login');
    } else {
      setIsAuthorized(true);
      const fetchAllStudents = async () => {
        try {
          const res = await fetch('/api/users?year=All', { cache: 'no-store' });
          const data = await res.json();
          if (data.users) setAllStudents(data.users);
        } catch (error) { console.error(error); }
      };
      fetchAllStudents();
    }
  }, [router]);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const fetchAttendance = async () => {
    try {
      const res = await fetch(`/api/attendance?month=${viewMonth}&year=${selectedYearView}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.records) setAttendanceRecords(data.records);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    if (isAuthorized) fetchAttendance(); 
  }, [viewMonth, selectedYearView, isAuthorized]);

  // --- Data Calculations ---
  // පද්ධතියේ ඇති සියලුම මධ්‍යස්ථාන ලැයිස්තුව (Form එකේ Datalist එකට)
  const allUniqueCenters = [...new Set(allStudents.map(s => s.center || 'Online'))];
  
  // තෝරාගත් වර්ෂයේ ඉන්න සිසුන් සහ මධ්‍යස්ථාන
  const studentsInYear = allStudents.filter(s => s.alYear === selectedYearView);
  const uniqueCentersInYear = [...new Set(studentsInYear.map(s => s.center || 'Online'))];

  // අදාළ වර්ෂයේ දැනට තෝරාගෙන ඇති මධ්‍යස්ථානය නිවැරදි කිරීම
  const activeCenter = uniqueCentersInYear.includes(selectedCenterView) ? selectedCenterView : (uniqueCentersInYear[0] || '');

  // වර්ෂය හෝ මධ්‍යස්ථානය වෙනස් වූ විට Quick Mark Note එක Auto වෙනස් වීම
  useEffect(() => {
    setQuickMarkNote(activeCenter);
  }, [activeCenter]);

  // Table එක සඳහා තෝරාගත් වර්ෂයේ සහ මධ්‍යස්ථානයේ සිසුන් පමණක් පෙරීම
  const centerStudents = studentsInYear.filter(s => (s.center || 'Online') === activeCenter);
  
  const currentYearStudents = allStudents.filter(s => s.alYear === formData.alYear);

  // --- Actions ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setMsg({ type: 'error', text: 'කරුණාකර සිසුවෙකු තෝරන්න.' });
      return;
    }
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMsg({ type: 'success', text: 'පැමිණීම සටහන් කළා! ✅' });
        const currentIndex = currentYearStudents.findIndex(s => s.email === formData.email);
        if (currentIndex !== -1 && currentIndex < currentYearStudents.length - 1) {
          setFormData(prev => ({ ...prev, email: currentYearStudents[currentIndex + 1].email }));
        }
        fetchAttendance();
      } else { throw new Error('අසාර්ථකයි.'); }
    } catch (error) {
      setMsg({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
      setTimeout(() => setMsg({ type: '', text: '' }), 2000);
    }
  };

  const handleQuickMark = async (email, status) => {
    try {
      await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          date: quickMarkDate, 
          alYear: selectedYearView, 
          email: email, 
          status: status, 
          note: quickMarkNote // Auto-filled center name
        }),
      });
      fetchAttendance(); 
    } catch (error) { console.error("Quick mark error:", error); }
  };

  const handleDelete = async (id) => {
    if (confirm('මෙම සටහන මකා දැමීමට අවශ්‍යද?')) {
      await fetch('/api/attendance', { method: 'DELETE', body: JSON.stringify({ id }) });
      fetchAttendance();
    }
  };

  const uniqueDates = [...new Set(attendanceRecords.map(r => r.date))].sort();
  const attendanceMap = {};
  const dateNotes = {}; 

  attendanceRecords.forEach(record => {
    if (!attendanceMap[record.email]) attendanceMap[record.email] = {};
    attendanceMap[record.email][record.date] = { status: record.status, id: record._id };
    if (record.note) dateNotes[record.date] = record.note;
  });

  // --- Theme Classes ---
  const bgMain = isDarkMode ? "bg-slate-950 text-slate-100" : "bg-gray-100 text-gray-800";
  const bgCard = isDarkMode ? "bg-slate-900 border border-slate-800 shadow-none" : "bg-white border-transparent shadow-lg";
  const textMuted = isDarkMode ? "text-slate-400" : "text-gray-500";
  const headerBg = isDarkMode ? "bg-slate-900 border-b border-slate-800" : "bg-white shadow-sm border-b border-gray-200";
  const inputBg = isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900";
  const tableHeadBg = isDarkMode ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-slate-100 text-slate-700 border-slate-200";
  const tableRowHover = isDarkMode ? "hover:bg-slate-800/50" : "hover:bg-slate-50";
  const stickyColBg = isDarkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200";

  if (!isAuthorized) {
    return <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-900 text-slate-400'}`}><p className="font-bold">පද්ධතියට ඇතුළු වෙමින් පවතී...</p></div>;
  }

  return (
    <div className={`font-sans flex h-screen overflow-hidden transition-colors duration-300 ${bgMain}`}>
      
      <div className={`fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)}></div>

      <aside className={`w-64 bg-slate-950 text-white flex flex-col fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static transition-transform duration-300 shadow-xl border-r border-slate-800`}>
        <div className="p-6 border-b border-slate-800 font-bold text-xl flex items-center justify-between">
          <span>⚙️ Admin Panel</span>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">✖</button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-xl transition text-gray-300 hover:text-white"><span>🏠</span><span>මුල් තිරය</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/students'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-xl transition text-gray-300 hover:text-white"><span>👥</span><span>සිසුන් කළමනාකරණය</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/attendance'); }} className="flex items-center space-x-3 bg-teal-600 px-4 py-3 rounded-xl text-white font-bold shadow-md"><span>✅</span><span>පැමිණීම (Attendance)</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/videos'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-xl transition text-gray-300 hover:text-white"><span>📺</span><span>වීඩියෝ පාඩම්</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/tutes'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-xl transition text-gray-300 hover:text-white"><span>📚</span><span>නිබන්ධන</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/questions'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-xl transition text-gray-300 hover:text-white"><span>📝</span><span>MCQ ප්‍රශ්න පත්‍ර</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/marks'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-xl transition text-gray-300 hover:text-white"><span>📊</span><span>ලකුණු ඇතුළත් කිරීම</span></a>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        
        <header className={`${headerBg} p-4 flex justify-between items-center sticky top-0 z-30 transition-colors duration-300`}>
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className={`md:hidden p-2 mr-4 rounded-lg transition ${isDarkMode ? 'text-white hover:bg-slate-800' : 'text-slate-800 hover:bg-gray-100'}`}>
              <span className="text-2xl font-bold">☰</span>
            </button>
            <h1 className="text-xl font-bold">පැමිණීම සටහන් කිරීම</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button onClick={toggleTheme} className={`p-2 rounded-full transition-all focus:outline-none ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-teal-100 text-teal-600 hover:bg-teal-200'}`}>
              {isDarkMode ? <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
            </button>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* වම් පැත්ත: Single Form */}
          <div className={`${bgCard} p-8 rounded-3xl border-t-8 border-t-teal-500 lg:col-span-1 h-fit sticky top-24`}>
            <h2 className="text-xl font-bold mb-6 text-center">✅ තනි සිසුවෙකු සටහන් කිරීම</h2>

            {msg.text && <div className={`p-3 mb-4 rounded-lg text-sm font-bold text-center ${msg.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{msg.text}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>දිනය</label>
                <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-teal-500/50 ${inputBg}`}/>
              </div>
              
              <div>
                <label className={`block text-sm font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>ස්ථානය / පන්ති සටහන</label>
                {/* 🔴 අලුත්: මධ්‍යස්ථානය තෝරන්න Datalist එක */}
                <input type="text" list="centers" value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-teal-500/50 text-sm ${inputBg}`} placeholder="මධ්‍යස්ථානය තෝරන්න හෝ ටයිප් කරන්න"/>
                <datalist id="centers">
                  {allUniqueCenters.map(center => <option key={center} value={center} />)}
                </datalist>
              </div>

              <div>
                <label className={`block text-sm font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>A/L වර්ෂය</label>
                <select value={formData.alYear} onChange={(e) => setFormData({...formData, alYear: e.target.value, email: ''})} className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-teal-500/50 ${inputBg}`}>
                  <option value="2026">2026 A/L</option>
                  <option value="2027">2027 A/L</option>
                  <option value="2028">2028 A/L</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>සිසුවාගේ නම</label>
                <select required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-teal-500/50 font-medium ${inputBg}`}>
                  <option value="" disabled hidden>සිසුවෙකු තෝරන්න...</option>
                  {currentYearStudents.length === 0 ? (
                    <option value="" disabled>මෙම වර්ෂයේ සිසුන් නැත</option>
                  ) : (
                    currentYearStudents.map(student => (
                      <option key={student.email} value={student.email}>{student.name} ({student.center || 'Online'})</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>තත්වය (Status)</label>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setFormData({...formData, status: 'Present'})} className={`flex-1 py-3 rounded-xl font-bold border-2 transition ${formData.status === 'Present' ? 'bg-green-500/20 border-green-500 text-green-600' : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-white border-gray-200 text-gray-400')}`}>✅ Present</button>
                  <button type="button" onClick={() => setFormData({...formData, status: 'Absent'})} className={`flex-1 py-3 rounded-xl font-bold border-2 transition ${formData.status === 'Absent' ? 'bg-red-500/20 border-red-500 text-red-500' : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-white border-gray-200 text-gray-400')}`}>❌ Absent</button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl px-4 py-4 shadow-md transition mt-4">
                {loading ? 'සටහන් කරමින්...' : 'පැමිණීම සටහන් කරන්න'}
              </button>
            </form>
          </div>

          {/* දකුණු පැත්ත: Attendance Table */}
          <div className={`${bgCard} p-6 md:p-8 rounded-3xl lg:col-span-3 min-h-[500px]`}>
            
            {/* Top Filters (අවුරුද්ද සහ මධ්‍යස්ථානය තේරීම) */}
            <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b pb-6 ${isDarkMode ? 'border-slate-800' : 'border-gray-200'}`}>
              <h2 className="text-xl md:text-2xl font-bold flex items-center">
                <span className="mr-2">📅</span> මාසික පැමිණීමේ වාර්තා
              </h2>
              <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                <input type="month" value={viewMonth} onChange={(e) => setViewMonth(e.target.value)} className={`px-4 py-2 border rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-teal-500/50 flex-1 ${inputBg}`}/>
                
                <select value={selectedYearView} onChange={(e) => setSelectedYearView(e.target.value)} className={`px-4 py-2 border rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-teal-500/50 w-28 ${inputBg}`}>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                </select>

                {/* 🔴 අලුත්: මධ්‍යස්ථානය අනුව Table එක තේරීමේ Dropdown එක */}
                <select value={activeCenter} onChange={(e) => setSelectedCenterView(e.target.value)} className={`px-4 py-2 border rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-teal-500/50 min-w-[150px] ${inputBg}`}>
                  {uniqueCentersInYear.length === 0 ? (
                    <option value="" disabled>මධ්‍යස්ථාන නැත</option>
                  ) : (
                    uniqueCentersInYear.map(c => <option key={c} value={c}>{c}</option>)
                  )}
                </select>
              </div>
            </div>

            {/* Quick Mark Global Panel */}
            <div className={`flex items-center flex-wrap gap-3 p-4 rounded-2xl border mb-8 shadow-sm ${isDarkMode ? 'bg-teal-900/10 border-teal-800/40' : 'bg-teal-50/50 border-teal-100'}`}>
              <span className={`font-bold text-sm ${isDarkMode ? 'text-teal-400' : 'text-teal-800'}`}>⚡ අලුත් දිනයක් සකසන්න:</span>
              <input type="date" value={quickMarkDate} onChange={e => setQuickMarkDate(e.target.value)} className={`px-3 py-2 rounded-lg border outline-none text-sm font-bold focus:ring-2 focus:ring-teal-500/50 ${inputBg}`} />
              <input type="text" value={quickMarkNote} onChange={e => setQuickMarkNote(e.target.value)} placeholder="පන්ති සටහන (Optional)" className={`px-3 py-2 rounded-lg border outline-none text-sm focus:ring-2 focus:ring-teal-500/50 flex-1 min-w-[150px] ${inputBg}`} />
              <p className={`text-xs w-full mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>දිනය සකසා පහත වගුවේ අලුත් තීරුවෙන් සිසුන්ගේ පැමිණීම (✔/✖) ක්ලික් කරන්න.</p>
            </div>

            {/* Render Selected Table */}
            {centerStudents.length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center">
                <span className="text-5xl mb-4 opacity-30">📭</span>
                <p className={`font-bold ${textMuted}`}>මෙම වර්ෂයට සහ මධ්‍යස්ථානයට අදාළව සිසුන් ලියාපදිංචි වී නොමැත.</p>
              </div>
            ) : (
              <div className="flex flex-col">
                <h3 className={`text-lg md:text-xl font-extrabold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-teal-400' : 'text-teal-700'}`}>
                  <span className="bg-teal-500 w-2 h-6 rounded-full inline-block"></span>
                  {selectedYearView} - {activeCenter} සිසුන් 
                  <span className={`text-xs px-2 py-0.5 rounded-md font-bold ml-2 ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>{centerStudents.length} Students</span>
                </h3>
                
                <div className={`overflow-x-auto custom-scrollbar border rounded-xl ${isDarkMode ? 'border-slate-800' : 'border-gray-200'}`}>
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className={`${tableHeadBg} text-xs uppercase tracking-wider`}>
                        <th className={`p-4 font-black border-r sticky left-0 z-20 min-w-[200px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] ${tableHeadBg}`}>සිසුවාගේ නම</th>
                        
                        {/* Quick Mark Column */}
                        <th className={`p-3 text-center border-r min-w-[120px] shadow-inner ${isDarkMode ? 'bg-teal-900/30 border-teal-800/50' : 'bg-teal-50 border-teal-100'}`}>
                          <div className={`text-lg font-black ${isDarkMode ? 'text-teal-400' : 'text-teal-800'}`}>{quickMarkDate.split('-')[2]} <span className="text-xs font-normal">({quickMarkDate.split('-')[1]})</span></div>
                          <div className={`text-[10px] font-bold mt-1 px-1 rounded truncate max-w-[100px] mx-auto border ${isDarkMode ? 'bg-slate-900 text-teal-400 border-teal-900/50' : 'bg-white text-teal-600 border-teal-100'}`} title={quickMarkNote || 'අලුත් දිනය'}>
                            {quickMarkNote || 'New Day'}
                          </div>
                        </th>

                        {/* Dates Columns */}
                        {uniqueDates.map((date) => {
                          const day = date.split('-')[2];
                          const note = dateNotes[date]; 
                          return (
                            <th key={date} className={`p-3 text-center border-r min-w-[90px] ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                              <div className="text-lg font-black">{day}</div>
                              {note ? (
                                <div className={`text-[10px] font-bold mt-1 px-1 rounded truncate max-w-[80px] mx-auto border ${isDarkMode ? 'bg-purple-900/30 text-purple-400 border-purple-800' : 'bg-purple-50 text-purple-600 border-purple-100'}`} title={note}>
                                  {note}
                                </div>
                              ) : (
                                <div className="text-[10px] opacity-30 mt-1">-</div>
                              )}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {centerStudents.map((student) => (
                        <tr key={student.email} className={`border-b transition-colors ${tableRowHover} ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
                          
                          <td className={`p-4 font-bold border-r sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] ${stickyColBg}`}>
                              <div className="flex flex-col">
                                <span className={isDarkMode ? 'text-slate-200' : 'text-slate-800'}>{student.name}</span>
                                <span className={`text-[10px] font-normal ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{student.email.split('@')[0]}</span>
                              </div>
                          </td>

                          <td className={`p-2 text-center border-r group ${isDarkMode ? 'bg-teal-900/10 border-teal-800/30' : 'bg-teal-50/30 border-teal-100'}`}>
                              <div className="flex justify-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleQuickMark(student.email, 'Present')} className={`w-8 h-8 rounded-full border font-bold transition shadow-sm ${isDarkMode ? 'bg-slate-800 border-green-900/50 text-green-500 hover:bg-green-600 hover:text-white' : 'bg-white border-green-200 text-green-600 hover:bg-green-500 hover:text-white'}`} title="Present">✔</button>
                                <button onClick={() => handleQuickMark(student.email, 'Absent')} className={`w-8 h-8 rounded-full border font-bold transition shadow-sm ${isDarkMode ? 'bg-slate-800 border-red-900/50 text-red-500 hover:bg-red-600 hover:text-white' : 'bg-white border-red-200 text-red-600 hover:bg-red-500 hover:text-white'}`} title="Absent">✖</button>
                              </div>
                          </td>

                          {uniqueDates.map((date) => {
                            const cell = attendanceMap[student.email] && attendanceMap[student.email][date];
                            return (
                              <td key={date} className={`p-2 text-center border-r group relative ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                                {cell ? (
                                  <div className="flex flex-col items-center justify-center h-full">
                                    <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold shadow-sm ${cell.status === 'Present' ? (isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700') : (isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700')}`}>
                                      {cell.status === 'Present' ? '✔' : '✖'}
                                    </span>
                                    <button onClick={() => handleDelete(cell.id)} className={`opacity-0 group-hover:opacity-100 absolute top-0 right-0 p-1 text-red-500 hover:text-red-400 transition rounded-full shadow-md transform translate-x-1 -translate-y-1 ${isDarkMode ? 'bg-slate-700' : 'bg-white'}`} title="මකන්න">
                                      🗑️
                                    </button>
                                  </div>
                                ) : (
                                  <span className={`opacity-20 ${isDarkMode ? 'text-slate-600' : 'text-gray-300'}`}>-</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}