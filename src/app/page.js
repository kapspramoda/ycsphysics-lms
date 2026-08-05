"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [heroView, setHeroView] = useState("carousel");

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // 🔴 අලුත් පන්ති කාලසටහන
  const ongoingCourses = [
    { 
      id: 1, 
      title: "2027 THEORY", 
      day: "සෙනසුරාදා", 
      time: "ප.ව 1:00 - ප.ව 5:00", 
      desc: "සියෝන් වන් - මතුගම" 
    },
    { 
      id: 2, 
      title: "2027 PAPER CLASS", 
      day: "බදාදා / බ්‍රහස්. / සිකුරාදා", 
      time: "ප.ව 2:00 - ප.ව 5:00", 
      desc: "සියෝන් වන් - මතුගම" 
    },
    { 
      id: 3, 
      title: "2028 THEORY", 
      day: "සෙනසුරාදා", 
      time: "පෙ.ව 8:00 - පෙ.ව 11:00", 
      desc: "සියෝන් වන් - මතුගම" 
    }
  ];

  const slides = [
    { id: 1, title: "භෞතික විද්‍යාව නිවැරදිව ග්‍රහණය කරගන්න", subtitle: "2027 සහ 2028 A/L සිසුන් සඳහා Theory සහ Paper Classes.", btnText: "වැඩි විස්තර සඳහා", action: () => window.location.href="tel:0714620408", image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1920&auto=format&fit=crop" },
    { id: 2, title: "දිවයිනේ ඉහළම ප්‍රතිඵල", subtitle: "පසුගිය වසර වලදී විශිෂ්ටතම A සාමාර්ථ ලබාගත් අපගේ දරුවන්.", btnText: "ලියාපදිංචියට", action: () => window.location.href="tel:0714620408", image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1920&auto=format&fit=crop" },
    { id: 3, title: "දරුවන් වෙනුවෙන් කැපවීම", subtitle: "Digital Worksheets සමගින් පහසුවෙන් ඉගෙනගන්න.", btnText: "ගිණුමට පිවිසෙන්න", action: () => changeViewAndScrollTop("login"), image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1920&auto=format&fit=crop" }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (heroView !== "carousel") return;
    const timer = setInterval(() => { setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1)); }, 5000);
    return () => clearInterval(timer);
  }, [slides.length, heroView]);

  const nextSlide = () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  const changeViewAndScrollTop = (view) => {
    setHeroView(view);
    setError("");
    setSuccessMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    if (heroView === "login") {
      if (phone === "admin" && password === "admin$2244") {
        localStorage.setItem("isAdminLoggedIn", "true");
        localStorage.setItem("adminRole", "Admin");
        router.push("/admin");
        return; 
      }
      if (phone === "ycseditor" && password === "YCS@998844") {
        localStorage.setItem("isAdminLoggedIn", "true");
        localStorage.setItem("adminRole", "Editor");
        router.push("/admin");
        return; 
      }
      
      try {
        const res = await fetch("/api/login", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: phone, password })
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem("user", JSON.stringify(data.user));
          router.push("/dashboard");
        } else { setError(data.message || "ලොග් වීමේදී දෝෂයක් මතු විය."); }
      } catch (err) { setError("තාක්ෂණික දෝෂයකි. කරුණාකර නැවත උත්සාහ කරන්න."); }
      finally { setLoading(false); }
    } 

    else if (heroView === "forgotPassword") {
      if (password !== confirmPassword) {
        setError("මුරපදයන් එකිනෙකට නොගැලපේ.");
        setLoading(false); return;
      }
      try {
        const res = await fetch("/api/forgot-password", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, newPassword: password }), 
        });
        const data = await res.json();
        if (res.ok) {
          setSuccessMsg("ඉල්ලීම සාර්ථකව Admin වෙත යොමු කරන ලදී. අනුමත වූ පසු ඔබට WhatsApp පණිවිඩයක් ලැබෙනු ඇත.");
          setPhone(""); setPassword(""); setConfirmPassword("");
        } else { setError(data.message || "මෙම අංකයෙන් ගිණුමක් නොමැත."); }
      } catch (err) { setError("තාක්ෂණික දෝෂයකි. නැවත උත්සාහ කරන්න."); }
      finally { setLoading(false); }
    }
  };

  const themeBg = isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800";
  const headerBg = isDarkMode ? "bg-slate-900/90 border-slate-800 shadow-md" : "bg-white/90 border-purple-100 shadow-sm";
  const logoTextColor = isDarkMode ? "text-purple-400" : "text-purple-800";
  const sectionTitleColor = isDarkMode ? "text-white" : "text-slate-900";
  const sectionDescColor = isDarkMode ? "text-slate-400" : "text-slate-500";
  const cardBg = isDarkMode ? "bg-slate-900 border-slate-800 hover:border-purple-500/50" : "bg-white border-purple-100 hover:border-purple-300";
  const cardTitle = isDarkMode ? "text-purple-300" : "text-purple-800";
  const cardImgBg = isDarkMode ? "bg-slate-800 text-purple-400/50" : "bg-purple-50 text-purple-300";
  const cardImgHover = isDarkMode ? "group-hover:bg-purple-900/40" : "group-hover:bg-purple-100";
  const authBg = isDarkMode ? "bg-slate-950" : "bg-purple-50/50";
  const authCardBg = isDarkMode ? "bg-slate-900 border-slate-800 shadow-2xl" : "bg-white border-white shadow-2xl";
  const inputBg = isDarkMode ? "bg-slate-800 border-slate-700 text-white focus:border-purple-500" : "bg-slate-50 border-gray-200 text-slate-900 focus:bg-white focus:border-purple-500";

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `@import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&family=Oswald:wght@500;600;700&display=swap'); .modern-font { font-family: 'Lato', 'Iskoola Pota', sans-serif; } .logo-font { font-family: 'Oswald', sans-serif; }`}} />

      <div className={`modern-font flex min-h-screen flex-col transition-colors duration-300 ${themeBg}`}>
        
        {/* 🔴 Official WhatsApp Icon & Floating Button */}
        <a 
          href="https://wa.me/94714620408" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="fixed bottom-6 right-6 z-[9999] bg-[#25D366] text-white p-3.5 md:p-4 rounded-full shadow-2xl hover:scale-110 hover:shadow-green-500/50 transition-all duration-300 flex items-center justify-center group"
          title="WhatsApp ඔස්සේ සම්බන්ධ වන්න"
        >
          <svg className="w-8 h-8 md:w-9 md:h-9" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          <span className="absolute right-full mr-4 bg-white text-slate-800 text-sm font-bold py-2 px-4 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 whitespace-nowrap transform group-hover:-translate-x-1">
            WhatsApp ඔස්සේ අමතන්න
          </span>
        </a>

        <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-xl transition-all duration-300 ${headerBg}`}>
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
            <button onClick={() => changeViewAndScrollTop("carousel")} className="flex items-center gap-2 md:gap-3 focus:outline-none group">
              <div className="bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white font-black rounded-lg p-2 text-xs md:text-sm shadow-md group-hover:rotate-6 transition-transform">YS</div>
              <span className={`logo-font text-xl md:text-2xl font-bold truncate tracking-wide ${logoTextColor}`}>YCS Physics</span>
            </button>
            <div className="flex items-center space-x-3 md:space-x-5 flex-shrink-0">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className={`rounded-full p-2.5 transition-colors focus:outline-none ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'}`}>
                {isDarkMode ? "☀️" : "🌙"}
              </button>
              <button onClick={() => changeViewAndScrollTop("login")} className="rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg hover:shadow-purple-500/30 hover:from-purple-700 hover:to-fuchsia-700 md:px-8 md:py-3 md:text-sm transition-all transform hover:-translate-y-0.5">පද්ධතියට පිවිසෙන්න</button>
            </div>
          </div>
        </header>

        <main className="flex-grow">
          {heroView === "carousel" && (
            <section className="relative h-[500px] w-full overflow-hidden md:h-[650px]">
              <div className="flex h-full transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {slides.map((slide) => (
                  <div key={slide.id} className="relative flex h-full w-full flex-shrink-0 items-center justify-center px-6 text-center text-white">
                    <img src={slide.image} alt={slide.title} className="absolute inset-0 h-full w-full object-cover z-0" />
                    <div className={`absolute inset-0 z-0 transition-colors duration-300 ${isDarkMode ? 'bg-slate-950/80' : 'bg-purple-950/70'}`}></div>
                    <div className="relative z-10 max-w-4xl">
                      <h1 className="mb-6 text-4xl font-black leading-tight tracking-tight md:text-6xl lg:text-7xl drop-shadow-2xl">{slide.title}</h1>
                      <p className="mb-10 text-base text-slate-200 md:text-2xl drop-shadow-lg font-medium">{slide.subtitle}</p>
                      <button onClick={slide.action} className="inline-block rounded-full bg-fuchsia-500 px-10 py-4 text-sm font-bold text-white shadow-[0_10px_20px_rgba(217,70,239,0.3)] transition-all hover:bg-fuchsia-600 hover:-translate-y-1 md:px-12 md:py-5 md:text-lg">{slide.btnText}</button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/20 p-3 text-white backdrop-blur-md hover:bg-black/40 border border-white/20 md:left-6 z-20 transition-all">◀</button>
              <button onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/20 p-3 text-white backdrop-blur-md hover:bg-black/40 border border-white/20 md:right-6 z-20 transition-all">▶</button>
              <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 space-x-3 z-20">
                {slides.map((_, idx) => (<button key={idx} onClick={() => setCurrentSlide(idx)} className={`h-2.5 rounded-full transition-all duration-300 ${currentSlide === idx ? "w-10 bg-fuchsia-500" : "w-3 bg-white/50 hover:bg-white/80"}`} />))}
              </div>
            </section>
          )}

          {(heroView === "login" || heroView === "forgotPassword") && (
            <section className={`flex min-h-[500px] items-center justify-center py-16 px-4 transition-colors duration-300 md:min-h-[650px] ${authBg}`}>
              <div className={`w-full max-w-md rounded-[2rem] border p-8 backdrop-blur-2xl transition-all duration-300 md:p-12 ${authCardBg}`}>
                
                <div className="mb-8 flex items-center justify-between">
                  <h2 className={`text-3xl font-black tracking-tight ${cardTitle}`}>
                    {heroView === "login" ? "සිසුන්ගේ පිවිසුම" : "මුරපදය අමතකද?"}
                  </h2>
                  <button onClick={() => changeViewAndScrollTop("carousel")} className={`rounded-full p-2 transition-colors focus:outline-none ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-red-400' : 'bg-slate-100 text-slate-500 hover:text-red-500 hover:bg-red-50'}`}>✖</button>
                </div>
                
                {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-200 shadow-sm">{error}</div>}
                {successMsg && <div className="mb-6 rounded-xl bg-green-50 p-4 text-sm font-bold text-green-700 border border-green-200 shadow-sm">{successMsg}</div>}
                
                <form onSubmit={handleAuthSubmit} className="space-y-5">
                  <div>
                    <label className={`mb-2 block text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>WhatsApp අංකය</label>
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="උදා: 0712345678" className={`w-full rounded-2xl border-2 px-5 py-4 text-base font-medium outline-none transition-all ${inputBg}`} required />
                  </div>
                  <div>
                    <label className={`mb-2 block text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{heroView === "forgotPassword" ? "නව මුරපදය" : "මුරපදය (Password)"}</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="මුරපදයක් ලබා දෙන්න" className={`w-full rounded-2xl border-2 px-5 py-4 pr-12 text-base font-medium outline-none transition-all ${inputBg}`} required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 focus:outline-none text-xs font-bold text-slate-400 hover:text-purple-500 transition-colors">
                        {showPassword ? "HIDE" : "SHOW"}
                      </button>
                    </div>
                  </div>
                  {heroView === "forgotPassword" && (
                    <div className="animate-fade-in">
                      <label className={`mb-2 block text-sm font-bold mt-5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>මුරපදය තහවුරු කරන්න</label>
                      <div className="relative">
                        <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="මුරපදය නැවත ඇතුළත් කරන්න" className={`w-full rounded-2xl border-2 px-5 py-4 pr-12 text-base font-medium outline-none transition-all ${inputBg}`} required />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 focus:outline-none text-xs font-bold text-slate-400 hover:text-purple-500 transition-colors">
                           {showConfirmPassword ? "HIDE" : "SHOW"}
                        </button>
                      </div>
                    </div>
                  )}

                  {heroView === "login" && (
                    <div className="text-right mt-1">
                      <button type="button" onClick={() => changeViewAndScrollTop("forgotPassword")} className={`text-sm font-bold transition-colors ${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-800'}`}>මුරපදය අමතකද?</button>
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="mt-4 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-4 py-4 text-base font-black tracking-wide text-white shadow-lg hover:shadow-purple-500/40 hover:from-purple-700 hover:to-fuchsia-700 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none">
                    {loading ? "රැඳී සිටින්න..." : (heroView === "login" ? "ඇතුළු වන්න" : "Admin වෙත යවන්න")}
                  </button>
                </form>
                
                <div className={`mt-8 text-center text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {heroView === "login" ? (
                    <p>නව ලියාපදිංචිය සඳහා අමතන්න: <br/><a href="tel:0714620408" className={`inline-block mt-2 text-base ${isDarkMode ? 'text-fuchsia-400 hover:text-fuchsia-300' : 'text-fuchsia-600 hover:text-fuchsia-800'}`}>071 462 0408</a></p>
                  ) : (
                    <p>දැනටමත් ගිණුමක් තිබේද? <br/><button onClick={() => changeViewAndScrollTop("login")} className={`inline-block mt-2 text-base ${isDarkMode ? 'text-fuchsia-400 hover:text-fuchsia-300' : 'text-fuchsia-600 hover:text-fuchsia-800'}`}>ලොග් වන්න</button></p>
                  )}
                </div>
              </div>
            </section>
          )}

          <section id="courses" className="py-20 px-4 md:py-28 md:px-6">
            <div className="mx-auto max-w-7xl">
              <div className="mb-12 text-center md:mb-20">
                <h2 className={`text-3xl font-black tracking-tight md:text-5xl ${sectionTitleColor}`}>පන්ති කාලසටහන</h2>
                <div className="mx-auto mt-6 h-1.5 w-20 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 md:w-32"></div>
              </div>

              {/* 🔴 අලුත් Mobile View එක (Grid / Stacked) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {ongoingCourses.map((course) => (
                  <div key={course.id} className={`group flex flex-col overflow-hidden rounded-[2rem] shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border ${cardBg}`}>
                    <div className={`flex h-40 md:h-48 items-center justify-center transition-colors shrink-0 ${cardImgBg} ${cardImgHover}`}>
                      <h3 className={`text-2xl md:text-3xl font-black tracking-wider ${isDarkMode ? 'text-white' : 'text-purple-950'}`}>{course.title}</h3>
                    </div>
                    <div className="flex flex-col flex-grow p-6 md:p-8 text-center">
                      <p className={`text-lg md:text-xl font-black mb-2 ${isDarkMode ? 'text-fuchsia-400' : 'text-fuchsia-600'}`}>{course.day}</p>
                      <p className={`text-base md:text-lg font-bold mb-5 ${sectionDescColor}`}>{course.time}</p>
                      
                      <div className={`mt-auto pt-6 border-t ${isDarkMode ? 'border-slate-800' : 'border-purple-100'}`}>
                        <p className={`text-base md:text-lg font-bold mb-6 ${sectionTitleColor}`}>📍 {course.desc}</p>
                        <button onClick={() => window.location.href="tel:0714620408"} className={`w-full text-center rounded-xl px-4 py-3.5 text-sm md:text-base font-bold transition-all shadow-sm ${isDarkMode ? 'bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white border border-purple-500/30' : 'bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white hover:shadow-purple-500/30'}`}>
                          ලියාපදිංචි වීමට අමතන්න
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </main>

        <footer className={`px-4 py-12 transition-colors duration-300 md:px-6 md:py-20 ${isDarkMode ? 'bg-slate-950 text-slate-400 border-t border-slate-900' : 'bg-slate-900 text-slate-300'}`}>
          <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-3 md:gap-16">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white font-black rounded-xl p-2 text-sm shadow-md">YS</div>
                <h3 className="logo-font text-2xl font-bold text-white tracking-wide">YCS Physics</h3>
              </div>
              <div className="mb-5">
                <p className="text-lg font-bold text-fuchsia-400">යශේන් සේනානායක</p>
                <p className="text-sm font-medium text-slate-400 mt-1">BSc (Hons) Engineering <br/> (University of Moratuwa)</p>
              </div>
              <p className="text-sm leading-relaxed text-slate-400 border-t border-slate-800 pt-5">
                භෞතික විද්‍යාව සරලව සහ තර්කානුකූලව ඉගෙනගන්න. A/L සිසුන් සඳහාම වෙන්වූ ශ්‍රී ලංකාවේ ප්‍රමුඛතම මාර්ගගත වේදිකාව.
              </p>
            </div>
            
            <div>
              <h4 className="mb-6 text-lg font-bold text-white tracking-wide">අපව සම්බන්ධ කරගන්න</h4>
              <ul className="space-y-5 text-sm text-slate-400">
                <li className="flex items-center">
                  <span className="mr-4 text-xl">📞</span> 
                  <a href="tel:0714620408" className="hover:text-fuchsia-400 transition font-medium">071 462 0408 (Call / WhatsApp)</a>
                </li>
                
                <li className="flex items-center gap-5 mt-8">
                  {/* Facebook */}
                  <a href="#" target="_blank" rel="noopener noreferrer" className={`p-2.5 rounded-full transition-colors ${isDarkMode ? 'bg-slate-900 hover:bg-blue-600/20 text-slate-300 hover:text-blue-400 border border-slate-800' : 'bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white'}`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                  </a>
                  {/* YouTube */}
                  <a href="#" target="_blank" rel="noopener noreferrer" className={`p-2.5 rounded-full transition-colors ${isDarkMode ? 'bg-slate-900 hover:bg-red-600/20 text-slate-300 hover:text-red-400 border border-slate-800' : 'bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white'}`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </a>
                  {/* TikTok */}
                  <a href="#" target="_blank" rel="noopener noreferrer" className={`p-2.5 rounded-full transition-colors ${isDarkMode ? 'bg-slate-900 hover:bg-pink-600/20 text-slate-300 hover:text-pink-400 border border-slate-800' : 'bg-slate-800 hover:bg-black text-slate-300 hover:text-white'}`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className={`mx-auto mt-12 max-w-7xl border-t pt-8 text-center text-sm md:mt-20 md:pt-10 ${isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-800 text-slate-400'}`}>
            &copy; {new Date().getFullYear()} YCS Physics. All rights reserved. <br/>
            <span className="mt-3 inline-block font-medium tracking-wide">Designed and developed by <a href="https://esip.lk" target="_blank" rel="noopener noreferrer" className="font-bold hover:text-fuchsia-400 transition-colors">esip.lk</a></span>
          </div>
        </footer>
      </div>
    </>
  );
}