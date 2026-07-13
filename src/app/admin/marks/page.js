"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminMarksPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false); // Admin Lock State

  const [formData, setFormData] = useState({ email: '', paperName: '', score: '', alYear: '2026' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  
  const [existingPapers, setExistingPapers] = useState(['2026 Model Paper 01', 'Term Test 01']);
  const [allMarks, setAllMarks] = useState([]);
  const [editingId, setEditingId] = useState(null); 
  const [selectedYearView, setSelectedYearView] = useState(null); 
  
  const [allStudents, setAllStudents] = useState([]); // ළමයින්ගේ නම් ගබඩා කරගන්න

  // 1. Admin ලොග් වෙලාද කියලා බලන කොටස
  useEffect(() => {
    const adminToken = localStorage.getItem('isAdminLoggedIn');
    if (!adminToken) {
      router.push('/admin/login');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  // 2. ලකුණු සහ ළමයින්ගේ දත්ත ගෙන ඒම
  useEffect(() => {
    const fetchData = async () => {
      try {
        // ලකුණු ටික ගේනවා
        const marksRes = await fetch('/api/marks', { cache: 'no-store' });
        const marksData = await marksRes.json();
        if (marksData.marks) setAllMarks(marksData.marks);

        // ළමයින්ගේ නම් ටික ගේනවා (Dropdown එකට සහ Table එකේ නම් පෙන්වන්න)
        const usersRes = await fetch('/api/users?year=All', { cache: 'no-store' });
        const usersData = await usersRes.json();
        if (usersData.users) setAllStudents(usersData.users);
      } catch (error) { console.error(error); }
    };
    if (isAuthorized) {
      fetchData();
    }
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
        
        // අලුත් දත්ත ගේනවා
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
    window.scrollTo(0, 0); 
  };

  const handleDelete = async (id) => {
    if (confirm('මෙම ලකුණු සටහන මකා දැමීමට අවශ්‍යද?')) {
      await fetch('/api/marks', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      // අප්ඩේට් කිරීම
      const res = await fetch('/api/marks', { cache: 'no-store' });
      const data = await res.json();
      if (data.marks) setAllMarks(data.marks);
    }
  };

  // වර්ෂය අනුව ලකුණු වෙන් කිරීම
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

  // ඊමේල් එක දුන්නම ළමයාගේ නම හොයාගන්න Function එක
  const getStudentName = (email) => {
    const student = allStudents.find(s => s.email === email);
    return student ? student.name : email; // නම නැත්නම් ඊමේල් එක පෙන්වනවා
  };

  // Form එකේ තෝරපු අවුරුද්දට අදාළ ළමයි ටික පෙරලා ගන්නවා
  const currentYearStudents = allStudents.filter(s => s.alYear === formData.alYear);

  // ලොක් එක චෙක් කරනකම් පෙන්වන තිරය
  if (!isAuthorized) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><p className="font-bold text-slate-400">පද්ධතියට ඇතුළු වෙමින් පවතී...</p></div>;
  }

  return (
    <div className="bg-gray-100 font-sans flex h-screen overflow-hidden">
      
      {/* Mobile Overlay */}
      <div className={`fixed inset-0 bg-black/50 z-40 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setIsSidebarOpen(false)}></div>

      {/* Sidebar */}
      <aside className={`w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static transition-transform duration-300 shadow-xl`}>
        <div className="p-6 border-b border-slate-800 font-bold text-xl flex items-center justify-between">
          <span>⚙️ Admin Panel</span>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">✖</button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-lg transition text-gray-300 hover:text-white"><span>🏠</span><span>මුල් තිරය</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/attendance'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-lg transition text-gray-300 hover:text-white"><span>✅</span><span>පැමිණීම (Attendance)</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/videos'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-lg transition text-gray-300 hover:text-white"><span>📺</span><span>වීඩියෝ පාඩම්</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/tutes'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-lg transition text-gray-300 hover:text-white"><span>📚</span><span>නිබන්ධන</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/questions'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-lg transition text-gray-300 hover:text-white"><span>📝</span><span>MCQ ප්‍රශ්න පත්‍ර</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/marks'); }} className="flex items-center space-x-3 bg-amber-500 px-4 py-3 rounded-lg text-white font-bold shadow-md"><span>📊</span><span>ලකුණු ඇතුළත් කිරීම</span></a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="bg-white shadow-sm p-4 flex items-center sticky top-0 z-30 border-b border-gray-200">
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 mr-4 text-slate-800 hover:bg-gray-100 rounded-lg transition"><span className="text-2xl font-bold">☰</span></button>
          <h1 className="text-xl font-bold text-slate-800">📊 ලකුණු ඇතුළත් කිරීම</h1>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
          
          {/* ඉහළ කොටස: Form එක සහ මෑත ලකුණු */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-3xl shadow-lg border-t-8 border-amber-500 lg:col-span-1 h-fit sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
                {editingId ? '✏️ ලකුණු සංස්කරණය' : '📊 ලකුණු ඇතුළත් කිරීම'}
              </h2>
              {message.text && <div className={`p-3 mb-4 rounded-lg text-sm font-bold text-center ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message.text}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1">A/L වර්ෂය</label>
                  <select value={formData.alYear} onChange={(e) => {
                      setFormData({...formData, alYear: e.target.value, email: ''}); // අවුරුද්ද මාරු කරද්දී ඊමේල් එක හිස් කරනවා
                    }} className="w-full px-4 py-3 rounded-xl bg-gray-50 border outline-none focus:border-amber-500">
                    <option value="2026">2026 A/L</option>
                    <option value="2027">2027 A/L</option>
                    <option value="2028">2028 A/L</option>
                  </select>
                </div>
                
                {/* අලුත් කළ ළමයා තෝරන Dropdown එක */}
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1">සිසුවාගේ නම</label>
                  <select required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border outline-none focus:border-amber-500 font-medium">
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
                  <label className="block text-gray-700 text-sm font-bold mb-1">ප්‍රශ්න පත්‍රයේ නම</label>
                  <input type="text" required list="paper-list" value={formData.paperName} onChange={(e) => setFormData({...formData, paperName: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border outline-none focus:border-amber-500" placeholder="නමක් තෝරන්න/ටයිප් කරන්න"/>
                  <datalist id="paper-list">{existingPapers.map((p, i) => <option key={i} value={p} />)}</datalist>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1">ලබාගත් ලකුණු (%)</label>
                  <input type="number" required min="0" max="100" value={formData.score} onChange={(e) => setFormData({...formData, score: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border outline-none focus:border-amber-500" placeholder="උදා: 75"/>
                </div>
                <button type="submit" disabled={loading} className={`w-full text-white font-bold rounded-xl px-4 py-4 shadow-md mt-4 transition ${editingId ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-500 hover:bg-amber-600'}`}>
                  {loading ? 'රැඳී සිටින්න...' : editingId ? 'ලකුණු යාවත්කාලීන කරන්න' : 'Database එකට යවන්න'}
                </button>
                {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({ email: '', paperName: '', score: '', alYear: '2026' }); }} className="w-full mt-2 text-gray-500 font-bold hover:text-gray-700">අවලංගු කරන්න</button>}
              </form>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-lg lg:col-span-2 h-[70vh] flex flex-col">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-4">මෑතකදී ඇතුළත් කළ ලකුණු</h2>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {allMarks.length === 0 ? (
                  <p className="text-center text-gray-400 mt-10">දත්ත නොමැත</p>
                ) : (
                  allMarks.slice(0, 15).map((mark) => (
                    <div key={mark._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 border rounded-2xl hover:shadow-sm transition gap-4 sm:gap-0">
                      <div>
                        <h3 className="font-bold text-gray-800">{mark.paperName}</h3>
                        {/* ඊමේල් එක වෙනුවට නම පෙන්වීම */}
                        <p className="text-sm text-gray-600 font-medium">{getStudentName(mark.email)} <span className="bg-yellow-100 text-yellow-800 px-2 rounded ml-2 font-bold">{mark.alYear || 'N/A'}</span></p>
                      </div>
                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <span className="text-2xl font-bold text-blue-600">{mark.score}%</span>
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(mark)} className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition">Edit</button>
                          <button onClick={() => handleDelete(mark._id)} className="text-xs font-bold bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 transition">Erase</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* පහළ කොටස: වර්ෂය අනුව ලකුණු බැලීම */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4 flex items-center">
              <span className="mr-2">🏆</span> ප්‍රතිඵල ලේඛන
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {['2028', '2027', '2026'].map(year => (
                <div key={year} onClick={() => setSelectedYearView(selectedYearView === year ? null : year)} className={`p-6 rounded-3xl shadow-md cursor-pointer text-center font-bold text-xl transition-all transform hover:-translate-y-1 ${selectedYearView === year ? 'bg-amber-500 text-white shadow-lg' : 'bg-white text-gray-700 border-2 border-transparent hover:border-amber-200'}`}>
                  {year} A/L Marks
                </div>
              ))}
            </div>

            {selectedYearView && (
              <div className="space-y-8 animate-fade-in">
                {Object.keys(groupedMarks).length === 0 ? (
                  <div className="bg-white rounded-3xl shadow-sm p-10 text-center"><span className="text-5xl mb-4 block">📭</span><p className="text-gray-500 font-medium">දැනට මෙම වර්ෂයට අදාළව ලකුණු ඇතුළත් කර නොමැත.</p></div>
                ) : (
                  Object.keys(groupedMarks).map((paperName, idx) => (
                    <div key={idx} className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
                      <div className="bg-blue-50 border-b border-blue-100 p-5 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-blue-900 flex items-center"><span className="mr-2 text-2xl">📝</span> {paperName} - ප්‍රතිඵල ලේඛනය</h3>
                        <span className="bg-white text-blue-600 font-bold px-4 py-1 rounded-full shadow-sm text-sm">සිසුන් {groupedMarks[paperName].length} ක්</span>
                      </div>
                      <div className="overflow-x-auto p-4 custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                          <thead>
                            <tr className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                              <th className="p-4 rounded-tl-xl w-16 text-center">ස්ථානය</th>
                              <th className="p-4">සිසුවාගේ නම</th>
                              <th className="p-4">වර්ගය</th>
                              <th className="p-4 text-center">ලකුණු</th>
                              <th className="p-4 rounded-tr-xl text-center">වෙනස්කම්</th>
                            </tr>
                          </thead>
                          <tbody>
                            {groupedMarks[paperName].map((mark, rankIndex) => (
                              <tr key={mark._id} className="border-b hover:bg-gray-50 transition">
                                <td className="p-4 text-center">
                                  {rankIndex === 0 ? <span className="text-2xl" title="පළමු ස්ථානය">🥇</span> : rankIndex === 1 ? <span className="text-2xl" title="දෙවන ස්ථානය">🥈</span> : rankIndex === 2 ? <span className="text-2xl" title="තෙවන ස්ථානය">🥉</span> : <span className="font-bold text-gray-500">{rankIndex + 1}</span>}
                                </td>
                                {/* ඊමේල් එක වෙනුවට නම පෙන්වීම */}
                                <td className="p-4 text-gray-800 font-bold">{getStudentName(mark.email)}</td>
                                <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${mark.examType === 'Online' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{mark.examType}</span></td>
                                <td className="p-4 text-center font-bold text-xl text-blue-600">{mark.score}%</td>
                                <td className="p-4 text-center"><button onClick={() => handleDelete(mark._id)} className="text-red-500 hover:text-red-700 font-bold text-sm bg-red-50 px-3 py-1 rounded-lg hover:bg-red-100 transition">🗑️ මකන්න</button></td>
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