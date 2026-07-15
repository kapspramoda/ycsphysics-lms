"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  
  // --- Sidebar States ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('');

  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(null);

  // Password Change States
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/auth');
    } else {
      const userObj = JSON.parse(storedUser);
      setUser(userObj);
      setUserName(userObj.name);

      const storedAvatar = localStorage.getItem('userAvatar');
      if (storedAvatar) setAvatar(storedAvatar);
    }
  }, [router]);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('user');
    router.push('/auth');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 300; 
          const MAX_HEIGHT = 300; 
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

          try {
            setAvatar(dataUrl);
            localStorage.setItem('userAvatar', dataUrl);
          } catch (error) {
            alert("කරුණාකර මීට වඩා ප්‍රමාණයෙන් (Size) කුඩා ඡායාරූපයක් තෝරන්න.");
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (passwords.new !== passwords.confirm) {
      setMessage({ type: 'error', text: 'අලුත් මුරපදයන් දෙක එකිනෙකට නොගැලපේ!' });
      return;
    }

    if (passwords.new.length < 6) {
      setMessage({ type: 'error', text: 'අලුත් මුරපදය අකුරු 6කට වඩා වැඩි විය යුතුය.' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username, 
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setMessage({ type: 'success', text: 'මුරපදය සාර්ථකව වෙනස් කරන ලදී! ✅' });
      setPasswords({ current: '', new: '', confirm: '' }); 

    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  // මෙන්න මේ ආරක්ෂිත කේතය තමයි අලුතින් දැම්මේ.
  // user දත්ත නැත්නම් Error එන්නේ නැතුව Loading එකක් පෙන්වනවා.
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-purple-600 bg-gray-50">ගිණුම පරීක්ෂා කරමින් පවතී... ⏳</div>;
  }

  return (
    <div className="bg-gray-50 font-sans text-gray-800 flex h-screen overflow-hidden">
      
      {/* Mobile Overlay */}
      <div className={`fixed inset-0 bg-black/50 z-40 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setIsSidebarOpen(false)}></div>

      {/* Sidebar Navigation */}
      <aside className={`w-64 bg-purple-900 text-white flex flex-col fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static transition-transform duration-300 shadow-2xl`}>
        <div className="p-6 border-b border-purple-800 font-bold text-xl tracking-wider">
          YCS<span className="text-purple-300">Physics</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/dashboard'); }} className="flex items-center space-x-3 hover:bg-purple-800 px-4 py-3 rounded-lg transition">
            <span className="text-xl">🏠</span><span className="font-medium">මුල් තිරය</span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/videos'); }} className="flex items-center space-x-3 hover:bg-purple-800 px-4 py-3 rounded-lg transition">
            <span className="text-xl">📺</span><span className="font-medium">වීඩියෝ පාඩම්</span>
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

          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/notifications'); }} className="flex items-center space-x-3 hover:bg-purple-800 px-4 py-3 rounded-lg transition">
            <span className="text-xl">🔔</span><span className="font-medium">දැනුම්දීම්</span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/settings'); }} className="flex items-center space-x-3 hover:bg-purple-800 px-4 py-3 rounded-lg transition">
            <span className="text-xl">⚙️</span><span className="font-medium">සැකසුම්</span>
          </a>
        </nav>
        <div className="p-4 border-t border-purple-800">
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 hover:bg-red-500/20 p-3 rounded-lg transition text-purple-200 hover:text-red-400">
            <div className="w-8 h-8 rounded-full bg-purple-800 flex items-center justify-center text-white font-bold text-sm">
              {userName.charAt(0)}
            </div>
            <span className="font-bold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-30 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition">
              <span className="text-2xl font-bold">☰</span>
            </button>
            <h1 className="text-xl font-extrabold text-purple-900 flex items-center gap-2">
              <span className="text-2xl hidden sm:block">⚙️</span> ගිණුම් සැකසුම්
            </h1>
          </div>
          
          <div className="flex items-center gap-3 bg-purple-50 px-4 py-2 rounded-full border border-purple-100">
            <div className="text-right hidden sm:block">
              <p className="font-bold text-sm text-purple-900">{userName}</p>
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-purple-500 overflow-hidden bg-purple-600 flex items-center justify-center font-bold text-white shadow-sm">
              {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : userName.charAt(0)}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-8 pb-20 max-w-4xl mx-auto w-full animate-fade-in">
          <div className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden">
            
            {/* Profile Section */}
            <div className="bg-gradient-to-r from-purple-700 to-purple-500 p-8 text-white flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative group cursor-pointer shrink-0">
                <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-purple-100 flex items-center justify-center text-3xl text-purple-600 font-bold shadow-md">
                  {avatar ? (
                    <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <label className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer">
                  <span className="text-white text-xl">📷</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>

              <div className="text-center sm:text-left mt-2 sm:mt-0">
                <h2 className="text-3xl font-bold">{user.name}</h2>
                <p className="text-purple-100 mt-1 text-lg">{user.username}</p> 
                <span className="inline-block mt-3 bg-white text-purple-700 text-xs px-3 py-1 rounded-full font-bold shadow-sm">
                  {user.alYear} A/L Student {user.center && `| ${user.center} Center`}
                </span>
              </div>
            </div>

            {/* Password Change Section */}
            <div className="p-8">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-6 flex items-center gap-2">
                <span>🔐</span> මුරපදය වෙනස් කිරීම
              </h2>

              {message.text && (
                <div className={`p-4 mb-6 rounded-xl text-sm font-bold border ${message.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-5 max-w-lg">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">දැනට ඇති මුරපදය</label>
                  <input 
                    type="password" required 
                    value={passwords.current}
                    onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-purple-500 outline-none transition" 
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">නව මුරපදය</label>
                  <input 
                    type="password" required 
                    value={passwords.new}
                    onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-purple-500 outline-none transition" 
                  />
                  {/* අකුරු 6ක් තියෙනවද කියලා පෙන්වන කොටස */}
                  {passwords.new.length > 0 && passwords.new.length < 6 && (
                    <p className="text-red-500 text-xs mt-1 font-bold">⚠️ මුරපදය අවම වශයෙන් අකුරු 6ක් විය යුතුය.</p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">නව මුරපදය තහවුරු කරන්න</label>
                  <input 
                    type="password" required 
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-purple-500 outline-none transition" 
                  />
                  {/* අලුතින් එකතු කළ Real-time Validation පණිවිඩය */}
                  {passwords.confirm.length > 0 && (
                    <p className={`text-sm mt-2 font-bold flex items-center gap-1 ${passwords.new === passwords.confirm ? 'text-green-600' : 'text-red-500'}`}>
                      {passwords.new === passwords.confirm ? '✅ මුරපද දෙක ගැලපේ' : '❌ මුරපද එකිනෙකට නොගැලපේ'}
                    </p>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={loading || (passwords.confirm.length > 0 && passwords.new !== passwords.confirm) || passwords.new.length < 6}
                  className={`w-full sm:w-auto bg-purple-600 text-white font-bold rounded-xl px-8 py-3.5 shadow-md hover:bg-purple-700 transition transform mt-4 ${(loading || (passwords.confirm.length > 0 && passwords.new !== passwords.confirm) || passwords.new.length < 6) ? 'opacity-50 cursor-not-allowed hover:-translate-y-0' : 'hover:-translate-y-0.5'}`}
                >
                  {loading ? 'කරුණාකර රැඳී සිටින්න...' : 'මුරපදය යාවත්කාලීන කරන්න'}
                </button>
              </form>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}