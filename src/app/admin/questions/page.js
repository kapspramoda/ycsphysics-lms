"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminQuestionsPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [formData, setFormData] = useState({ paperName: '', alYear: '2026', text: '', option1: '', option2: '', option3: '', option4: '', option5: '', correctAnswer: '0' });
  const [questions, setQuestions] = useState([]);
  const [msg, setMsg] = useState('');
  
  const [editingId, setEditingId] = useState(null);

  // --- අලුත්: දිගහැරෙන පේපර් එක මතක තබාගන්නා State එක ---
  const [expandedPaperKey, setExpandedPaperKey] = useState(null);

  useEffect(() => {
    const adminToken = localStorage.getItem('isAdminLoggedIn');
    if (!adminToken) {
      router.push('/admin/login');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/questions?admin=true', { cache: 'no-store' });
      const data = await res.json();
      if (data.questions) setQuestions(data.questions);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    if (isAuthorized) fetchQuestions();
  }, [isAuthorized]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const optionsArray = [formData.option1, formData.option2, formData.option3, formData.option4, formData.option5];
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const bodyData = editingId 
        ? { id: editingId, ...formData, options: optionsArray, correctAnswer: parseInt(formData.correctAnswer), isEdit: true } 
        : { ...formData, options: optionsArray, correctAnswer: parseInt(formData.correctAnswer) };

      const res = await fetch('/api/questions', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      if (res.ok) {
        setMsg(editingId ? 'ප්‍රශ්නය යාවත්කාලීන කළා! ✅' : 'ප්‍රශ්නය එක් කළා! ✅');
        
        // අලුතින් දාපු පේපර් එක ඔටෝ දිගහැරෙන්න (Maximize වෙන්න) සකසනවා
        const targetKey = `${formData.alYear} - ${formData.paperName}`;
        setExpandedPaperKey(targetKey);

        if(editingId) {
            setFormData({ paperName: '', alYear: '2026', text: '', option1: '', option2: '', option3: '', option4: '', option5: '', correctAnswer: '0' });
            setEditingId(null);
        } else {
            // එකම පේපර් එකට දිගටම ප්‍රශ්න දාන්න ලේසි වෙන්න paperName එකයි alYear එකයි මකන්නේ නෑ!
            setFormData({ ...formData, text: '', option1: '', option2: '', option3: '', option4: '', option5: '', correctAnswer: '0' });
        }
        
        fetchQuestions();
        setTimeout(() => setMsg(''), 2000);
      }
    } catch (error) { console.error(error); }
  };

  const handleEdit = (q) => {
    setFormData({
      paperName: q.paperName,
      alYear: q.alYear,
      text: q.text,
      option1: q.options[0],
      option2: q.options[1],
      option3: q.options[2],
      option4: q.options[3],
      option5: q.options[4],
      correctAnswer: q.correctAnswer.toString()
    });
    setEditingId(q._id);
    window.scrollTo(0, 0); 
  };

  const toggleVisibility = async (id, status) => {
    try {
      await fetch('/api/questions', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, isVisible: !status }) });
      fetchQuestions();
    } catch (error) { console.error(error); }
  };

  const deleteQuestion = async (id) => {
    if (confirm('මෙම ප්‍රශ්නය ස්ථිරවම මකා දැමීමට අවශ්‍යද?')) {
      try {
        await fetch('/api/questions', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
        fetchQuestions();
      } catch (error) { console.error(error); }
    }
  };

  const deleteEntirePaper = async (paperName, alYear) => {
    if (confirm(`අවවාදයි! "${paperName} (${alYear})" ප්‍රශ්න පත්‍රයේ ඇති සියලුම ප්‍රශ්න ස්ථිරවම මකා දැමීමට අවශ්‍යද?`)) {
      try {
        const paperQuestions = questions.filter(q => q.paperName === paperName && q.alYear === alYear);
        for (const q of paperQuestions) {
          await fetch('/api/questions', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: q._id }) });
        }
        fetchQuestions();
      } catch (error) { console.error(error); }
    }
  };

  const toggleEntirePaper = async (paperName, alYear, makeVisible) => {
    try {
      const paperQuestions = questions.filter(q => q.paperName === paperName && q.alYear === alYear);
      for (const q of paperQuestions) {
        await fetch('/api/questions', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: q._id, isVisible: makeVisible }) });
      }
      fetchQuestions();
    } catch (error) { console.error(error); }
  };

  // --- අලුත්: පේපර් Group කිරීම සහ අලුත්ම එක උඩට එන විදිහට Sort කිරීම ---
  const groupedPapers = {};
  questions.forEach(q => {
    const key = `${q.alYear} - ${q.paperName}`; 
    if (!groupedPapers[key]) {
      // latestId එක පාවිච්චි කරන්නේ අලුත්ම ප්‍රශ්නය තියෙන පේපර් එක හොයාගන්නයි
      groupedPapers[key] = { key, paperName: q.paperName, alYear: q.alYear, questions: [], latestId: q._id.toString() };
    }
    groupedPapers[key].questions.push(q);
    if (q._id.toString() > groupedPapers[key].latestId) {
      groupedPapers[key].latestId = q._id.toString();
    }
  });

  // Array එකක් බවට පත් කරලා අලුත්ම එක (latestId) අනුව පිළිවෙළට (Descending) සකසනවා
  const sortedPapers = Object.values(groupedPapers).sort((a, b) => b.latestId.localeCompare(a.latestId));

  // මුලින්ම ලෝඩ් වෙද්දී පළවෙනි (අලුත්ම) පේපර් එක ඔටෝ දිගහැරෙනවා
  useEffect(() => {
    if (sortedPapers.length > 0 && !expandedPaperKey) {
      setExpandedPaperKey(sortedPapers[0].key);
    }
  }, [sortedPapers, expandedPaperKey]);

  if (!isAuthorized) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><p className="font-bold text-slate-400">පද්ධතියට ඇතුළු වෙමින් පවතී...</p></div>;

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
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/attendance'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-lg transition text-gray-300 hover:text-white"><span>✅</span><span>පැමිණීම (Attendance)</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/videos'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-lg transition text-gray-300 hover:text-white"><span>📺</span><span>වීඩියෝ පාඩම්</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/tutes'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-lg transition text-gray-300 hover:text-white"><span>📚</span><span>නිබන්ධන</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/questions'); }} className="flex items-center space-x-3 bg-blue-600 px-4 py-3 rounded-lg text-white font-bold shadow-md"><span>📝</span><span>MCQ ප්‍රශ්න පත්‍ර</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/marks'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-lg transition text-gray-300 hover:text-white"><span>📊</span><span>ලකුණු ඇතුළත් කිරීම</span></a>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="bg-white shadow-sm p-4 flex items-center sticky top-0 z-30 border-b border-gray-200">
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 mr-4 text-slate-800 hover:bg-gray-100 rounded-lg transition"><span className="text-2xl font-bold">☰</span></button>
          <h1 className="text-xl font-bold text-slate-800">📝 MCQ ප්‍රශ්න පත්‍ර කළමනාකරණය</h1>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          <div className="bg-white p-8 rounded-3xl shadow-lg h-fit border-t-8 border-blue-600 sticky top-24 lg:col-span-1">
            <h2 className="text-2xl font-bold mb-6 text-center">{editingId ? '✏️ ප්‍රශ්නය සංස්කරණය' : '➕ ප්‍රශ්න පත්‍ර සෑදීම'}</h2>
            {msg && <p className={`p-3 rounded mb-4 font-bold text-center ${msg.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{msg}</p>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-xs font-bold mb-1">ප්‍රශ්න පත්‍රයේ නම</label>
                <input type="text" placeholder="උදා: 2026 Model Paper 01" className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:border-blue-500" required value={formData.paperName} onChange={(e) => setFormData({...formData, paperName: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-gray-700 text-xs font-bold mb-1">A/L වර්ෂය</label>
                <select className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:border-blue-500" value={formData.alYear} onChange={(e) => setFormData({...formData, alYear: e.target.value})}>
                  <option value="All">All Years</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-xs font-bold mb-1">ප්‍රශ්නය</label>
                <textarea placeholder="ප්‍රශ්නය..." className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:border-blue-500 min-h-[100px]" required value={formData.text} onChange={(e) => setFormData({...formData, text: e.target.value})} />
              </div>

              <div className="grid grid-cols-1 gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                <label className="block text-blue-800 text-xs font-bold mb-1">පිළිතුරු 5 ඇතුළත් කරන්න</label>
                {[1, 2, 3, 4, 5].map(i => (
                  <input key={i} type="text" placeholder={`පිළිතුර ${i}`} className="w-full p-2 border rounded-lg text-sm bg-white outline-none focus:border-blue-500 shadow-sm" required value={formData[`option${i}`]} onChange={(e) => setFormData({...formData, [`option${i}`]: e.target.value})} />
                ))}
              </div>

              <div>
                <label className="block text-gray-700 text-xs font-bold mb-1">නිවැරදි පිළිතුර</label>
                <select className="w-full p-3 border rounded-xl font-bold bg-green-50 outline-none focus:border-green-500 text-green-800" value={formData.correctAnswer} onChange={(e) => setFormData({...formData, correctAnswer: e.target.value})}>
                  {[1, 2, 3, 4, 5].map((n, i) => <option key={i} value={i}>{n} වන පිළිතුර නිවැරදිය</option>)}
                </select>
              </div>

              <button className={`w-full transition text-white p-4 rounded-xl font-bold shadow-md mt-2 ${editingId ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {editingId ? 'ප්‍රශ්නය යාවත්කාලීන කරන්න' : 'පද්ධතියට එක් කරන්න'}
              </button>

              {editingId && (
                <button type="button" onClick={() => {
                  setEditingId(null);
                  setFormData({ paperName: '', alYear: '2026', text: '', option1: '', option2: '', option3: '', option4: '', option5: '', correctAnswer: '0' });
                }} className="w-full mt-2 text-gray-500 font-bold hover:text-gray-700 text-sm">
                  සංස්කරණය අවලංගු කරන්න
                </button>
              )}
            </form>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {sortedPapers.length === 0 ? (
               <div className="bg-white p-10 rounded-3xl shadow-lg text-center text-gray-500"><span className="text-5xl block mb-4">📭</span>ප්‍රශ්න කිසිවක් නැත.</div>
            ) : (
              sortedPapers.map(paper => {
                const isAllHidden = paper.questions.every(q => !q.isVisible);
                const isExpanded = expandedPaperKey === paper.key; // මේ පේපර් එක දිගහැරලාද බලනවා

                return (
                  <div key={paper.key} className={`bg-white rounded-3xl shadow-md overflow-hidden border transition-all duration-300 ${isAllHidden ? 'border-gray-300 opacity-80' : 'border-blue-100'}`}>
                    
                    {/* Paper Header (ක්ලික් කළාම Minimize/Maximize වෙනවා) */}
                    <div 
                      className={`p-5 flex flex-wrap justify-between items-center border-b cursor-pointer transition-colors ${isExpanded ? (isAllHidden ? 'bg-gray-100' : 'bg-blue-50') : 'bg-white hover:bg-gray-50'}`}
                      onClick={() => setExpandedPaperKey(isExpanded ? null : paper.key)}
                    >
                      <div className="flex items-center gap-3">
                        {/* ඊතලය (Arrow Icon) */}
                        <span className={`text-slate-400 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>▼</span>
                        <div>
                          <h3 className={`text-xl font-bold flex items-center gap-2 ${isAllHidden ? 'text-gray-600' : 'text-blue-900'}`}>
                            <span className="text-2xl">📝</span> {paper.paperName}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="bg-white text-blue-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-blue-100">
                              {paper.alYear}
                            </span>
                            <span className="text-sm font-medium text-gray-500">
                              ප්‍රශ්න {paper.questions.length} ක්
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Header බොත්තම් (දිගහැරලා තියෙනකොට විතරක් පෙන්වන්නත් පුළුවන්, නැත්නම් හැමවෙලේම පෙන්වන්නත් පුළුවන්. මෙහි හැමවෙලේම පෙන්වයි) */}
                      <div className="flex gap-2 mt-4 sm:mt-0" onClick={(e) => e.stopPropagation()}>
                        {isAllHidden ? (
                          <button onClick={() => toggleEntirePaper(paper.paperName, paper.alYear, true)} className="bg-green-100 text-green-700 text-xs sm:text-sm font-bold px-3 py-2 rounded-lg hover:bg-green-200 transition shadow-sm border border-green-200 flex items-center gap-1">
                            👁️ සියල්ල පෙන්වන්න
                          </button>
                        ) : (
                          <button onClick={() => toggleEntirePaper(paper.paperName, paper.alYear, false)} className="bg-yellow-100 text-yellow-700 text-xs sm:text-sm font-bold px-3 py-2 rounded-lg hover:bg-yellow-200 transition shadow-sm border border-yellow-200 flex items-center gap-1">
                            🚫 සියල්ල සඟවන්න
                          </button>
                        )}
                        <button onClick={() => deleteEntirePaper(paper.paperName, paper.alYear)} className="bg-red-100 text-red-600 text-xs sm:text-sm font-bold px-3 py-2 rounded-lg hover:bg-red-200 transition shadow-sm border border-red-200 flex items-center gap-1">
                          🗑️ මකන්න
                        </button>
                      </div>
                    </div>

                    {/* ප්‍රශ්න ලැයිස්තුව (Maximize වෙලා තියෙනවා නම් විතරක් පෙන්වයි) */}
                    {isExpanded && (
                      <div className="p-6 space-y-4 bg-slate-50/50 animate-fade-in">
                        {paper.questions.map((q, idx) => (
                          <div key={q._id} className={`p-5 rounded-2xl border transition-all ${!q.isVisible ? 'bg-gray-100 opacity-60 grayscale border-gray-200' : 'bg-white shadow-sm hover:shadow-md border-blue-100'}`}>
                            <div className="flex justify-between items-start mb-3">
                              <span className="font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded text-sm">Q{idx + 1}</span>
                              
                              <div className="flex gap-2">
                                <button onClick={() => handleEdit(q)} className="text-xs font-bold px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all transform hover:scale-105 shadow-sm border border-blue-200">
                                  ✏️ Edit
                                </button>
                                <button onClick={() => toggleVisibility(q._id, q.isVisible)} className={`text-xs font-bold px-3 py-1 rounded transition-all transform hover:scale-105 shadow-sm border ${!q.isVisible ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 border-gray-300' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200'}`}>
                                  {q.isVisible ? '🚫 Hide' : '👁️ Show'}
                                </button>
                                <button onClick={() => deleteQuestion(q._id)} className="text-xs font-bold px-3 py-1 rounded bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-all transform hover:scale-105 shadow-sm border border-red-100">
                                  🗑️ Erase
                                </button>
                              </div>
                            </div>
                            
                            <p className={`font-semibold text-base mb-4 leading-relaxed ${!q.isVisible ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{q.text}</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                              {q.options.map((opt, optIdx) => (
                                <div key={optIdx} className={`text-sm px-3 py-2 rounded-lg border flex items-center gap-2 ${q.correctAnswer === optIdx ? 'bg-green-50 border-green-200 text-green-800 font-bold' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                                  <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs ${q.correctAnswer === optIdx ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>{optIdx + 1}</span>
                                  {opt}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>

        </div>
      </main>
    </div>
  );
}