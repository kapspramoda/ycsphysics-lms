"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ExamPage() {
  const router = useRouter();
  
  // --- Sidebar States ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [avatar, setAvatar] = useState(null);

  // --- Exam States ---
  const [questions, setQuestions] = useState([]); 
  const [examLoading, setExamLoading] = useState(true); 
  
  const [examStarted, setExamStarted] = useState(false); // <--- විභාගය පටන් ගත්තද බලන අලුත් State එක
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({}); 
  const [timeLeft, setTimeLeft] = useState(600); // තත්පර 600 (විනාඩි 10)
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/auth');
      return;
    }

    const userObj = JSON.parse(storedUser);
    setUserName(userObj.name);
    const storedAvatar = localStorage.getItem('userAvatar');
    if (storedAvatar) setAvatar(storedAvatar);

    // Database එකෙන් ප්‍රශ්න ගෙන ඒම
    const fetchQuestions = async () => {
      try {
        const res = await fetch('/api/questions', { cache: 'no-store' }); 
        const data = await res.json();
        
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
        }
      } catch (error) {
        console.error("ප්‍රශ්න ගෙන ඒමේ දෝෂයක්:", error);
      } finally {
        setExamLoading(false);
      }
    };

    fetchQuestions();
  }, [router]);

  // Timer එක වැඩ කිරීම (විභාගය පටන් ගත්තට පස්සේ විතරයි වැඩ කරන්නේ)
  useEffect(() => {
    if (examLoading || questions.length === 0 || !examStarted) return; 
    
    if (isSubmitted || timeLeft <= 0) {
      if (timeLeft <= 0 && !isSubmitted) handleSubmit(); 
      return;
    }
    const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, isSubmitted, examLoading, questions.length, examStarted]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (optionIndex) => {
    setAnswers({
      ...answers,
      [questions[currentQuestion]._id]: optionIndex 
    });
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('user');
    router.push('/auth');
  };

  const handleSubmit = async () => {
    let finalScore = 0;
    questions.forEach(q => {
      if (answers[q._id] === parseInt(q.correctAnswer)) finalScore += 1;
    });
    setScore(finalScore);
    setIsSubmitted(true);

    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        const percentage = Math.round((finalScore / questions.length) * 100);
        const paperName = questions[0]?.paperName || 'Online MCQ Exam';

        await fetch('/api/marks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userObj.email,
            paperName: paperName, 
            score: percentage,
            examType: 'Online' 
          })
        });
      }
    } catch (error) {
      console.error("ලකුණු Save කිරීමේ දෝෂයක්:", error);
    }
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
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/exam'); }} className="flex items-center space-x-3 bg-blue-800 px-4 py-3 rounded-lg transition border-l-4 border-blue-400">
            <span className="text-xl">💻</span><span className="font-bold text-blue-100">Online විභාග</span>
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
          
          <div className="pt-4 border-t border-blue-800/50 mt-4 mb-2"></div>

          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/notifications'); }} className="flex items-center space-x-3 hover:bg-blue-800 px-4 py-3 rounded-lg transition">
            <span className="text-xl">🔔</span><span className="font-medium">දැනුම්දීම්</span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/settings'); }} className="flex items-center space-x-3 hover:bg-blue-800 px-4 py-3 rounded-lg transition">
            <span className="text-xl">⚙️</span><span className="font-medium">සැකසුම්</span>
          </a>
        </nav>
        <div className="p-4 border-t border-blue-800">
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 hover:bg-red-500/20 p-3 rounded-lg transition text-blue-200 hover:text-red-400">
            <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-white font-bold text-sm">
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
            <h1 className="text-xl font-extrabold text-blue-900 flex items-center gap-2">
              <span className="text-2xl hidden sm:block">💻</span> Online විභාගය
            </h1>
          </div>
          
          {/* විභාගය පටන් ගත්තට පස්සේ විතරක් Timer එක පෙන්වයි */}
          {(examStarted && !isSubmitted && questions.length > 0) && (
             <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg sm:text-xl font-bold shadow-sm ${timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-50 text-blue-700'}`}>
               <span>⏱️</span> {formatTime(timeLeft)}
             </div>
          )}
        </header>

        {/* Content */}
        <div className="p-4 md:p-8 pb-20 max-w-6xl mx-auto w-full">
          
          {examLoading ? (
             <div className="text-center mt-20 text-slate-500 font-bold text-lg animate-pulse flex flex-col items-center">
               <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
               විභාගය පූරණය වෙමින් පවතී... ⏳
             </div>
          ) : questions.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center mt-10">
              <span className="text-6xl block mb-4 opacity-50">📭</span>
              <h2 className="text-xl font-bold text-slate-700">දැනට Online විභාග කිසිවක් නොමැත.</h2>
              <p className="text-slate-500 mt-2">පසුව නැවත පරීක්ෂා කරන්න.</p>
            </div>
          ) : !examStarted ? (

            /* --- විභාගය ආරම්භ කිරීමට පෙර තිරය (Start Screen) --- */
            <div className="bg-white p-10 md:p-14 rounded-3xl shadow-lg border border-slate-100 text-center mt-10 max-w-2xl mx-auto animate-fade-in">
              <span className="text-7xl block mb-6">🚀</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-6">විභාගය සඳහා සූදානම්ද?</h2>
              
              <div className="bg-blue-50 p-6 rounded-2xl text-left mb-8 border border-blue-100 inline-block w-full">
                <ul className="space-y-4 text-gray-700 font-medium">
                  <li className="flex items-center gap-3"><span className="text-blue-600 text-xl">📝</span> ප්‍රශ්න ගණන: <span className="font-bold text-blue-900">{questions.length}</span></li>
                  <li className="flex items-center gap-3"><span className="text-blue-600 text-xl">⏱️</span> ලබා දී ඇති කාලය: <span className="font-bold text-blue-900">විනාඩි 10 යි</span></li>
                  <li className="flex items-center gap-3"><span className="text-amber-500 text-xl">⚠️</span> විභාගය අතරතුර පිටුව Refresh කිරීමෙන් වළකින්න.</li>
                </ul>
              </div>

              <button 
                onClick={() => setExamStarted(true)} 
                className="bg-blue-600 text-white font-bold text-lg px-10 py-4 rounded-full shadow-lg hover:bg-blue-700 transition transform hover:scale-105 w-full sm:w-auto"
              >
                විභාගය ආරම්භ කරන්න
              </button>
            </div>

          ) : isSubmitted ? (

             /* --- ප්‍රතිඵල පෙන්වන තිරය (Result Screen) --- */
            <div className="flex flex-col items-center animate-fade-in">
              <div className="bg-white p-10 rounded-3xl shadow-lg max-w-4xl w-full text-center border-t-8 border-green-500 mb-8">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">විභාගය අවසන්!</h2>
                <p className="text-gray-500 mb-8">ඔබේ පිළිතුරු පත්‍රය සාර්ථකව පරීක්ෂා කරන ලදී.</p>
                
                <div className="flex flex-wrap justify-center gap-6 mb-8">
                  <div className="bg-blue-50 p-6 rounded-2xl w-40 border border-blue-100">
                    <p className="text-sm text-blue-600 font-bold mb-1">ලකුණු</p>
                    <p className="text-4xl font-bold text-blue-900">{score}/{questions.length}</p>
                  </div>
                  <div className={`p-6 rounded-2xl w-40 border ${(Math.round((score / questions.length) * 100)) >= 50 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                    <p className={`text-sm font-bold mb-1 ${(Math.round((score / questions.length) * 100)) >= 50 ? 'text-green-600' : 'text-red-600'}`}>ප්‍රතිශතය</p>
                    <p className={`text-4xl font-bold ${(Math.round((score / questions.length) * 100)) >= 50 ? 'text-green-600' : 'text-red-600'}`}>{(Math.round((score / questions.length) * 100))}%</p>
                  </div>
                </div>
                <button onClick={() => router.push('/dashboard/marks')} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-md transition">
                  ප්‍රගති වාර්තාව බලන්න
                </button>
              </div>

              {/* Review Section */}
              <div className="bg-white p-8 rounded-3xl shadow-lg max-w-4xl w-full">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center border-b pb-4">
                  <span className="mr-3 text-3xl">🔍</span> පිළිතුරු සමාලෝචනය
                </h2>
                <div className="space-y-6">
                  {questions.map((q, index) => {
                    const userAnswerIndex = answers[q._id];
                    const isCorrect = userAnswerIndex === parseInt(q.correctAnswer);
                    const isUnanswered = userAnswerIndex === undefined;

                    return (
                      <div key={q._id} className={`p-6 rounded-2xl border-2 transition-all ${isCorrect ? 'border-green-200 bg-green-50' : isUnanswered ? 'border-gray-200 bg-gray-50' : 'border-red-200 bg-red-50'}`}>
                        <h3 className="font-bold text-gray-800 text-lg mb-4 leading-relaxed">
                          {index + 1}. {q.text}
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-start md:items-center gap-3 flex-col md:flex-row">
                            <span className="text-sm font-bold text-gray-500 w-32 shrink-0">ඔබේ පිළිතුර :</span>
                            {isUnanswered ? (
                              <span className="text-gray-500 font-bold bg-white px-4 py-2 rounded-lg border border-gray-300 shadow-sm">⚠️ පිළිතුරු දී නැත</span>
                            ) : (
                              <span className={`font-bold px-4 py-2 rounded-lg shadow-sm ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                {isCorrect ? '✅' : '❌'} {q.options[userAnswerIndex]}
                              </span>
                            )}
                          </div>
                          {!isCorrect && (
                            <div className="flex items-start md:items-center gap-3 flex-col md:flex-row mt-2">
                              <span className="text-sm font-bold text-gray-500 w-32 shrink-0">නිවැරදි පිළිතුර :</span>
                              <span className="font-bold px-4 py-2 rounded-lg bg-green-100 text-green-800 border border-green-300 shadow-sm">
                                ✅ {q.options[parseInt(q.correctAnswer)]}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          ) : (

            /* --- විභාගය කරන තිරය (Exam Interface) --- */
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in">
              <div className="lg:col-span-3 flex flex-col h-full">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-10 flex-1">
                  <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <span className="bg-blue-100 text-blue-700 font-bold px-4 py-1.5 rounded-full text-sm">
                      ප්‍රශ්නය {currentQuestion + 1} / {questions.length}
                    </span>
                  </div>
                  
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-8 leading-relaxed">
                    {currentQuestion + 1}. {questions[currentQuestion].text}
                  </h2>

                  <div className="space-y-3">
                    {questions[currentQuestion].options.map((option, index) => {
                      const isSelected = answers[questions[currentQuestion]._id] === index;
                      return (
                        <div 
                          key={index} 
                          onClick={() => handleSelectAnswer(index)}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-center gap-4 ${isSelected ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-100 hover:border-blue-300 hover:bg-gray-50'}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 transition-colors ${isSelected ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-300 text-gray-500'}`}>
                            {index + 1}
                          </div>
                          <span className={`text-lg ${isSelected ? 'text-blue-900 font-bold' : 'text-gray-700 font-medium'}`}>{option}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6">
                  <button 
                    onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestion === 0}
                    className={`px-6 py-3 rounded-xl font-bold transition shadow-sm ${currentQuestion === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                  >
                    ← පෙර ප්‍රශ්නය
                  </button>
                  
                  {currentQuestion === questions.length - 1 ? (
                    <button onClick={handleSubmit} className="px-8 py-3 rounded-xl font-bold bg-green-500 hover:bg-green-600 text-white shadow-md transition transform hover:-translate-y-0.5">
                      පිළිතුරු යවන්න
                    </button>
                  ) : (
                    <button 
                      onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                      className="px-6 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition"
                    >
                      ඊළඟ ප්‍රශ්නය →
                    </button>
                  )}
                </div>
              </div>

              {/* දකුණු පැත්තේ ප්‍රශ්න ලැයිස්තුව */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 h-fit sticky top-24">
                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">ප්‍රශ්න ලැයිස්තුව</h3>
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-2">
                  {questions.map((question, index) => {
                    const isAnswered = answers[question._id] !== undefined;
                    const isCurrent = currentQuestion === index;
                    return (
                      <button 
                        key={question._id}
                        onClick={() => setCurrentQuestion(index)}
                        className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center transition border-2 
                          ${isCurrent ? 'border-blue-600 ring-2 ring-blue-200 shadow-sm' : 'border-transparent'} 
                          ${isAnswered ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
                        `}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
                
                <div className="mt-6 space-y-2 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-100 rounded"></div><span className="text-gray-600 font-medium">පිළිතුරු දුන්</span></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-200 rounded"></div><span className="text-gray-600 font-medium">පිළිතුරු නොදුන්</span></div>
                </div>
                
                <button onClick={handleSubmit} className="w-full mt-6 bg-red-50 text-red-600 font-bold py-3 rounded-xl hover:bg-red-100 transition border border-red-200 shadow-sm">
                  දැන්ම Submit කරන්න
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}