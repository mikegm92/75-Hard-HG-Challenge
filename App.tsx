
import React, { useState, useEffect } from 'react';
import { ChallengeState, DayProgress, Task } from './types';
import { INITIAL_TASKS, TOTAL_DAYS, WATER_GOAL_OZ } from './constants';
import Layout from './components/Layout';
import ProgressBar from './components/ProgressBar';
import WaterTracker from './components/WaterTracker';
import { getCoachFeedback } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<ChallengeState>(() => {
    const saved = localStorage.getItem('hard75_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.books) parsed.books = [];
        parsed.history = parsed.history.map((day: any) => ({
          ...day,
          readingBooks: day.readingBooks || (day.readingBook ? [day.readingBook] : []),
          success: day.success !== undefined ? day.success : day.isCompleted
        }));
        return parsed;
      } catch (e) {
        console.error("Parse error", e);
      }
    }
    return {
      currentDay: 1,
      startDate: new Date().toISOString(),
      isFailed: false,
      books: [],
      history: [{
        dayNumber: 1,
        date: new Date().toISOString().split('T')[0],
        tasks: [...INITIAL_TASKS],
        waterOunces: 0,
        readingBooks: [],
        isCompleted: false,
        success: false
      }]
    };
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');
  const [editingDayNum, setEditingDayNum] = useState<number | null>(null);
  const [coachResponse, setCoachResponse] = useState<string>("Serving iconic vibes...");
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState("");

  useEffect(() => {
    localStorage.setItem('hard75_state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const fetchFeedback = async () => {
      const today = state.history.find(d => d.dayNumber === state.currentDay);
      if (today) {
        const feedback = await getCoachFeedback(today);
        setCoachResponse(feedback);
      }
    };
    fetchFeedback();
  }, [state.currentDay]);

  const updateDayState = (dayNumber: number, updater: (day: DayProgress) => Partial<DayProgress>) => {
    setState(prev => {
      const newHistory = prev.history.map(day => {
        if (day.dayNumber === dayNumber) {
          const updatedDay = { ...day, ...updater(day) };
          if (updatedDay.isCompleted) {
            const allTasksDone = updatedDay.tasks.every(t => t.completed) && updatedDay.waterOunces >= WATER_GOAL_OZ;
            updatedDay.success = allTasksDone;
          }
          return updatedDay;
        }
        return day;
      });
      return { ...prev, history: newHistory };
    });
  };

  const toggleTask = (taskId: string, dayNumber: number) => {
    updateDayState(dayNumber, (day) => ({
      tasks: day.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
    }));
  };

  const updateWater = (oz: number, dayNumber: number) => {
    updateDayState(dayNumber, (day) => ({
      waterOunces: oz,
      tasks: day.tasks.map(t => t.id === 'water' ? { ...t, completed: oz >= WATER_GOAL_OZ } : t)
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, dayNumber: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        updateDayState(dayNumber, (day) => ({
          photoUrl: base64,
          tasks: day.tasks.map(t => t.id === 'photo' ? { ...t, completed: true } : t)
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadPhoto = (url: string, dayNumber: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `glow_up_day_${dayNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleBookForDay = (bookTitle: string, dayNumber: number) => {
    updateDayState(dayNumber, (day) => {
      const currentBooks = day.readingBooks || [];
      const newBooks = currentBooks.includes(bookTitle)
        ? currentBooks.filter(b => b !== bookTitle)
        : [...currentBooks, bookTitle];
      return { readingBooks: newBooks };
    });
  };

  const addNewBook = (e: React.FormEvent, dayNumber: number) => {
    e.preventDefault();
    const trimmed = newBookTitle.trim();
    if (!trimmed) return;
    
    setState(prev => ({
      ...prev,
      books: Array.from(new Set([...prev.books, trimmed]))
    }));
    
    toggleBookForDay(trimmed, dayNumber);
    setNewBookTitle("");
    setIsAddingBook(false);
  };

  const finishDay = () => {
    const todayData = state.history.find(d => d.dayNumber === state.currentDay);
    if (!todayData) return;

    const allTasksDone = todayData.tasks.every(t => t.completed) && todayData.waterOunces >= WATER_GOAL_OZ;

    if (state.currentDay === TOTAL_DAYS) {
      alert("YASS QUEEN! YOU DID IT! 75 DAYS OF ABSOLUTE GLOW.");
      return;
    }
    
    setState(prev => {
      const nextDay = prev.currentDay + 1;
      const updatedHistory = prev.history.map(d => 
        d.dayNumber === prev.currentDay ? { ...d, isCompleted: true, success: allTasksDone } : d
      );

      return {
        ...prev,
        currentDay: nextDay,
        history: [
          ...updatedHistory,
          {
            dayNumber: nextDay,
            date: new Date().toISOString().split('T')[0],
            tasks: [...INITIAL_TASKS],
            waterOunces: 0,
            readingBooks: [],
            isCompleted: false,
            success: false
          }
        ]
      };
    });
  };

  const failChallenge = () => {
    if (confirm("Reset the vibes? This will clear your entire journey and start back at Day 1.")) {
      setState(prev => ({
        currentDay: 1,
        startDate: new Date().toISOString(),
        isFailed: false,
        books: prev.books,
        history: [{
          dayNumber: 1,
          date: new Date().toISOString().split('T')[0],
          tasks: [...INITIAL_TASKS],
          waterOunces: 0,
          readingBooks: [],
          isCompleted: false,
          success: false
        }]
      }));
    }
  };

  const exportToCSV = () => {
    const headers = ["Day", "Date", "Status", "Water_oz", "Books_Read", "Strength", "Cardio", "Reading", "Water", "Photo"];
    const rows = state.history.map(day => {
      const findTask = (type: string) => day.tasks.find(t => t.id === type)?.completed ? "YES" : "NO";
      return [
        day.dayNumber, day.date,
        day.isCompleted ? (day.success ? "ICONIC" : "PARTIAL") : "ACTIVE",
        day.waterOunces, `"${(day.readingBooks || []).join('; ')}"`,
        findTask('strength'), findTask('cardio'), findTask('reading'), findTask('water'), findTask('photo')
      ].join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hot_girl_glow_log.csv`;
    link.click();
  };

  const currentDayData = state.history.find(d => d.dayNumber === state.currentDay);
  const editingDayData = editingDayNum ? state.history.find(d => d.dayNumber === editingDayNum) : null;
  const isTodayComplete = currentDayData?.tasks.every(t => t.completed) && (currentDayData?.waterOunces || 0) >= WATER_GOAL_OZ;

  const renderDayView = (day: DayProgress, isCurrentDay: boolean) => (
    <div className="p-6 space-y-8 pb-24 animate-in fade-in zoom-in-95 duration-700">
      <div className="text-center space-y-4">
        <h2 className="text-7xl font-black text-white italic tracking-tighter drop-shadow-[0_0_20px_rgba(236,72,153,0.3)]">
          <span className="text-pink-500 opacity-80">#</span>{day.dayNumber}
        </h2>
        {isCurrentDay && <ProgressBar currentDay={day.dayNumber} />}
        {!isCurrentDay && (
           <div className={`px-4 py-1.5 inline-block rounded-full text-[10px] font-black uppercase tracking-widest ${day.success ? 'bg-gradient-to-r from-emerald-500/20 to-teal-400/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              {day.success ? 'Pure Main Character Energy' : 'Incomplete Vibes'}
           </div>
        )}
        <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">{day.date}</p>
      </div>

      {isCurrentDay && (
        <div className="bg-gradient-to-br from-pink-600/10 to-rose-600/5 border border-pink-500/20 p-5 rounded-3xl backdrop-blur-md">
          <p className="text-pink-400 font-black text-[10px] uppercase tracking-[0.2em] mb-2 flex items-center">
            <i className="fa-solid fa-quote-left mr-2"></i> Daily Slay
          </p>
          <p className="text-sm text-slate-100 italic leading-relaxed font-bold tracking-tight">
            "{coachResponse}"
          </p>
        </div>
      )}

      {!isCurrentDay && (
        <button 
          onClick={() => setEditingDayNum(null)}
          className="w-full bg-slate-900 border border-pink-500/10 text-slate-300 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-pink-500/10 transition-colors"
        >
          <i className="fa-solid fa-arrow-left text-[8px]"></i> Back to Collection
        </button>
      )}

      {/* Hydration Slay Moved Above Checklist */}
      <WaterTracker currentOz={day.waterOunces} onUpdate={(oz) => updateWater(oz, day.dayNumber)} />

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-pink-300/40 uppercase tracking-[0.3em]">The Checklist</h3>
        <div className="space-y-3">
          {day.tasks.map(task => (
            <div key={task.id} className="flex flex-col gap-2">
              <div 
                onClick={() => task.id !== 'photo' && task.id !== 'water' && toggleTask(task.id, day.dayNumber)}
                className={`group relative flex items-center p-5 rounded-[1.5rem] border transition-all duration-300 cursor-pointer ${
                  task.completed 
                    ? 'bg-pink-500/5 border-pink-500/30 opacity-70' 
                    : 'bg-slate-900 border-pink-500/10 hover:border-pink-500/40 shadow-lg'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center mr-4 transition-all duration-500 ${
                  task.completed 
                  ? 'bg-gradient-to-br from-pink-500 to-rose-400 border-transparent shadow-[0_0_10px_rgba(236,72,153,0.5)]' 
                  : 'border-slate-700 group-hover:border-pink-500/50'
                }`}>
                  {task.completed && <i className="fa-solid fa-check text-white text-[10px]"></i>}
                </div>
                <span className={`text-[13px] font-black tracking-tight uppercase ${task.completed ? 'text-pink-300/40 line-through' : 'text-slate-200'}`}>
                  {task.label}
                </span>

                {task.id === 'photo' && !task.completed && (
                  <label className="absolute inset-0 cursor-pointer flex items-center justify-end pr-4">
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFileUpload(e, day.dayNumber)} />
                    <div className="bg-gradient-to-r from-pink-600 to-rose-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-black shadow-lg uppercase tracking-widest">
                      Snap
                    </div>
                  </label>
                )}
                {task.id === 'photo' && task.completed && day.photoUrl && (
                  <div className="ml-auto flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); downloadPhoto(day.photoUrl!, day.dayNumber); }}
                      className="bg-slate-800 text-pink-400 p-2 rounded-xl border border-pink-500/20 hover:bg-pink-500/10 transition-colors shadow-lg"
                      title="Download Slay"
                    >
                      <i className="fa-solid fa-download text-[10px]"></i>
                    </button>
                    <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-pink-500/30 shadow-lg">
                      <img src={day.photoUrl} alt="Progress" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </div>

              {task.id === 'reading' && (
                <div className="px-2 space-y-3 pt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black text-pink-300/40 uppercase tracking-[0.2em]">Reading Collection</span>
                    <button 
                      onClick={() => setIsAddingBook(!isAddingBook)}
                      className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full transition-all ${
                        isAddingBook ? 'text-red-400 bg-red-400/10 border border-red-500/20' : 'text-pink-400 bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20'
                      }`}
                    >
                      {isAddingBook ? 'Dismiss' : '+ Add Book'}
                    </button>
                  </div>

                  {isAddingBook && (
                    <form onSubmit={(e) => addNewBook(e, day.dayNumber)} className="flex gap-2 animate-in slide-in-from-top-2 duration-300">
                      <input 
                        autoFocus
                        value={newBookTitle}
                        onChange={(e) => setNewBookTitle(e.target.value)}
                        placeholder="What's on the shelf?"
                        className="flex-1 bg-slate-950 border border-pink-500/30 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-pink-500 transition-all shadow-xl"
                      />
                      <button type="submit" className="bg-gradient-to-br from-pink-500 to-rose-400 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase shadow-lg">Add</button>
                    </form>
                  )}

                  <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2 p-1">
                    {state.books.map((book, idx) => (
                      <div 
                        key={idx}
                        onClick={() => toggleBookForDay(book, day.dayNumber)}
                        className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          day.readingBooks?.includes(book)
                            ? 'bg-pink-500/10 border-pink-500/40 text-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.1)]'
                            : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-pink-500/20'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                          day.readingBooks?.includes(book) 
                            ? 'bg-pink-500 border-pink-500 text-white' 
                            : 'border-slate-700'
                        }`}>
                          {day.readingBooks?.includes(book) && <i className="fa-solid fa-check text-[9px]"></i>}
                        </div>
                        <span className="text-xs font-black tracking-tight uppercase">{book}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {isCurrentDay && (
        <div className="pt-8 flex flex-col gap-4">
          <button 
            onClick={finishDay}
            className={`w-full font-black py-6 rounded-[2rem] transition-all uppercase tracking-[0.2em] text-lg shadow-[0_15px_35px_rgba(0,0,0,0.3)] active:translate-y-1 active:shadow-none ${
              isTodayComplete 
              ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-emerald-900/40' 
              : 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-pink-900/40'
            }`}
          >
            {isTodayComplete ? `Slay Day ${state.currentDay}` : `Lock in Day ${state.currentDay}`}
          </button>
          
          <button 
            onClick={failChallenge}
            className="mt-6 text-slate-600 hover:text-red-400 text-[10px] font-black uppercase tracking-[0.3em] transition-colors flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-rotate-left text-[8px]"></i> Restart the Day
          </button>
        </div>
      )}
    </div>
  );

  return (
    <Layout activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setEditingDayNum(null); }}>
      {activeTab === 'dashboard' && currentDayData && renderDayView(currentDayData, true)}

      {activeTab === 'history' && (
        <div className="min-h-full">
          {!editingDayNum ? (
            <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center">
                <h3 className="text-[11px] font-black text-pink-300/40 uppercase tracking-[0.3em]">The Glow Log</h3>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={exportToCSV}
                    className="p-2.5 px-4 bg-slate-900 border border-pink-500/10 text-pink-300 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-pink-500/10 hover:border-pink-500/30 transition-all flex items-center gap-2"
                  >
                    <i className="fa-solid fa-file-export text-[10px]"></i>
                    Export
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2.5">
                {Array.from({ length: TOTAL_DAYS }).map((_, i) => {
                  const dayNum = i + 1;
                  const dayData = state.history.find(h => h.dayNumber === dayNum);
                  const isCurrent = state.currentDay === dayNum;
                  
                  let bgColor = 'bg-slate-900/50 border-pink-500/5 text-slate-700';
                  if (dayData?.isCompleted) {
                    bgColor = dayData.success 
                      ? 'bg-pink-500/10 border-pink-500/40 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.1)]' 
                      : 'bg-red-500/10 border-red-500/30 text-red-400';
                  } else if (isCurrent) {
                    bgColor = 'bg-pink-500/20 border-pink-500 border-2 text-white animate-pulse shadow-[0_0_20px_rgba(236,72,153,0.2)]';
                  }

                  return (
                    <div 
                      key={i}
                      onClick={() => dayData && setEditingDayNum(dayNum)}
                      className={`aspect-square rounded-2xl border flex items-center justify-center text-[11px] font-black transition-all cursor-pointer hover:scale-110 active:scale-90 ${bgColor}`}
                    >
                      {dayNum}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-6 pt-4">
                <h4 className="text-[10px] font-black text-pink-300/40 uppercase tracking-[0.3em]">Timeline</h4>
                {[...state.history].reverse().slice(0, 15).map(day => (
                  <div 
                    key={day.dayNumber} 
                    onClick={() => setEditingDayNum(day.dayNumber)}
                    className={`border rounded-[2rem] p-5 flex gap-5 transition-all cursor-pointer group hover:bg-pink-500/5 hover:border-pink-500/30 ${
                    day.isCompleted 
                    ? (day.success ? 'bg-slate-900/80 border-pink-500/10 shadow-xl' : 'bg-red-500/5 border-red-500/10')
                    : 'bg-slate-900/40 border-slate-800 opacity-50'
                  }`}>
                    <div className="relative w-20 h-20 rounded-2xl bg-slate-950 overflow-hidden flex-shrink-0 border border-pink-500/10 group-hover:border-pink-500/30 shadow-inner">
                      {day.photoUrl ? (
                        <>
                          <img src={day.photoUrl} alt="Day" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                          <button 
                            onClick={(e) => { e.stopPropagation(); downloadPhoto(day.photoUrl!, day.dayNumber); }}
                            className="absolute bottom-1 right-1 p-1 bg-pink-500 text-white rounded-lg text-[8px] opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            title="Download"
                          >
                            <i className="fa-solid fa-download"></i>
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-800">
                          <i className="fa-solid fa-camera-retro text-xl"></i>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="text-xl font-black text-white italic tracking-tighter">DAY {day.dayNumber}</span>
                          {day.isCompleted && (
                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${day.success ? 'text-pink-400' : 'text-red-500'}`}>
                              {day.success ? 'Pure Icon' : 'Partial'}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">{day.date}</span>
                      </div>
                      
                      <div className="flex gap-1.5 my-3">
                        {day.tasks.map(t => (
                          <div key={t.id} className={`w-2 h-1 rounded-full ${t.completed ? 'bg-pink-500' : 'bg-slate-800'}`} />
                        ))}
                      </div>

                      <div className="flex justify-between items-end">
                        <div className="text-[10px] font-black uppercase tracking-widest text-fuchsia-400/60">
                          {day.waterOunces}oz Glow-up
                        </div>
                        <i className="fa-solid fa-chevron-right text-[8px] text-pink-500/40 group-hover:translate-x-1 transition-transform"></i>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            editingDayData && renderDayView(editingDayData, false)
          )}
        </div>
      )}
    </Layout>
  );
};

export default App;
