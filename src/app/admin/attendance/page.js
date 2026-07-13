"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminAttendancePage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const today = new Date().toISOString().split('T')[0]; 
  const currentMonth = today.substring(0, 7); 

  const [formData, setFormData] = useState({ date: today, alYear: '2026', email: '', status: 'Present', note: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  
  const [allStudents, setAllStudents] = useState([]); 
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [viewMonth, setViewMonth] = useState(currentMonth); 
  const [selectedYearView, setSelectedYearView] = useState('2026'); 

  // --- අලුත්: Quick Mark (Table එකෙන් මාර්ක් කිරීම) සඳහා States ---
  const [quickMarkDate, setQuickMarkDate] = useState(today);
  const [quickMarkNote, setQuickMarkNote] = useState('');
  const [quickMarkLoading, setQuickMarkLoading] = useState(false);

  // 1. Admin ලොග් වෙලාද කියලා බැලීම සහ ළමයින්ගේ නම් ගෙන ඒම
  useEffect(() => {
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

  // 2. පැමිණීමේ වාර්තා ගෙන ඒම
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

  const currentYearStudents = allStudents.filter(s => s.alYear === formData.alYear);

  // Form එකෙන් තනි ළමයෙකුගේ පැමිණීම සටහන් කිරීම
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

  // --- අලුත්: Table එකෙන් තනි තනිව මාර්ක් කිරීම (Quick Mark) ---
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
          note: quickMarkNote 
        }),
      });
      fetchAttendance(); // සාර්ථක වුණාම Table එක අලුත් කරනවා
    } catch (error) {
      console.error("Quick mark error:", error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('මෙම සටහන මකා දැමීමට අවශ්‍යද?')) {
      await fetch('/api/attendance', { method: 'DELETE', body: JSON.stringify({ id }) });
      fetchAttendance();
    }
  };

  const getStudentName = (email) => {
    const student = allStudents.find(s => s.email === email);
    return student ? student.name : email;
  };

  // Table එකට අවශ්‍ය දත්ත සැකසීම
  const uniqueDates = [...new Set(attendanceRecords.map(r => r.date))].sort();
  
  // Table එකේ වම් පැත්තේ පෙන්වන්න අදාළ අවුරුද්දේ ඉන්න *සියලුම* ළමයි ගන්නවා 
  // (කලින් ආපු නැති අයත් පෙන්වන්න ඕන නිසා)
  const studentsToDisplay = allStudents.filter(s => s.alYear === selectedYearView);
  
  const attendanceMap = {};
  const dateNotes = {}; 

  attendanceRecords.forEach(record => {
    if (!attendanceMap[record.email]) attendanceMap[record.email] = {};
    attendanceMap[record.email][record.date] = { status: record.status, id: record._id };
    if (record.note) dateNotes[record.date] = record.note;
  });

  if (!isAuthorized) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><p className="font-bold text-slate-400">පද්ධතියට ඇතුළු වෙමින් පවතී...</p></div>;
  }

  return (
    <div className="bg-gray-100 font-sans flex h-screen overflow-hidden">
      
      <div className={`fixed inset-0 bg-black/50 z-40 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setIsSidebarOpen(false)}></div>

      {/* --- Sidebar --- */}
      <aside className={`w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static transition-transform duration-300 shadow-xl`}>
        <div className="p-6 border-b border-slate-800 font-bold text-xl flex items-center justify-between">
          <span>⚙️ Admin Panel</span>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">✖</button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-lg transition text-gray-300 hover:text-white"><span>🏠</span><span>මුල් තිරය</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/attendance'); }} className="flex items-center space-x-3 bg-teal-600 px-4 py-3 rounded-lg text-white font-bold shadow-md"><span>✅</span><span>පැමිණීම (Attendance)</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/videos'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-lg transition text-gray-300 hover:text-white"><span>📺</span><span>වීඩියෝ පාඩම්</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/tutes'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-lg transition text-gray-300 hover:text-white"><span>📚</span><span>නිබන්ධන</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/questions'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-lg transition text-gray-300 hover:text-white"><span>📝</span><span>MCQ ප්‍රශ්න පත්‍ර</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/marks'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-lg transition text-gray-300 hover:text-white"><span>📊</span><span>ලකුණු ඇතුළත් කිරීම</span></a>
        </nav>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        
        <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-30 border-b border-gray-200">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 mr-4 text-slate-800 hover:bg-gray-100 rounded-lg transition">
              <span className="text-2xl font-bold">☰</span>
            </button>
            <h1 className="text-xl font-bold text-slate-800">පැමිණීම සටහන් කිරීම</h1>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* වම් පැත්ත: Attendance Form (අලුත් සිසුන් සඳහා පමණක් ලෙස දැන් භාවිතා වේ) */}
          <div className="bg-white p-8 rounded-3xl shadow-lg border-t-8 border-teal-500 lg:col-span-1 h-fit sticky top-24">
            <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">✅ තනි සිසුවෙකු සටහන් කිරීම</h2>

            {msg.text && <div className={`p-3 mb-4 rounded-lg text-sm font-bold text-center ${msg.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{msg.text}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-1">දිනය</label>
                <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border outline-none focus:border-teal-500"/>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-1">ස්ථානය / පන්ති සටහන</label>
                <input type="text" value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border outline-none focus:border-teal-500 text-sm" placeholder="උදා: මහරගම - Theory"/>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-1">A/L වර්ෂය</label>
                <select value={formData.alYear} onChange={(e) => {
                    setFormData({...formData, alYear: e.target.value, email: ''}); 
                  }} className="w-full px-4 py-3 rounded-xl bg-gray-50 border outline-none focus:border-teal-500">
                  <option value="2026">2026 A/L</option>
                  <option value="2027">2027 A/L</option>
                  <option value="2028">2028 A/L</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-1">සිසුවාගේ නම</label>
                <select required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border outline-none focus:border-teal-500 font-medium">
                  <option value="" disabled hidden>සිසුවෙකු තෝරන්න...</option>
                  {currentYearStudents.length === 0 ? (
                    <option value="" disabled>මෙම වර්ෂයේ සිසුන් නැත</option>
                  ) : (
                    currentYearStudents.map(student => (
                      <option key={student.email} value={student.email}>{student.name}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-1">තත්වය (Status)</label>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setFormData({...formData, status: 'Present'})} className={`flex-1 py-3 rounded-xl font-bold border-2 transition ${formData.status === 'Present' ? 'bg-green-100 border-green-500 text-green-700 shadow-sm' : 'bg-white border-gray-200 text-gray-400'}`}>✅ Present</button>
                  <button type="button" onClick={() => setFormData({...formData, status: 'Absent'})} className={`flex-1 py-3 rounded-xl font-bold border-2 transition ${formData.status === 'Absent' ? 'bg-red-100 border-red-500 text-red-700 shadow-sm' : 'bg-white border-gray-200 text-gray-400'}`}>❌ Absent</button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-teal-600 text-white font-bold rounded-xl px-4 py-4 shadow-md hover:bg-teal-700 transition mt-4">
                {loading ? 'සටහන් කරමින්...' : 'පැමිණීම සටහන් කරන්න'}
              </button>
            </form>
          </div>

          {/* දකුණු පැත්ත: Monthly Attendance Matrix Table */}
          <div className="bg-white p-6 rounded-3xl shadow-lg lg:col-span-3 flex flex-col min-h-[500px]">
            <div className="flex justify-between items-center flex-wrap gap-4 mb-6 border-b pb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <span className="mr-2">📅</span> මාසික පැමිණීමේ වාර්තාව
              </h2>
              <div className="flex gap-2">
                <input type="month" value={viewMonth} onChange={(e) => setViewMonth(e.target.value)} className="px-4 py-2 border rounded-xl text-sm bg-gray-50 font-bold outline-none focus:border-teal-500"/>
                <select value={selectedYearView} onChange={(e) => setSelectedYearView(e.target.value)} className="px-4 py-2 border rounded-xl text-sm bg-gray-50 font-bold outline-none focus:border-teal-500">
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                </select>
              </div>
            </div>

            {/* අලුත්: Table එකෙන් Quick Mark කිරීමේ පාලන පුවරුව */}
            <div className="flex items-center flex-wrap gap-3 bg-teal-50/50 p-4 rounded-2xl border border-teal-100 mb-6">
              <span className="font-bold text-teal-800 text-sm">⚡ අලුත් දිනයක් සකසන්න:</span>
              <input type="date" value={quickMarkDate} onChange={e => setQuickMarkDate(e.target.value)} className="px-3 py-2 rounded-lg border border-teal-200 outline-none text-sm font-bold focus:border-teal-500 bg-white shadow-sm" />
              <input type="text" value={quickMarkNote} onChange={e => setQuickMarkNote(e.target.value)} placeholder="පන්ති සටහන (Optional)" className="px-3 py-2 rounded-lg border border-teal-200 outline-none text-sm focus:border-teal-500 bg-white shadow-sm flex-1 min-w-[150px]" />
              <p className="text-xs text-slate-500 w-full mt-1">දිනය සහ සටහන සකසා පහත වගුවේ අලුත් තීරුවෙන් සිසුන්ගේ පැමිණීම (✔/✖) click කරන්න.</p>
            </div>

            <div className="flex-1 overflow-x-auto custom-scrollbar pb-4">
              {studentsToDisplay.length === 0 ? (
                <div className="text-center text-gray-500 py-20 flex flex-col items-center">
                  <span className="text-5xl mb-4 opacity-50">📭</span>
                  <p>මෙම වර්ෂයට අදාළව සිසුන් ලියාපදිංචි වී නොමැත.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 text-sm">
                      <th className="p-4 rounded-tl-xl border-r border-slate-200 sticky left-0 bg-slate-100 z-20 min-w-[200px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">සිසුවාගේ නම</th>
                      
                      {/* අලුත්: Quick Mark Column (හැමතිස්සෙම මුලින්ම තියෙනවා) */}
                      <th className="p-3 text-center border-r border-teal-200 bg-teal-50 min-w-[120px] shadow-inner">
                        <div className="text-lg font-black text-teal-800">{quickMarkDate.split('-')[2]} <span className="text-xs font-normal">({quickMarkDate.split('-')[1]})</span></div>
                        <div className="text-[10px] text-teal-600 font-bold mt-1 bg-white px-1 rounded truncate max-w-[100px] mx-auto border border-teal-100" title={quickMarkNote || 'අලුත් දිනය'}>
                          {quickMarkNote || 'New Day'}
                        </div>
                      </th>

                      {/* පරණ දවස් ටික */}
                      {uniqueDates.map((date) => {
                        const day = date.split('-')[2];
                        const note = dateNotes[date]; 
                        return (
                          <th key={date} className="p-3 text-center border-r border-slate-200 min-w-[90px]">
                            <div className="text-lg font-black text-slate-800">{day}</div>
                            {note ? (
                              <div className="text-[10px] text-blue-600 font-bold mt-1 bg-blue-50 px-1 rounded truncate max-w-[80px] mx-auto border border-blue-100" title={note}>
                                {note}
                              </div>
                            ) : (
                              <div className="text-[10px] text-slate-400 mt-1">-</div>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {studentsToDisplay.map((student) => (
                      <tr key={student.email} className="border-b hover:bg-slate-50 transition">
                        
                        {/* සිසුවාගේ නම සහ ඊමේල් */}
                        <td className="p-4 font-bold text-slate-700 border-r border-slate-200 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                           <div className="flex flex-col">
                             <span className="text-slate-800">{student.name}</span>
                             <span className="text-[10px] text-slate-400 font-normal">{student.email.split('@')[0]}</span>
                           </div>
                        </td>

                        {/* අලුත්: Quick Mark Buttons */}
                        <td className="p-2 text-center border-r border-teal-200 bg-teal-50/30 group">
                           <div className="flex justify-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => handleQuickMark(student.email, 'Present')} className="w-8 h-8 rounded-full bg-white border border-green-200 text-green-600 font-bold hover:bg-green-500 hover:text-white transition shadow-sm" title="Present">✔</button>
                             <button onClick={() => handleQuickMark(student.email, 'Absent')} className="w-8 h-8 rounded-full bg-white border border-red-200 text-red-600 font-bold hover:bg-red-500 hover:text-white transition shadow-sm" title="Absent">✖</button>
                           </div>
                        </td>

                        {/* පරණ පැමිණීම් */}
                        {uniqueDates.map((date) => {
                          const cell = attendanceMap[student.email] && attendanceMap[student.email][date];
                          return (
                            <td key={date} className="p-2 text-center border-r border-slate-100 group relative">
                              {cell ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                  <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold shadow-sm ${cell.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {cell.status === 'Present' ? '✔' : '✖'}
                                  </span>
                                  <button onClick={() => handleDelete(cell.id)} className="opacity-0 group-hover:opacity-100 absolute top-0 right-0 p-1 text-red-500 hover:text-red-700 transition bg-white rounded-full shadow-md transform translate-x-1 -translate-y-1" title="මකන්න">
                                    🗑️
                                  </button>
                                </div>
                              ) : (
                                <span className="text-gray-300">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}