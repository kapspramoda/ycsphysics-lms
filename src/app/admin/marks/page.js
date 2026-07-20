"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminMarksPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false); 
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [formData, setFormData] = useState({ email: '', paperName: '', score: '', alYear: '2026' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  
  const [existingPapers, setExistingPapers] = useState(['2026 Model Paper 01', 'Term Test 01']);
  const [allMarks, setAllMarks] = useState([]);
  const [editingId, setEditingId] = useState(null); 
  const [selectedYearView, setSelectedYearView] = useState(null); 
  const [allStudents, setAllStudents] = useState([]); 

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') setIsDarkMode(true);

    const adminToken = localStorage.getItem('isAdminLoggedIn');
    if (!adminToken) {
      router.push('/admin/login');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const marksRes = await fetch('/api/marks', { cache: 'no-store' });
        const marksData = await marksRes.json();
        if (marksData.marks) setAllMarks(marksData.marks);

        const usersRes = await fetch('/api/users?year=All', { cache: 'no-store' });
        const usersData = await usersRes.json();
        if (usersData.users) setAllStudents(usersData.users);
      } catch (error) { console.error(error); }
    };
    if (isAuthorized) fetchData();
  }, [isAuthorized]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setMessage({ type: 'error', text: 'කරුණාකර සිසුවෙකු තෝරන්න!' });
      return;
    }
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const method = editingId ? 'PATCH' : 'POST';
      const bodyData = editingId ? { id: editingId, ...formData } : formData;

      const response = await fetch('/api/marks', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: editingId ? 'ලකුණු යාවත්කාලීන විය! ✅' : 'ලකුණු සාර්ථකව එක් කළා! ✅' });
        if (!existingPapers.includes(formData.paperName)) setExistingPapers([...existingPapers, formData.paperName]);
        
        setFormData({ ...formData, email: '', score: '' }); 
        setEditingId(null);
        
        const res = await fetch('/api/marks', { cache: 'no-store' });
        const data = await res.json();
        if (data.marks) setAllMarks(data.marks);
      } else { throw new Error('අසාර්ථකයි.'); }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 2000);
    }
  };

  const handleEdit = (mark) => {
    setFormData({ email: mark.email, paperName: mark.paperName, score: mark.score, alYear: mark.alYear || '2026' });
    setEditingId(mark._id);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const handleDelete = async (id) => {
    if (confirm('මෙම ලකුණු සටහන මකා දැමීමට අවශ්‍යද?')) {
      await fetch('/api/marks', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      const res = await fetch('/api/marks', { cache: 'no-store' });
      const data = await res.json();
      if (data.marks) setAllMarks(data.marks);
    }
  };

  let groupedMarks = {};
  if (selectedYearView) {
    const filteredMarks = allMarks.filter(m => m.alYear === selectedYearView);
    filteredMarks.forEach(mark => {
      if (!groupedMarks[mark.paperName]) groupedMarks[mark.paperName] = [];
      groupedMarks[mark.paperName].push(mark);
    });
    Object.keys(groupedMarks).forEach(paper => {
      groupedMarks[paper].sort((a, b) => b.score - a.score);
    });
  }

  const getStudentName = (email) => {
    const student = allStudents.find(s => s.email === email);
    return student ? student.name : email; 
  };

  const currentYearStudents = allStudents.filter(s => s.alYear === formData.alYear);

  const bgMain = isDarkMode ? "bg-slate-950 text-slate-100" : "bg-gray-100 text-gray-800";
  const bgCard = isDarkMode ? "bg-slate-900 border border-slate-800 shadow-none" : "bg-white border-transparent shadow-lg";
  const textMuted = isDarkMode ? "text-slate-400" : "text-gray-500";
  const headerBg = isDarkMode ? "bg-slate-900 border-b border-slate-800" : "bg-white shadow-sm border-b border-gray-200";
  const inputBg = isDarkMode ? "bg-slate-800 border-slate-700 text-white focus:ring-amber-500/50" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-amber-500";
  const tableHeadBg = isDarkMode ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-gray-100 text-gray-600 border-slate-200";
  const tableRowHover = isDarkMode ? "hover:bg-slate-800/50" : "hover:bg-gray-50";

  if (!isAuthorized) return <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-950 text-slate-400' : 'bg-slate-900 text-slate-400'}`}><p className="font-bold">පද්ධතියට ඇතුළු වෙමින් පවතී...</p></div>;

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
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/attendance'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-xl transition text-gray-300 hover:text-white"><span>✅</span><span>පැමිණීම (Attendance)</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/videos'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-xl transition text-gray-300 hover:text-white"><span>📺</span><span>වීඩියෝ පාඩම්</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/tutes'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-xl transition text-gray-300 hover:text-white"><span>📚</span><span>නිබන්ධන</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/questions'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-xl transition text-gray-300 hover:text-white"><span>📝</span><span>MCQ ප්‍රශ්න පත්‍ර</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/marks'); }} className="flex items-center space-x-3 bg-amber-500 px-4 py-3 rounded-xl text-white font-bold shadow-md"><span>📊</span><span>ලකුණු ඇතුළත් කිරීම</span></a>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative scroll-smooth">
        <header className={`${headerBg} p-4 flex justify-between items-center sticky top-0 z-30 transition-colors duration-300`}>
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className={`md:hidden p-2 mr-4 rounded-lg transition ${isDarkMode ? 'text-white hover:bg-slate-800' : 'text-slate-800 hover:bg-gray-100'}`}><span className="text-2xl font-bold">☰</span></button>
            <h1 className="text-xl font-bold">📊 ලකුණු ඇතුළත් කිරීම</h1>
          </div>
          <button onClick={toggleTheme} className={`p-2 rounded-full transition-all focus:outline-none ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-amber-100 text-amber-600 hover:bg-amber-200'}`}>
            {isDarkMode ? <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
          </button>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className={`${bgCard} p-8 rounded-3xl border-t-8 border-t-amber-500 lg:col-span-1 h-fit sticky top-24`}>
              <h2 className="text-xl font-bold mb-6 text-center">
                {editingId ? '✏️ ලකුණු සංස්කරණය' : '📊 ලකුණු ඇතුළත් කිරීම'}
              </h2>
              {message.text && <div className={`p-3 mb-4 rounded-lg text-sm font-bold text-center ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message.text}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>A/L වර්ෂය</label>
                  <select value={formData.alYear} onChange={(e) => {
                      setFormData({...formData, alYear: e.target.value, email: ''}); 
                    }} className={`w-full p-3 rounded-xl border outline-none transition ${inputBg}`}>
                    <option value="2026">2026 A/L</option>
                    <option value="2027">2027 A/L</option>
                    <option value="2028">2028 A/L</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>සිසුවාගේ නම</label>
                  <select required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className={`w-full p-3 rounded-xl border outline-none transition font-medium ${inputBg}`}>
                    <option value="" disabled hidden>සිසුවෙකු තෝරන්න...</option>
                    {currentYearStudents.length === 0 ? (
                      <option value="" disabled>මෙම වර්ෂයට සිසුන් නොමැත</option>
                    ) : (
                      currentYearStudents.map(student => (
                        <option key={student.email} value={student.email}>{student.name}</option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>ප්‍රශ්න පත්‍රයේ නම</label>
                  <input type="text" required list="paper-list" value={formData.paperName} onChange={(e) => setFormData({...formData, paperName: e.target.value})} className={`w-full p-3 rounded-xl border outline-none transition ${inputBg}`} placeholder="නමක් තෝරන්න/ටයිප් කරන්න"/>
                  <datalist id="paper-list">{existingPapers.map((p, i) => <option key={i} value={p} />)}</datalist>
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>ලබාගත් ලකුණු (%)</label>
                  <input type="number" required min="0" max="100" value={formData.score} onChange={(e) => setFormData({...formData, score: e.target.value})} className={`w-full p-3 rounded-xl border outline-none transition ${inputBg}`} placeholder="උදා: 75"/>
                </div>
                <button type="submit" disabled={loading} className={`w-full text-white font-bold rounded-xl p-4 shadow-md mt-4 transition ${editingId ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-500 hover:bg-amber-600'}`}>
                  {loading ? 'රැඳී සිටින්න...' : editingId ? 'ලකුණු යාවත්කාලීන කරන්න' : 'Database එකට යවන්න'}
                </button>
                {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({ email: '', paperName: '', score: '', alYear: '2026' }); }} className={`w-full mt-2 font-bold text-sm transition ${isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-gray-500 hover:text-gray-700'}`}>අවලංගු කරන්න</button>}
              </form>
            </div>

            <div className={`${bgCard} p-6 rounded-3xl lg:col-span-2 h-[70vh] flex flex-col`}>
              <h2 className={`text-xl font-bold mb-4 border-b pb-4 ${isDarkMode ? 'border-slate-800' : 'border-gray-200'}`}>මෑතකදී ඇතුළත් කළ ලකුණු</h2>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {allMarks.length === 0 ? (
                  <p className={`text-center mt-10 ${textMuted}`}>දත්ත නොමැත</p>
                ) : (
                  allMarks.slice(0, 15).map((mark) => (
                    <div key={mark._id} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-2xl transition gap-4 sm:gap-0 ${isDarkMode ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600' : 'bg-gray-50 border-gray-200 hover:shadow-sm'}`}>
                      <div className="w-full sm:w-auto">
                        <h3 className={`font-bold text-sm ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>{mark.paperName}</h3>
                        <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                          {getStudentName(mark.email)} 
                          <span className={`px-2 py-0.5 rounded ml-2 font-bold ${isDarkMode ? 'bg-amber-900/40 text-amber-400' : 'bg-yellow-100 text-yellow-800'}`}>{mark.alYear || 'N/A'}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <span className={`text-xl font-black ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>{mark.score}%</span>
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(mark)} className={`text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-lg transition ${isDarkMode ? 'bg-purple-900/40 text-purple-400 hover:bg-purple-900/60' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}>Edit</button>
                          <button onClick={() => handleDelete(mark._id)} className={`text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-lg transition ${isDarkMode ? 'bg-red-900/30 text-red-500 hover:bg-red-900/50' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}>Erase</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div>
            <h2 className={`text-2xl font-bold mb-6 border-b pb-4 flex items-center ${isDarkMode ? 'border-slate-800' : 'border-gray-200'}`}>
              <span className="mr-2">🏆</span> ප්‍රතිඵල ලේඛන
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
              {['2028', '2027', '2026'].map(year => (
                <div key={year} onClick={() => setSelectedYearView(selectedYearView === year ? null : year)} className={`p-4 md:p-6 rounded-3xl shadow-sm cursor-pointer text-center font-bold text-lg md:text-xl transition-all transform hover:-translate-y-1 ${selectedYearView === year ? 'bg-amber-500 text-white shadow-md' : (isDarkMode ? 'bg-slate-800 text-slate-300 border-2 border-transparent hover:border-amber-500/50' : 'bg-white text-gray-700 border-2 border-transparent hover:border-amber-200')}`}>
                  {year} A/L Marks
                </div>
              ))}
            </div>

            {selectedYearView && (
              <div className="space-y-8 animate-fade-in">
                {Object.keys(groupedMarks).length === 0 ? (
                  <div className={`${bgCard} rounded-3xl p-10 text-center`}><span className="text-5xl mb-4 block opacity-50">📭</span><p className={`font-medium ${textMuted}`}>දැනට මෙම වර්ෂයට අදාළව ලකුණු ඇතුළත් කර නොමැත.</p></div>
                ) : (
                  Object.keys(groupedMarks).map((paperName, idx) => (
                    <div key={idx} className={`${bgCard} rounded-3xl overflow-hidden`}>
                      <div className={`p-4 md:p-5 flex flex-wrap justify-between items-center border-b ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-purple-50 border-purple-100'}`}>
                        <h3 className={`text-lg md:text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-900'}`}><span>📝</span> {paperName}</h3>
                        <span className={`font-bold px-3 py-1 rounded-full shadow-sm text-xs mt-2 sm:mt-0 ${isDarkMode ? 'bg-slate-900 text-purple-400 border border-slate-700' : 'bg-white text-purple-600'}`}>සිසුන් {groupedMarks[paperName].length} ක්</span>
                      </div>
                      <div className={`overflow-x-auto p-0 sm:p-4 custom-scrollbar`}>
                        <table className="w-full text-left border-collapse min-w-[500px]">
                          <thead>
                            <tr className={`${tableHeadBg} text-xs uppercase tracking-wider`}>
                              <th className="p-4 rounded-tl-xl w-16 text-center">ස්ථානය</th>
                              <th className="p-4">සිසුවාගේ නම</th>
                              <th className="p-4">වර්ගය</th>
                              <th className="p-4 text-center">ලකුණු</th>
                              <th className="p-4 rounded-tr-xl text-center">වෙනස්කම්</th>
                            </tr>
                          </thead>
                          <tbody>
                            {groupedMarks[paperName].map((mark, rankIndex) => (
                              <tr key={mark._id} className={`border-b transition-colors ${tableRowHover} ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
                                <td className="p-4 text-center">
                                  {rankIndex === 0 ? <span className="text-2xl" title="පළමු ස්ථානය">🥇</span> : rankIndex === 1 ? <span className="text-2xl" title="දෙවන ස්ථානය">🥈</span> : rankIndex === 2 ? <span className="text-2xl" title="තෙවන ස්ථානය">🥉</span> : <span className={`font-bold ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>{rankIndex + 1}</span>}
                                </td>
                                <td className={`p-4 font-bold text-sm ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>{getStudentName(mark.email)}</td>
                                <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${mark.examType === 'Online' ? (isDarkMode ? 'bg-green-900/40 text-green-400' : 'bg-green-100 text-green-700') : (isDarkMode ? 'bg-yellow-900/40 text-yellow-400' : 'bg-yellow-100 text-yellow-700')}`}>{mark.examType}</span></td>
                                <td className={`p-4 text-center font-black text-lg ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>{mark.score}%</td>
                                <td className="p-4 text-center">
                                  <button onClick={() => handleDelete(mark._id)} className={`font-bold text-xs px-3 py-1.5 rounded-lg transition ${isDarkMode ? 'bg-red-900/30 text-red-500 hover:bg-red-900/50 border border-red-900/50' : 'bg-red-50 text-red-500 hover:text-red-700 hover:bg-red-100'}`}>🗑️ මකන්න</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}