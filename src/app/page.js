"use client";
import React, { useState, useEffect, useRef } from "react";
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

  const ongoingCourses = [
    { id: 1, title: "2026 THEORY", day: "බ්‍රහස්පතින්දා", time: "පෙ.ව 7.30 - ප.ව 1.30", desc: "තාපය (වායු, තාප ගති විද්‍යාව) සහ ප්‍රායෝගික" },
    { id: 2, title: "2026 PAPER CLASS", day: "Papers", time: "දැනුම් දෙනු ලැබේ", desc: "Paper 06 සිට 09 දක්වා සාකච්ඡාව" },
    { id: 3, title: "2026 REVISION", day: "සිකුරාදා", time: "පෙ.ව 7.30 - ප.ව 2.00", desc: "පදාර්ථ හා විකිරණය, ඉලෙක්ට්‍රොනික විද්‍යාව" },
    { id: 4, title: "2027 THEORY", day: "සෙනසුරාදා", time: "ප.ව 1.00 - ප.ව 4.00", desc: "කාර්යය, ශක්තිය හා ක්ෂමතාව, භ්‍රමණ චලිතය" },
  ];

  const resultsData = [1, 2, 3, 4, 5];
  const slides = [
    { id: 1, title: "භෞතික විද්‍යාව නිවැරදිව ග්‍රහණය කරගන්න", subtitle: "2026 සහ 2027 A/L සිසුන් සඳහා Theory, Revision සහ Paper Classes.", btnText: "වැඩි විස්තර සඳහා", action: () => window.location.href="tel:0714620408", image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1920&auto=format&fit=crop" },
    { id: 2, title: "දිවයිනේ ඉහළම ප්‍රතිඵල", subtitle: "පසුගිය වසර වලදී විශිෂ්ටතම A සාමාර්ථ ලබාගත් අපගේ දරුවන්.", btnText: "ප්‍රතිඵල බලන්න", action: () => window.location.href="#results", image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1920&auto=format&fit=crop" },
    { id: 3, title: "දරුවන් වෙනුවෙන් කැපවීම", subtitle: "Digital Worksheets සමගින් පහසුවෙන් ඉගෙනගන්න.", btnText: "ගිණුමට පිවිසෙන්න", action: () => changeViewAndScrollTop("login"), image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1920&auto=format&fit=crop" }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [courseIndex, setCourseIndex] = useState(0);
  const [resultIndex, setResultIndex] = useState(0);
  const courseRef = useRef(null);
  const resultRef = useRef(null);

  useEffect(() => {
    if (heroView !== "carousel") return;
    const timer = setInterval(() => { setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1)); }, 5000);
    return () => clearInterval(timer);
  }, [slides.length, heroView]);

  const nextSlide = () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  const handleScroll = (ref, setIndex, totalItems) => {
    if (!ref.current) return;
    const { scrollLeft, scrollWidth } = ref.current;
    const itemWidth = scrollWidth / totalItems;
    setIndex(Math.round(scrollLeft / itemWidth));
  };

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
      if (phone === "admin" && password === "admin123") {
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

  const themeBg = isDarkMode ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-800";
  const headerBg = isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-purple-100";
  const logoTextColor = isDarkMode ? "text-purple-400" : "text-purple-800";
  const btnOutline = isDarkMode ? "border-slate-700 text-slate-300 hover:bg-purple-900/30 hover:border-purple-500" : "border-purple-200 text-purple-700 hover:bg-purple-50";
  const sectionTitleColor = isDarkMode ? "text-white" : "text-slate-900";
  const sectionDescColor = isDarkMode ? "text-slate-400" : "text-slate-500";
  const cardBg = isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-purple-100";
  const cardTitle = isDarkMode ? "text-purple-300" : "text-purple-800";
  const cardImgBg = isDarkMode ? "bg-slate-700 text-purple-400/50" : "bg-purple-50 text-purple-300";
  const cardImgHover = isDarkMode ? "group-hover:bg-purple-900/40" : "group-hover:bg-purple-100";
  const authBg = isDarkMode ? "bg-slate-950" : "bg-purple-50";
  const authCardBg = isDarkMode ? "bg-slate-800/95 border-slate-700" : "bg-white/90 border-white shadow-2xl";
  const inputBg = isDarkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-slate-50 border-purple-100 text-slate-900 focus:bg-white";

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `@import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&family=Oswald:wght@500;600;700&display=swap'); .modern-font { font-family: 'Lato', 'Iskoola Pota', sans-serif; } .logo-font { font-family: 'Oswald', sans-serif; }`}} />

      <div className={`modern-font flex min-h-screen flex-col transition-colors duration-300 ${themeBg}`}>
        
        <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-md transition-all duration-300 ${headerBg}`}>
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
            <button onClick={() => changeViewAndScrollTop("carousel")} className="flex items-center gap-2 md:gap-3 focus:outline-none">
              <div className="bg-purple-600 text-white font-bold rounded-lg p-2 text-xs md:text-sm">YS</div>
              <span className={`logo-font text-lg md:text-2xl font-bold truncate ${logoTextColor}`}>YCS Physics</span>
            </button>
            <div className="flex items-center space-x-3 md:space-x-5 flex-shrink-0">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className={`rounded-full p-2 transition-colors focus:outline-none ${isDarkMode ? 'bg-slate-800 text-yellow-400' : 'bg-purple-100 text-purple-600'}`}>
                {isDarkMode ? "☀️" : "🌙"}
              </button>
              <button onClick={() => changeViewAndScrollTop("login")} className="rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:from-purple-700 hover:to-fuchsia-700 md:px-6 md:py-2.5 md:text-sm">පද්ධතියට පිවිසෙන්න</button>
            </div>
          </div>
        </header>

        <main className="flex-grow">
          {heroView === "carousel" && (
            <section className="relative h-[450px] w-full overflow-hidden md:h-[550px]">
              <div className="flex h-full transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {slides.map((slide) => (
                  <div key={slide.id} className="relative flex h-full w-full flex-shrink-0 items-center justify-center px-6 text-center text-white">
                    <img src={slide.image} alt={slide.title} className="absolute inset-0 h-full w-full object-cover z-0" />
                    <div className={`absolute inset-0 z-0 transition-colors duration-300 ${isDarkMode ? 'bg-slate-950/80' : 'bg-purple-900/65'}`}></div>
                    <div className="relative z-10 max-w-3xl">
                      <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-6xl drop-shadow-lg">{slide.title}</h1>
                      <p className="mb-8 text-sm text-slate-200 md:text-xl drop-shadow-md">{slide.subtitle}</p>
                      <button onClick={slide.action} className="inline-block rounded-full bg-fuchsia-500 px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-fuchsia-600 hover:-translate-y-1 md:px-10 md:py-4 md:text-lg">{slide.btnText}</button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-md hover:bg-white/40 md:left-6 md:p-3 z-20">◀</button>
              <button onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-md hover:bg-white/40 md:right-6 md:p-3 z-20">▶</button>
              <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 space-x-3 z-20">
                {slides.map((_, idx) => (<button key={idx} onClick={() => setCurrentSlide(idx)} className={`h-2.5 rounded-full transition-all duration-300 ${currentSlide === idx ? "w-8 bg-fuchsia-400" : "w-2.5 bg-white/40"}`} />))}
              </div>
            </section>
          )}

          {(heroView === "login" || heroView === "forgotPassword") && (
            <section className={`flex min-h-[450px] items-center justify-center py-12 px-4 transition-colors duration-300 md:min-h-[550px] ${authBg}`}>
              <div className={`w-full max-w-md rounded-3xl border p-6 backdrop-blur-lg transition-colors duration-300 md:p-10 ${authCardBg}`}>
                
                <div className="mb-6 flex items-center justify-between">
                  <h2 className={`text-2xl font-extrabold ${cardTitle}`}>
                    {heroView === "login" ? "පද්ධතියට ඇතුළු වන්න" : "මුරපදය අමතකද?"}
                  </h2>
                  <button onClick={() => changeViewAndScrollTop("carousel")} className={`rounded-full p-2 transition-colors focus:outline-none ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-400 hover:text-red-500'}`}>✖</button>
                </div>
                
                {error && <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100">{error}</div>}
                {successMsg && <div className="mb-4 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-700 border border-green-200">{successMsg}</div>}
                
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  <div>
                    <label className={`mb-1 block text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>WhatsApp අංකය</label>
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="උදා: 0712345678" className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${inputBg}`} required />
                  </div>
                  <div>
                    <label className={`mb-1 block text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{heroView === "forgotPassword" ? "නව මුරපදය" : "මුරපදය (Password)"}</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="මුරපදයක් ලබා දෙන්න" className={`w-full rounded-xl border px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${inputBg}`} required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 focus:outline-none text-xs font-bold text-slate-400">
                        {showPassword ? "HIDE" : "SHOW"}
                      </button>
                    </div>
                  </div>
                  {heroView === "forgotPassword" && (
                    <div>
                      <label className={`mb-1 block text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>මුරපදය තහවුරු කරන්න</label>
                      <div className="relative">
                        <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="මුරපදය නැවත ඇතුළත් කරන්න" className={`w-full rounded-xl border px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${inputBg}`} required />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 focus:outline-none text-xs font-bold text-slate-400">
                           {showConfirmPassword ? "HIDE" : "SHOW"}
                        </button>
                      </div>
                    </div>
                  )}

                  {heroView === "login" && (
                    <div className="text-right">
                      <button type="button" onClick={() => changeViewAndScrollTop("forgotPassword")} className={`text-xs font-bold hover:underline ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>මුරපදය අමතකද?</button>
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="mt-2 w-full rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 px-4 py-3.5 text-sm font-bold text-white shadow-md hover:from-purple-700 hover:to-fuchsia-700 transition-all disabled:opacity-70">
                    {loading ? "රැඳී සිටින්න..." : (heroView === "login" ? "ඇතුළු වන්න" : "Admin වෙත යවන්න")}
                  </button>
                </form>
                
                <div className={`mt-6 text-center text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {heroView === "login" ? (
                    <p>නව ලියාපදිංචිය සඳහා අමතන්න: <a href="tel:0714620408" className={`font-bold hover:underline ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>071 462 0408</a></p>
                  ) : (
                    <p>දැනටමත් ගිණුමක් තිබේද? <button onClick={() => changeViewAndScrollTop("login")} className={`font-bold hover:underline ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>ලොග් වන්න</button></p>
                  )}
                </div>
              </div>
            </section>
          )}

          <section id="courses" className="py-16 px-4 md:py-24 md:px-6">
            <div className="mx-auto max-w-7xl">
              <div className="mb-10 text-center md:mb-16">
                <h2 className={`text-2xl font-extrabold md:text-4xl ${sectionTitleColor}`}>පන්ති කාලසටහන</h2>
                <div className="mx-auto mt-4 h-1.5 w-16 rounded-full bg-purple-600 md:w-24"></div>
              </div>

              <div 
                ref={courseRef}
                onScroll={() => handleScroll(courseRef, setCourseIndex, ongoingCourses.length)}
                className="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-6 md:grid md:grid-cols-4 md:gap-8 md:overflow-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
              >
                {ongoingCourses.map((course) => (
                  <div key={course.id} className={`group flex-none w-[85%] sm:w-[45%] snap-center flex flex-col overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl md:w-auto border ${cardBg}`}>
                    <div className={`flex h-32 items-center justify-center transition-colors shrink-0 md:h-40 ${cardImgBg} ${cardImgHover}`}>
                      <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-purple-900'}`}>{course.title}</h3>
                    </div>
                    <div className="flex flex-col flex-grow p-5 md:p-6 text-center">
                      <p className={`text-sm font-bold mb-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`}>{course.day}</p>
                      <p className={`text-xs font-semibold mb-4 ${sectionDescColor}`}>{course.time}</p>
                      <p className={`text-sm mb-6 ${sectionTitleColor}`}>{course.desc}</p>
                      
                      <div className="mt-auto pt-4 border-t border-purple-100/20">
                        <button onClick={() => window.location.href="tel:0714620408"} className={`w-full text-center rounded-full px-4 py-2.5 text-xs font-bold transition-all hover:shadow-md md:text-sm ${isDarkMode ? 'bg-purple-600 text-white hover:bg-purple-500' : 'bg-purple-100 text-purple-800 hover:bg-purple-600 hover:text-white'}`}>
                          ලියාපදිංචි වීමට අමතන්න
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="results" className={`py-16 px-4 border-y md:py-24 md:px-6 transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-purple-50/50 border-purple-100'}`}>
            <div className="mx-auto max-w-7xl">
              <div className="mb-10 text-center md:mb-16">
                <h2 className={`text-2xl font-extrabold md:text-4xl ${sectionTitleColor}`}>අපගේ විශිෂ්ට ප්‍රතිඵල</h2>
                <div className="mx-auto mt-4 h-1.5 w-16 rounded-full bg-purple-600 md:w-24"></div>
              </div>

              <div 
                ref={resultRef}
                onScroll={() => handleScroll(resultRef, setResultIndex, resultsData.length)}
                className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 md:grid md:grid-cols-4 md:gap-8 md:overflow-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
              >
                {resultsData.map((item) => (
                  <div key={item} className={`flex-none w-[70%] sm:w-[45%] snap-center overflow-hidden rounded-2xl shadow-sm transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-xl md:w-auto border ${cardBg}`}>
                    <div className={`flex h-48 items-center justify-center md:h-72 ${cardImgBg}`}>
                      <p className="text-[11px] md:text-sm font-semibold">ප්‍රතිඵල පෝස්ටරය {item}</p>
                    </div>
                    <div className="p-4 text-center md:p-6">
                      <h3 className={`text-sm font-extrabold md:text-lg ${cardTitle}`}>සිසුවාගේ නම</h3>
                      <p className={`mt-1 text-[11px] font-bold md:text-sm ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>A සාමාර්ථයකි</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </main>

        <footer className={`px-4 py-10 transition-colors duration-300 md:px-6 md:py-16 ${isDarkMode ? 'bg-black text-slate-400 border-t border-slate-900' : 'bg-slate-900 text-slate-300'}`}>
          <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3 md:gap-12">
            <div>
              <div className="flex items-center gap-3 mb-3 md:mb-4">
                <div className="bg-purple-600 text-white font-bold rounded-lg p-2 text-sm">YS</div>
                <h3 className="logo-font text-xl font-extrabold text-white md:text-2xl">YCS Physics</h3>
              </div>
              <div className="mb-4">
                <p className="text-base font-bold text-purple-300">යශේන් සේනානායක</p>
                <p className="text-[11px] md:text-xs font-medium text-slate-400">BSc (Hons) Engineering (University of Moratuwa)</p>
              </div>
              <p className="text-sm leading-relaxed text-slate-400 border-t border-slate-700/50 pt-4">
                භෞතික විද්‍යාව සරලව සහ තර්කානුකූලව ඉගෙනගන්න. A/L සිසුන් සඳහාම වෙන්වූ ශ්‍රී ලංකාවේ ප්‍රමුඛතම මාර්ගගත වේදිකාව.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-base font-bold text-white md:mb-6 md:text-lg">අපව සම්බන්ධ කරගන්න</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li className="flex items-center"><span className="mr-3 text-lg">📞</span> <a href="tel:0714620408" className="hover:text-purple-400 transition">071 462 0408 (Call / WhatsApp)</a></li>
              </ul>
            </div>
          </div>
          <div className={`mx-auto mt-10 max-w-7xl border-t pt-6 text-center text-xs md:mt-16 md:pt-8 md:text-sm ${isDarkMode ? 'border-slate-800 text-slate-600' : 'border-slate-800 text-slate-500'}`}>
            &copy; {new Date().getFullYear()} YCS Physics. All rights reserved.
          </div>
        </footer>
      </div>
    </>
  );
}