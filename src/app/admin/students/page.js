"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import * as XLSX from 'xlsx'; 

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function AdminStudentsPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Add Mode: 'single' or 'bulk'
  const [addMode, setAddMode] = useState('single');

  // Single Form States
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', alYear: '2027', center: '',
    isTheory: true, isRevision: false, isPaper: false
  });

  // Bulk Form State (Excel)
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkSettings, setBulkSettings] = useState({
    password: '', alYear: '2027', center: '',
    isTheory: true, isRevision: false, isPaper: false
  });

  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  
  // Students Data
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [isFetchingStudents, setIsFetchingStudents] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('All');
  const [filterCenter, setFilterCenter] = useState('All');
  const [filterClass, setFilterClass] = useState('All');

  // Student Profile Modal States
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentMarks, setStudentMarks] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  // Edit Student States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editStudentData, setEditStudentData] = useState(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') setIsDarkMode(true);

    const adminToken = localStorage.getItem('isAdminLoggedIn');
    if (!adminToken) {
      router.push('/admin/login');
    } else {
      setIsAuthorized(true);
      fetchStudents();
    }
  }, [router]);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const fetchStudents = async () => {
    setIsFetchingStudents(true);
    try {
      const res = await fetch('/api/users?year=All', { cache: 'no-store' });
      const data = await res.json();
      if (data && data.users) {
        setStudents(data.users);
        setFilteredStudents(data.users);
      } else {
        setStudents([]);
        setFilteredStudents([]);
      }
    } catch (error) { 
      console.error("Error fetching students:", error); 
    } finally {
      setIsFetchingStudents(false);
    }
  };

  // Unique lists for Dropdowns
  const uniqueCenters = [...new Set(students.map(s => s.center).filter(Boolean))];
  const uniqueYears = [...new Set(students.map(s => s.alYear).filter(Boolean))].sort();

  // --- Search and Filter Logic ---
  useEffect(() => {
    let result = students;
    if (searchTerm) {
      result = result.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (filterYear !== 'All') {
      result = result.filter(s => s.alYear === filterYear);
    }
    if (filterCenter !== 'All') {
      result = result.filter(s => s.center === filterCenter);
    }
    if (filterClass !== 'All') {
      result = result.filter(s => s.classTypes && s.classTypes.includes(filterClass));
    }
    setFilteredStudents(result);
  }, [searchTerm, filterYear, filterCenter, filterClass, students]);

  // --- Export to Excel ---
  const exportToExcel = () => {
    if (filteredStudents.length === 0) {
      alert("දත්ත නොමැත!"); return;
    }
    const dataToExport = filteredStudents.map(s => ({
      "නම (Name)": s.name,
      "අංකය (Phone)": s.email,
      "වර්ෂය (Year)": s.alYear,
      "මධ්‍යස්ථානය (Center)": s.center,
      "පන්ති වර්ගය (Classes)": s.classTypes?.join(', '),
      "තත්ත්වය (Status)": s.status === 'Active' ? 'Active' : 'Inactive'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "PramodaChemistry_Students.xlsx");
  };

  // --- Single Student Submit ---
  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    const classes = [];
    if (formData.isTheory) classes.push('Theory');
    if (formData.isRevision) classes.push('Revision');
    if (formData.isPaper) classes.push('Paper');

    if (classes.length === 0) {
      setMsg({ type: 'error', text: 'අවම වශයෙන් එක් පන්ති වර්ගයක් හෝ තෝරන්න!' });
      setLoading(false); return;
    }

    try {
      const payload = {
        name: formData.name, email: formData.email, password: formData.password,
        alYear: formData.alYear, center: formData.center, classTypes: classes
      };

      const res = await fetch('/api/users', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: 'සිසුවා සාර්ථකව පද්ධතියට එක් කළා! ✅' });
        // 🔴 Form එක සම්පූර්ණයෙන්ම Reset කිරීම
        setFormData({ 
          name: '', email: '', password: '', 
          alYear: formData.alYear, center: formData.center, 
          isTheory: true, isRevision: false, isPaper: false 
        });
        fetchStudents(); 
      } else { throw new Error(data.message || 'දෝෂයක් මතු විය.'); }
    } catch (error) {
      setMsg({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    }
  };

  // --- Excel Bulk Submit ---
  const handleExcelBulkSubmit = async (e) => {
    e.preventDefault();
    if (!bulkFile) {
      setMsg({ type: 'error', text: 'කරුණාකර Excel ෆයිල් එකක් තෝරන්න!' });
      return;
    }

    setLoading(true);
    setMsg({ type: '', text: '' });

    const classes = [];
    if (bulkSettings.isTheory) classes.push('Theory');
    if (bulkSettings.isRevision) classes.push('Revision');
    if (bulkSettings.isPaper) classes.push('Paper');

    if (classes.length === 0) {
      setMsg({ type: 'error', text: 'අවම වශයෙන් එක් පන්ති වර්ගයක් හෝ තෝරන්න!' });
      setLoading(false); return;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length < 2) continue; 

          const name = String(row[0]).trim();
          const phone = String(row[1]).trim();

          if (name.toLowerCase() === 'name' || phone.toLowerCase().includes('phone') || phone.toLowerCase().includes('number')) {
            continue;
          }

          if (!name || !phone) continue;

          try {
            const res = await fetch('/api/users', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                name, 
                email: phone, 
                password: bulkSettings.password, 
                alYear: bulkSettings.alYear, 
                center: bulkSettings.center, 
                classTypes: classes 
              })
            });
            if (res.ok) successCount++; else errorCount++;
          } catch (err) { errorCount++; }
        }

        setMsg({ type: 'success', text: `සාර්ථකයි: ${successCount} | දැනටමත් ඇත/අසාර්ථකයි: ${errorCount}` });
        setBulkFile(null); 
        setBulkSettings({ ...bulkSettings, password: '' });
        fetchStudents();
      } catch (err) {
        console.error(err);
        setMsg({ type: 'error', text: 'Excel ෆයිල් එක කියවීමේදී දෝෂයක් මතු විය.' });
      } finally {
        setLoading(false);
        setTimeout(() => setMsg({ type: '', text: '' }), 5000);
      }
    };
    reader.readAsArrayBuffer(bulkFile);
  };

  // --- Edit Student Logic ---
  const openEditModal = (student) => {
    setEditStudentData({
      id: student._id,
      name: student.name,
      email: student.email,
      password: '',
      alYear: student.alYear || '2027',
      center: student.center || '',
      isTheory: student.classTypes?.includes('Theory') || false,
      isRevision: student.classTypes?.includes('Revision') || false,
      isPaper: student.classTypes?.includes('Paper') || false,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const classes = [];
    if (editStudentData.isTheory) classes.push('Theory');
    if (editStudentData.isRevision) classes.push('Revision');
    if (editStudentData.isPaper) classes.push('Paper');

    try {
      const payload = {
        id: editStudentData.id,
        name: editStudentData.name,
        email: editStudentData.email,
        alYear: editStudentData.alYear,
        center: editStudentData.center,
        classTypes: classes
      };
      if (editStudentData.password) {
        payload.password = editStudentData.password;
      }

      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // 🔴 නිවැරදි Error Handling
      if (res.ok) {
        alert('සිසුවාගේ දත්ත යාවත්කාලීන විය! ✅');
        setIsEditModalOpen(false);
        fetchStudents();
      } else {
        let errorMsg = 'දෝෂයක් මතු විය.';
        try {
          const data = await res.json();
          errorMsg = data.message || errorMsg;
        } catch (e) {
          errorMsg = `Server Error: Backend API (PUT route) එක සම්බන්ධ වීමේ ගැටලුවක්.`;
        }
        throw new Error(errorMsg);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleStudentStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      await fetch('/api/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: newStatus }) });
      fetchStudents();
    } catch (error) { console.error(error); }
  };

  const deleteStudent = async (id) => {
    if (confirm('මෙම සිසුවාගේ ගිණුම සදහටම මකා දැමීමට අවශ්‍යද?')) {
      try {
        await fetch('/api/users', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
        fetchStudents();
      } catch (error) { console.error(error); }
    }
  };

  const openStudentProfile = async (student) => {
    setSelectedStudent(student);
    setModalLoading(true);
    setStudentMarks([]);
    try {
      const res = await fetch(`/api/marks?email=${student.email}`);
      const data = await res.json();
      if (data.marks) setStudentMarks(data.marks);
    } catch (error) { console.error("Error fetching marks:", error); } 
    finally { setModalLoading(false); }
  };

  const chartLabels = studentMarks.map(m => m.paperName);
  const chartScores = studentMarks.map(m => m.score);
  const chartData = {
    labels: chartLabels.length > 0 ? chartLabels : ['දත්ත නැත'],
    datasets: [{
      label: 'ලකුණු (%)',
      data: chartScores.length > 0 ? chartScores : [0],
      borderColor: '#2563EB', 
      backgroundColor: isDarkMode ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)',
      borderWidth: 2, pointBackgroundColor: '#FACC15', fill: true, tension: 0.4
    }]
  };

  const bgMain = isDarkMode ? "bg-slate-950 text-slate-100" : "bg-gray-100 text-gray-800";
  const bgCard = isDarkMode ? "bg-slate-900 border border-slate-800 shadow-none" : "bg-white border-transparent shadow-lg";
  const textMuted = isDarkMode ? "text-slate-400" : "text-gray-500";
  const headerBg = isDarkMode ? "bg-slate-900 border-b border-slate-800" : "bg-white shadow-sm border-b border-gray-200";
  const inputBg = isDarkMode ? "bg-slate-800 border-slate-700 text-white focus:ring-blue-500/50" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500";

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
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/students'); }} className="flex items-center space-x-3 bg-blue-600 px-4 py-3 rounded-xl text-white font-bold shadow-md"><span>👥</span><span>සිසුන් කළමනාකරණය</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/attendance'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-xl transition text-gray-300 hover:text-white"><span>✅</span><span>පැමිණීම (Attendance)</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/videos'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-xl transition text-gray-300 hover:text-white"><span>📺</span><span>වීඩියෝ පාඩම්</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/tutes'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-xl transition text-gray-300 hover:text-white"><span>📚</span><span>නිබන්ධන</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/questions'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-xl transition text-gray-300 hover:text-white"><span>📝</span><span>MCQ ප්‍රශ්න පත්‍ර</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin/marks'); }} className="flex items-center space-x-3 hover:bg-slate-800 px-4 py-3 rounded-xl transition text-gray-300 hover:text-white"><span>📊</span><span>ලකුණු ඇතුළත් කිරීම</span></a>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative scroll-smooth">
        <header className={`${headerBg} p-4 flex justify-between items-center sticky top-0 z-30 transition-colors duration-300`}>
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className={`md:hidden p-2 mr-4 rounded-lg transition ${isDarkMode ? 'text-white hover:bg-slate-800' : 'text-slate-800 hover:bg-gray-100'}`}><span className="text-2xl font-bold">☰</span></button>
            <h1 className="text-xl font-bold">👥 සිසුන් කළමනාකරණය</h1>
          </div>
          <button onClick={toggleTheme} className={`p-2 rounded-full transition-all focus:outline-none ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}>
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* වම් පැත්ත: Add Student Form (Single / Bulk) */}
            <div className="lg:col-span-1">
              <div className={`${bgCard} p-8 rounded-3xl border-t-8 border-t-blue-500 h-fit sticky top-24`}>
                
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">➕ සිසුන් එකතු කිරීම</h2>
                </div>

                <div className={`flex rounded-xl p-1 mb-6 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                  <button onClick={() => setAddMode('single')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${addMode === 'single' ? 'bg-white text-blue-600 shadow-sm' : (isDarkMode ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-800')}`}>
                    Single Add
                  </button>
                  <button onClick={() => setAddMode('bulk')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${addMode === 'bulk' ? 'bg-white text-blue-600 shadow-sm' : (isDarkMode ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-800')}`}>
                    Excel Bulk Upload
                  </button>
                </div>

                {msg.text && <div className={`p-3 mb-4 rounded-lg text-sm font-bold text-center ${msg.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{msg.text}</div>}

                {/* --- Single Add Form --- */}
                {addMode === 'single' && (
                  <form onSubmit={handleSingleSubmit} className="space-y-4 animate-fade-in">
                    <div>
                      <label className={`block text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>සිසුවාගේ නම</label>
                      <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={`w-full px-4 py-3 rounded-xl border outline-none transition ${inputBg}`}/>
                    </div>
                    <div>
                      <label className={`block text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>WhatsApp අංකය</label>
                      <input type="text" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className={`w-full px-4 py-3 rounded-xl border outline-none transition ${inputBg}`} placeholder="0712345678" />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>මුරපදය (Password)</label>
                      <input type="text" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className={`w-full px-4 py-3 rounded-xl border outline-none transition ${inputBg}`}/>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>A/L වර්ෂය</label>
                        <select value={formData.alYear} onChange={(e) => setFormData({...formData, alYear: e.target.value})} className={`w-full px-3 py-3 rounded-xl border outline-none transition ${inputBg}`}>
                          <option value="2027">2027</option>
                          <option value="2028">2028</option>
                        </select>
                      </div>
                      <div>
                        <label className={`block text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>මධ්‍යස්ථානය</label>
                        <input list="center-options" type="text" required value={formData.center} onChange={(e) => setFormData({...formData, center: e.target.value})} className={`w-full px-3 py-3 rounded-xl border outline-none transition ${inputBg}`} placeholder="උදා: මතුගම"/>
                        <datalist id="center-options">
                          {uniqueCenters.map((c, i) => <option key={i} value={c} />)}
                        </datalist>
                      </div>
                    </div>

                    <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-blue-50/50 border-blue-100'}`}>
                      <label className={`block text-xs font-bold mb-3 ${isDarkMode ? 'text-blue-400' : 'text-blue-800'}`}>පන්ති වර්ගය (Revision පමණක් අවශ්‍ය නම් Theory ඉවත් කරන්න):</label>
                      <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={formData.isTheory} onChange={(e) => setFormData({...formData, isTheory: e.target.checked})} className="w-5 h-5 accent-blue-600 rounded" />
                          <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>Theory</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={formData.isRevision} onChange={(e) => setFormData({...formData, isRevision: e.target.checked})} className="w-5 h-5 accent-blue-600 rounded" />
                          <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>Revision</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={formData.isPaper} onChange={(e) => setFormData({...formData, isPaper: e.target.checked})} className="w-5 h-5 accent-blue-600 rounded" />
                          <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>Paper Class</span>
                        </label>
                      </div>
                    </div>

                    <button type="submit" disabled={loading} className={`w-full text-white font-bold rounded-xl px-4 py-4 shadow-md transition mt-4 ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                      {loading ? 'රැඳී සිටින්න...' : 'සිසුවා ලියාපදිංචි කරන්න'}
                    </button>
                  </form>
                )}

                {/* --- Excel Bulk Add Form --- */}
                {addMode === 'bulk' && (
                  <form onSubmit={handleExcelBulkSubmit} className="space-y-4 animate-fade-in">
                    <div className={`p-3 rounded-lg border text-xs leading-relaxed mb-4 ${isDarkMode ? 'bg-blue-900/20 border-blue-800 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                      <strong>උපදෙස්:</strong> Excel (.xlsx, .csv) ෆයිල් එකක් තෝරන්න. <br/><br/>
                      පළමු තීරුවේ (Column A) <strong>නම</strong> සහ දෙවන තීරුවේ (Column B) <strong>WhatsApp අංකය</strong> පමණක් තිබිය යුතුය. අනිත් සියලු විස්තර පහතින් තෝරා දෙන්න.
                    </div>
                    
                    <div>
                      <label className={`block text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Excel ෆයිල් එක තෝරන්න</label>
                      <input type="file" accept=".xlsx, .xls, .csv" onChange={(e) => setBulkFile(e.target.files[0])} className={`w-full px-4 py-3 rounded-xl border outline-none transition bg-white text-gray-900 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'border-gray-200'}`} required />
                    </div>

                    <div>
                      <label className={`block text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>පොදු මුරපදය (Password)</label>
                      <input type="text" required value={bulkSettings.password} onChange={(e) => setBulkSettings({...bulkSettings, password: e.target.value})} className={`w-full px-4 py-3 rounded-xl border outline-none transition ${inputBg}`} placeholder="සියලු සිසුන් සඳහා එකම මුරපදය"/>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>A/L වර්ෂය</label>
                        <select value={bulkSettings.alYear} onChange={(e) => setBulkSettings({...bulkSettings, alYear: e.target.value})} className={`w-full px-3 py-3 rounded-xl border outline-none transition ${inputBg}`}>
                          <option value="2027">2027</option>
                          <option value="2028">2028</option>
                        </select>
                      </div>
                      <div>
                        <label className={`block text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>මධ්‍යස්ථානය</label>
                        <input list="center-options" type="text" required value={bulkSettings.center} onChange={(e) => setBulkSettings({...bulkSettings, center: e.target.value})} className={`w-full px-3 py-3 rounded-xl border outline-none transition ${inputBg}`} placeholder="උදා: මතුගම"/>
                      </div>
                    </div>

                    <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-blue-50/50 border-blue-100'}`}>
                      <label className={`block text-xs font-bold mb-3 ${isDarkMode ? 'text-blue-400' : 'text-blue-800'}`}>පන්ති වර්ගය (සියලු සිසුන් සඳහා):</label>
                      <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={bulkSettings.isTheory} onChange={(e) => setBulkSettings({...bulkSettings, isTheory: e.target.checked})} className="w-5 h-5 accent-blue-600 rounded" />
                          <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>Theory</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={bulkSettings.isRevision} onChange={(e) => setBulkSettings({...bulkSettings, isRevision: e.target.checked})} className="w-5 h-5 accent-blue-600 rounded" />
                          <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>Revision</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={bulkSettings.isPaper} onChange={(e) => setBulkSettings({...bulkSettings, isPaper: e.target.checked})} className="w-5 h-5 accent-blue-600 rounded" />
                          <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>Paper Class</span>
                        </label>
                      </div>
                    </div>

                    <button type="submit" disabled={loading} className={`w-full text-white font-bold rounded-xl px-4 py-4 shadow-md transition mt-4 ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                      {loading ? 'රැඳී සිටින්න...' : 'Excel දත්ත ඇතුළත් කරන්න'}
                    </button>
                  </form>
                )}

              </div>
            </div>

            {/* දකුණු පැත්ත: Student List & Filters */}
            <div className="lg:col-span-2">
              <div className={`${bgCard} p-6 rounded-3xl min-h-[500px] h-full flex flex-col`}>
                
                <h2 className={`text-xl font-bold mb-4 border-b pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 ${isDarkMode ? 'border-slate-800' : 'border-gray-200'}`}>
                  <div className="flex items-center">
                    <span className="mr-2">🎓</span> ලියාපදිංචි සිසුන්
                    <span className={`ml-3 text-xs px-2 py-1 rounded-full font-bold ${isDarkMode ? 'bg-slate-800 text-blue-400' : 'bg-blue-100 text-blue-800'}`}>{filteredStudents.length}</span>
                  </div>
                  <button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 shadow-md">
                    <span>📊</span> Export to Excel
                  </button>
                </h2>
                
                {/* --- Search & Filters --- */}
                <div className={`mb-6 grid grid-cols-1 md:grid-cols-4 gap-3 p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-blue-50/50 border-blue-100'}`}>
                  
                  <div className="md:col-span-4 relative">
                    <span className="absolute left-3 top-3 opacity-50">🔍</span>
                    <input 
                      type="text" 
                      placeholder="නමෙන් සොයන්න..." 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none text-sm transition ${inputBg}`} 
                    />
                  </div>
                  
                  <div>
                    <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className={`w-full px-3 py-2.5 rounded-xl border outline-none text-sm transition cursor-pointer ${inputBg}`}>
                      <option value="All">සියලුම වර්ෂ</option>
                      {uniqueYears.map((y, i) => <option key={i} value={y}>{y}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <select value={filterCenter} onChange={(e) => setFilterCenter(e.target.value)} className={`w-full px-3 py-2.5 rounded-xl border outline-none text-sm transition cursor-pointer ${inputBg}`}>
                      <option value="All">සියලුම මධ්‍යස්ථාන</option>
                      {uniqueCenters.map((c, i) => <option key={i} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className={`w-full px-3 py-2.5 rounded-xl border outline-none text-sm transition cursor-pointer ${inputBg}`}>
                      <option value="All">සියලුම පන්ති වර්ග</option>
                      <option value="Theory">Theory</option>
                      <option value="Revision">Revision</option>
                      <option value="Paper">Paper</option>
                    </select>
                  </div>

                </div>
                
                {/* --- Student List Render --- */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                  {isFetchingStudents ? (
                    <div className={`text-center py-20 ${textMuted}`}>සිසුන්ගේ දත්ත ලබාගනිමින් පවතී...</div>
                  ) : filteredStudents.length === 0 ? (
                    <div className={`text-center py-20 ${textMuted}`}><span className="text-5xl block mb-4 opacity-50">📭</span>සෙවුමට අදාළ සිසුන් නොමැත.</div>
                  ) : (
                    filteredStudents.map((student) => (
                      <div key={student._id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl border transition-all ${student.status === 'Inactive' ? (isDarkMode ? 'bg-slate-900/50 border-slate-800 opacity-60 grayscale' : 'bg-gray-50 border-gray-200 opacity-60 grayscale') : (isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-blue-100 shadow-sm hover:shadow-md')}`}>
                        
                        <div className="flex-1 mb-4 sm:mb-0 w-full overflow-hidden cursor-pointer" onClick={() => openStudentProfile(student)}>
                          <h3 className={`font-bold text-lg hover:underline decoration-blue-500 ${student.status === 'Inactive' ? (isDarkMode ? 'text-slate-500 line-through' : 'text-gray-500 line-through') : (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                            {student.name}
                          </h3>
                          <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                            📞 {student.email} | 🏛️ {student.center} | 🎓 {student.alYear}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {student.classTypes?.map((cls, i) => (
                              <span key={i} className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isDarkMode ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>{cls}</span>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                          <button onClick={() => openEditModal(student)} className={`flex-1 sm:flex-none px-3 py-2 rounded-xl font-bold text-xs transition-all shadow-sm ${isDarkMode ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 border border-blue-900/50' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>
                            ✏️ Edit
                          </button>
                          <button onClick={() => toggleStudentStatus(student._id, student.status)} className={`flex-1 sm:flex-none px-3 py-2 rounded-xl font-bold text-xs transition-all shadow-sm ${student.status === 'Inactive' ? (isDarkMode ? 'bg-green-900/30 text-green-500 hover:bg-green-900/50 border border-green-900/50' : 'bg-green-100 text-green-700 hover:bg-green-200') : (isDarkMode ? 'bg-yellow-900/30 text-yellow-500 hover:bg-yellow-900/50 border border-yellow-900/50' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200')}`}>
                            {student.status === 'Inactive' ? '✔️ Activate' : '🚫 Deactivate'}
                          </button>
                          <button onClick={() => deleteStudent(student._id)} className={`flex-1 sm:flex-none px-3 py-2 rounded-xl font-bold text-xs transition-all shadow-sm ${isDarkMode ? 'bg-red-900/30 text-red-500 hover:bg-red-900/50 border border-red-900/50' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}>
                            🗑️ Delete
                          </button>
                        </div>

                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* --- Edit Student Modal --- */}
          {isEditModalOpen && editStudentData && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity animate-fade-in">
              <div className={`relative w-full max-w-lg overflow-y-auto p-6 md:p-8 rounded-3xl shadow-2xl ${isDarkMode ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white text-gray-900'}`}>
                
                <button onClick={() => setIsEditModalOpen(false)} className={`absolute top-4 right-4 p-2 rounded-full font-bold text-xl ${isDarkMode ? 'bg-slate-800 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-600 hover:text-red-500'}`}>✖</button>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">✏️ සිසුවා යාවත්කාලීන කිරීම</h2>

                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>සිසුවාගේ නම</label>
                    <input type="text" required value={editStudentData.name} onChange={(e) => setEditStudentData({...editStudentData, name: e.target.value})} className={`w-full px-4 py-3 rounded-xl border outline-none transition ${inputBg}`}/>
                  </div>
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>WhatsApp අංකය</label>
                    <input type="text" required value={editStudentData.email} onChange={(e) => setEditStudentData({...editStudentData, email: e.target.value})} className={`w-full px-4 py-3 rounded-xl border outline-none transition ${inputBg}`} />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>නව මුරපදය (වෙනස් නොකරන්නේ නම් හිස්ව තබන්න)</label>
                    <input type="text" value={editStudentData.password} onChange={(e) => setEditStudentData({...editStudentData, password: e.target.value})} className={`w-full px-4 py-3 rounded-xl border outline-none transition ${inputBg}`} placeholder="*********"/>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>A/L වර්ෂය</label>
                      <select value={editStudentData.alYear} onChange={(e) => setEditStudentData({...editStudentData, alYear: e.target.value})} className={`w-full px-3 py-3 rounded-xl border outline-none transition ${inputBg}`}>
                        <option value="2027">2027</option>
                        <option value="2028">2028</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>මධ්‍යස්ථානය</label>
                      <input list="center-options" type="text" required value={editStudentData.center} onChange={(e) => setEditStudentData({...editStudentData, center: e.target.value})} className={`w-full px-3 py-3 rounded-xl border outline-none transition ${inputBg}`} />
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-blue-50/50 border-blue-100'}`}>
                    <label className={`block text-xs font-bold mb-3 ${isDarkMode ? 'text-blue-400' : 'text-blue-800'}`}>පන්ති වර්ගය:</label>
                    <div className="flex flex-col gap-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={editStudentData.isTheory} onChange={(e) => setEditStudentData({...editStudentData, isTheory: e.target.checked})} className="w-5 h-5 accent-blue-600 rounded" />
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>Theory</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={editStudentData.isRevision} onChange={(e) => setEditStudentData({...editStudentData, isRevision: e.target.checked})} className="w-5 h-5 accent-blue-600 rounded" />
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>Revision</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={editStudentData.isPaper} onChange={(e) => setEditStudentData({...editStudentData, isPaper: e.target.checked})} className="w-5 h-5 accent-blue-600 rounded" />
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>Paper Class</span>
                      </label>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className={`w-full text-white font-bold rounded-xl px-4 py-4 shadow-md transition mt-4 ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                    {loading ? 'රැඳී සිටින්න...' : 'යාවත්කාලීන කරන්න'}
                  </button>
                </form>

              </div>
            </div>
          )}

          {/* --- Student Profile Modal --- */}
          {selectedStudent && !isEditModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity animate-fade-in">
              <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-8 rounded-3xl shadow-2xl ${isDarkMode ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white text-gray-900'}`}>
                
                <button onClick={() => setSelectedStudent(null)} className={`absolute top-4 right-4 p-2 rounded-full font-bold text-xl ${isDarkMode ? 'bg-slate-800 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-600 hover:text-red-500'}`}>✖</button>
                
                <div className="flex items-center gap-4 mb-6 border-b pb-6 border-opacity-20">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-500 flex items-center justify-center text-2xl font-bold text-white shadow-md">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black leading-tight">{selectedStudent.name}</h2>
                    <p className={`text-sm font-medium mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      {selectedStudent.alYear} A/L | {selectedStudent.center} | {selectedStudent.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-blue-50/30 border-blue-100'}`}>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">📊 ලකුණු ප්‍රගතිය</h3>
                    {modalLoading ? (
                      <div className="h-48 flex items-center justify-center">Loading...</div>
                    ) : studentMarks.length === 0 ? (
                      <div className="h-48 flex items-center justify-center text-sm opacity-50">දත්ත නොමැත</div>
                    ) : (
                      <div className="h-48 w-full">
                        <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { display: true, min: 0, max: 100 } } }} />
                      </div>
                    )}
                  </div>

                  <div className={`p-5 rounded-2xl border flex flex-col h-full max-h-[300px] ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">📝 ලබාගත් ලකුණු</h3>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                      {studentMarks.length === 0 ? (
                        <p className="text-sm opacity-50 text-center mt-4">විභාග සඳහා පෙනී සිට නොමැත.</p>
                      ) : (
                        studentMarks.map(m => (
                          <div key={m._id} className={`flex justify-between items-center p-3 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-200 shadow-sm'}`}>
                            <div className="truncate pr-2">
                              <h4 className="text-sm font-bold truncate">{m.paperName}</h4>
                              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${m.examType === 'Online' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{m.examType}</span>
                            </div>
                            <span className={`text-lg font-black ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{m.score}%</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}