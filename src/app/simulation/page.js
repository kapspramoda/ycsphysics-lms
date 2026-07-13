"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SimulationPage() {
  const router = useRouter();
  
  // --- States ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [activeSim, setActiveSim] = useState(null); // දැනට තෝරාගෙන ඇති Simulation එක

  // A/L සිලබස් එකට ගැලපෙන PhET Simulations ලැයිස්තුව
  const simulationsList = [
    { 
      id: 1, 
      title: 'වායු හැසිරීම (Gases Intro)', 
      description: 'වායු අංශු හැසිරෙන ආකාරය, උෂ්ණත්වය සහ පීඩනය අතර සම්බන්ධය.',
      url: 'https://phet.colorado.edu/sims/html/gases-intro/latest/gases-intro_en.html', 
      icon: '💨',
      color: 'bg-blue-50 border-blue-200 text-blue-700'
    },
    { 
      id: 2, 
      title: 'පරමාණුවක් ගොඩනගමු (Build an Atom)', 
      description: 'ප්‍රෝටෝන, නියුට්‍රෝන හා ඉලෙක්ට්‍රෝන මගින් පරමාණු සහ අයන සෑදීම.',
      url: 'https://phet.colorado.edu/sims/html/build-an-atom/latest/build-an-atom_en.html', 
      icon: '⚛️',
      color: 'bg-indigo-50 border-indigo-200 text-indigo-700'
    },
    { 
      id: 3, 
      title: 'රසායනික සමීකරණ තුලනය', 
      description: 'ප්‍රතික්‍රියක සහ ඵල අතර පරමාණු ගණන තුලනය කිරීම.',
      url: 'https://phet.colorado.edu/sims/html/balancing-chemical-equations/latest/balancing-chemical-equations_en.html', 
      icon: '⚖️',
      color: 'bg-green-50 border-green-200 text-green-700'
    },
    { 
      id: 4, 
      title: 'අම්ල හා භෂ්ම ද්‍රාවණ', 
      description: 'ප්‍රබල සහ දුර්වල අම්ල/භෂ්ම වල විඝටනය සහ සන්නායකතාව.',
      url: 'https://phet.colorado.edu/sims/html/acid-base-solutions/latest/acid-base-solutions_en.html', 
      icon: '🧪',
      color: 'bg-red-50 border-red-200 text-red-700'
    },
    { 
      id: 5, 
      title: 'pH පරිමාණය (pH Scale)', 
      description: 'විවිධ ද්‍රාවණ වල pH අගය මැනීම සහ ද්‍රාවණ තනුක කිරීම.',
      url: 'https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale_en.html', 
      icon: '💧',
      color: 'bg-cyan-50 border-cyan-200 text-cyan-700'
    },
    { 
      id: 6, 
      title: 'ද්‍රාවණ වල සාන්ද්‍රණය', 
      description: 'ද්‍රාව්‍ය සහ ද්‍රාවක ප්‍රමාණය වෙනස් කරමින් සාන්ද්‍රණය මැනීම.',
      url: 'https://phet.colorado.edu/sims/html/concentration/latest/concentration_en.html', 
      icon: '🧫',
      color: 'bg-purple-50 border-purple-200 text-purple-700'
    },
    { 
      id: 7, 
      title: 'වායු ගුණ (Gas Properties)', 
      description: 'කදිම වායු නියමය (PV=nRT), පරිමාව සහ පීඩනය.',
      url: 'https://phet.colorado.edu/sims/html/gas-properties/latest/gas-properties_en.html', 
      icon: '🎈',
      color: 'bg-orange-50 border-orange-200 text-orange-700'
    },
    { 
      id: 8, 
      title: 'සමස්ථානික සහ පරමාණුක ස්කන්ධය', 
      description: 'මූලද්‍රව්‍ය වල සමස්ථානික සහ ඒවායේ සාපේක්ෂ පරමාණුක ස්කන්ධ.',
      url: 'https://phet.colorado.edu/sims/html/isotopes-and-atomic-mass/latest/isotopes-and-atomic-mass_en.html', 
      icon: '📊',
      color: 'bg-teal-50 border-teal-200 text-teal-700'
    },
    // අලුතින් එකතු කළ Simulation දෙක පහතින් ඇත
    { 
      id: 9, 
      title: 'රදර්ෆර්ඩ් පරීක්ෂණය', 
      description: 'ඇල්ෆා අංශු රන් පත්‍රයක ගැටී විසිරෙන ආකාරය සහ න්‍යෂ්ටියේ ස්වභාවය.',
      url: 'https://phet.colorado.edu/sims/html/rutherford-scattering/latest/rutherford-scattering_en.html', 
      icon: '🎯',
      color: 'bg-rose-50 border-rose-200 text-rose-700'
    },
    { 
      id: 10, 
      title: 'අණුක හැඩ (VSEPR)', 
      description: 'VSEPR වාදය අනුව අණු වල ත්‍රිමාන හැඩය සහ බන්ධන කෝණ.',
      url: 'https://phet.colorado.edu/sims/html/molecule-shapes/latest/molecule-shapes_en.html', 
      icon: '💠',
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700'
    }
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/auth');
      return;
    }
    const userObj = JSON.parse(storedUser);
    setUserName(userObj.name);
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
        <div onClick={() => router.push('/')} className="p-6 border-b border-blue-800 font-bold text-xl tracking-wider cursor-pointer hover:opacity-80 transition">
          Pramoda<span className="text-blue-300">Chemistry</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/dashboard'); }} className="flex items-center space-x-3 hover:bg-blue-800 px-4 py-3 rounded-lg transition">
            <span className="text-xl">🏠</span><span className="font-medium">මුල් තිරය</span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/videos'); }} className="flex items-center space-x-3 hover:bg-blue-800 px-4 py-3 rounded-lg transition">
            <span className="text-xl">📺</span><span className="font-medium">වීඩියෝ පාඩම්</span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveSim(null); router.push('/simulation'); }} className="flex items-center space-x-3 bg-blue-800 px-4 py-3 rounded-lg transition border-l-4 border-blue-400">
            <span className="text-xl">🧪</span><span className="font-bold text-blue-100">Simulations</span>
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
        </nav>
        <div className="p-4 border-t border-blue-800">
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 hover:bg-red-500/20 p-3 rounded-lg transition text-blue-200 hover:text-red-400">
            <span className="font-bold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex items-center justify-between z-30 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition">
              <span className="text-2xl font-bold">☰</span>
            </button>
            <h1 className="text-xl font-extrabold text-blue-900 flex items-center gap-2">
              <span className="text-2xl hidden sm:block">🧪</span> 
              {activeSim ? activeSim.title : 'Virtual Laboratory'}
            </h1>
          </div>
          
          {/* Simulation එකක් ඇතුළේ ඉන්නවා නම් ආපසු යන්න බොත්තම */}
          {activeSim && (
            <button 
              onClick={() => setActiveSim(null)}
              className="bg-red-50 text-red-600 font-bold px-4 py-2 rounded-lg hover:bg-red-100 transition border border-red-200 shadow-sm flex items-center gap-2"
            >
              <span>⬅️</span> ලැයිස්තුවට යන්න
            </button>
          )}
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6 w-full">
          
          {!activeSim ? (
            /* --- Simulation ලැයිස්තුව (Dashboard) --- */
            <div className="max-w-7xl mx-auto animate-fade-in pb-10">
              <div className="bg-white rounded-3xl p-8 mb-8 border border-blue-100 shadow-sm text-center">
                <span className="text-5xl block mb-4">🥼</span>
                <h2 className="text-2xl font-bold text-blue-900 mb-2">Pramoda Chemistry අතථ්‍ය විද්‍යාගාරය</h2>
                <p className="text-slate-600 max-w-2xl mx-auto">
                  පහත ඇති පරීක්ෂණ වලින් එකක් තෝරාගෙන, විවිධ අගයන් වෙනස් කරමින් අංශු හැසිරෙන ආකාරය අධ්‍යයනය කරන්න.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {simulationsList.map((sim) => (
                  <div 
                    key={sim.id} 
                    onClick={() => setActiveSim(sim)}
                    className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                  >
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-4 border ${sim.color} group-hover:scale-110 transition-transform`}>
                      {sim.icon}
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg mb-2 leading-tight">{sim.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{sim.description}</p>
                    <div className="mt-4 text-blue-600 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                      පරීක්ෂණය අරඹන්න <span>→</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* --- Simulation එක ඇතුළේ පෙන්වන Iframe එක --- */
            <div className="w-full h-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in relative">
              {/* Loading Indicator (Simulation එක Load වෙනකම්) */}
              <div className="absolute inset-0 flex items-center justify-center -z-10 bg-slate-50">
                 <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
              </div>
              <iframe 
                src={activeSim.url}
                width="100%" 
                height="100%" 
                allowFullScreen
                title={activeSim.title}
                className="border-0 w-full h-full relative z-10"
              ></iframe>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}