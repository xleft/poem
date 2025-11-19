
import React, { useState, useEffect, useRef } from 'react';
import { AppScreen, Poem, KeywordCard, PoetLetter, UserCollectionItem, Language } from './types';
import { recommendPoem, analyzePoemKeywords, generatePoetLetter } from './services/geminiService';
import { InkBackground } from './components/InkBackground';
import { Button } from './components/Button';
import { LoadingOverlay } from './components/LoadingOverlay';
import { SplashScreen } from './components/SplashScreen';
import { POETIC_MOODS_ZH, POETIC_MOODS_EN, INK_PATHS, TRANSLATIONS } from './constants';

// SVG Icons
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const MountainIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>;
const WineIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 22h8"/><path d="M7 10h10"/><path d="M12 15v7"/><path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z"/></svg>;
const ChevronLeft = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;

// Toast Component
const Toast = ({ message, show, onClose }: { message: string; show: boolean; onClose: () => void }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-12 left-1/2 transform -translate-x-1/2 z-[60] bg-stone-900/90 text-stone-50 px-6 py-3 rounded-full shadow-xl backdrop-blur-md flex items-center gap-2 animate-fade-in-down">
      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
      <span className="text-sm font-serif tracking-widest">{message}</span>
    </div>
  );
};

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen | 'SINGLE_CARD'>(AppScreen.SPLASH);
  const [language, setLanguage] = useState<Language>('zh');
  const T = TRANSLATIONS[language]; // Helper for current language texts

  // Navigation History Stack to handle "Back" correctly
  const [historyStack, setHistoryStack] = useState<(AppScreen | 'SINGLE_CARD')[]>([]);

  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [poemSource, setPoemSource] = useState<'search' | 'random' | 'collection'>('search');
  const [collectionTab, setCollectionTab] = useState<'poems' | 'cards' | 'letters'>('poems');
  
  // Data State
  const [currentPoem, setCurrentPoem] = useState<Poem | null>(null);
  const [poemCards, setPoemCards] = useState<KeywordCard[]>([]);
  const [currentLetter, setCurrentLetter] = useState<PoetLetter | null>(null);
  const [currentCard, setCurrentCard] = useState<KeywordCard | null>(null); // For Single Card View
  const [collectedItems, setCollectedItems] = useState<UserCollectionItem[]>([]);
  
  // UI State
  const [isStampAnimating, setIsStampAnimating] = useState(false);
  const [toast, setToast] = useState<{show: boolean, message: string}>({ show: false, message: '' });
  
  // Navigation Helper
  const navigateTo = (screen: AppScreen | 'SINGLE_CARD') => {
    setHistoryStack(prev => [...prev, currentScreen]);
    setCurrentScreen(screen);
  };

  const goBack = () => {
    if (historyStack.length > 0) {
      const prev = historyStack[historyStack.length - 1];
      setHistoryStack(prevStack => prevStack.slice(0, -1));
      setCurrentScreen(prev);
    } else {
      setCurrentScreen(AppScreen.HOME);
    }
  };

  const handleSplashComplete = (lang: Language) => {
      setLanguage(lang);
      setCurrentScreen(AppScreen.HOME);
  };

  // Handlers
  const handleFindPoem = async () => {
    if (!userInput.trim()) return;
    setLoading(true);
    setPoemSource('search');
    setCurrentLetter(null); 
    try {
      const poem = await recommendPoem(userInput, language);
      setCurrentPoem(poem);
      setPoemCards([]); // Reset cards for new poem
      navigateTo(AppScreen.POEM_DISPLAY);
    } catch (e) {
      alert("Failed to find a poem. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRandomPoem = async () => {
    setLoading(true);
    setPoemSource('random');
    setCurrentLetter(null);
    try {
      // Artificially wait at least 2 seconds to show the beautiful ink animation
      const delayPromise = new Promise(resolve => setTimeout(resolve, 2500));
      
      const moods = language === 'zh' ? POETIC_MOODS_ZH : POETIC_MOODS_EN;
      const randomMood = moods[Math.floor(Math.random() * moods.length)];
      const poemPromise = recommendPoem(randomMood, language);
      
      const [poem] = await Promise.all([poemPromise, delayPromise]);
      
      setCurrentPoem(poem);
      setPoemCards([]);
      navigateTo(AppScreen.POEM_DISPLAY);
    } catch (e) {
       console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenShanHeZhi = async () => {
    if (!currentPoem) return;
    setCurrentScreen(AppScreen.SHAN_HE_ZHI); 
    
    if (poemCards.length === 0) {
      setLoading(true);
      const cards = await analyzePoemKeywords(currentPoem, language);
      setPoemCards(cards);
      setLoading(false);
    }
  };

  const handleOpenLetter = async () => {
    if (!currentPoem) return;
    navigateTo(AppScreen.LETTER);
    
    // If we haven't generated a letter for this specific interaction yet
    if (!currentLetter || (currentLetter.poet !== currentPoem.author)) {
      setLoading(true);
      // Use user input or a default context if random poem
      const context = poemSource === 'search' ? userInput : (language === 'zh' ? "我读到这首诗，心中若有所感" : "I read this poem and felt moved.");
      const letter = await generatePoetLetter(currentPoem, context, language);
      setCurrentLetter(letter);
      setLoading(false);
    }
  };

  const toggleCollection = (item: KeywordCard | Poem | PoetLetter, type: 'card' | 'poem' | 'letter') => {
    let isAlreadyCollected = false;
    let itemIdToRemove = '';

    // Check duplicates based on type
    if (type === 'poem') {
       const existing = collectedItems.find(
         (c) => c.type === 'poem' && (c.data as Poem).title === (item as Poem).title
       );
       if (existing) { isAlreadyCollected = true; itemIdToRemove = existing.id; }
    } else if (type === 'card') {
       const existing = collectedItems.find(
         (c) => c.type === 'card' && (c.data as KeywordCard).term === (item as KeywordCard).term
       );
       if (existing) { isAlreadyCollected = true; itemIdToRemove = existing.id; }
    } else if (type === 'letter') {
       const existing = collectedItems.find(
          (c) => c.type === 'letter' && 
                 (c.data as PoetLetter).poet === (item as PoetLetter).poet &&
                 (c.data as PoetLetter).content.substring(0, 10) === (item as PoetLetter).content.substring(0, 10)
       );
       if (existing) { isAlreadyCollected = true; itemIdToRemove = existing.id; }
    }

    if (isAlreadyCollected) {
      // Remove logic
      setCollectedItems(prev => prev.filter(i => i.id !== itemIdToRemove));
      setToast({ show: true, message: T.toastRemoved });
    } else {
      // Add logic
      const newItem: UserCollectionItem = {
        id: Date.now().toString(),
        type,
        data: item as any,
        date: new Date().toISOString(),
        sourcePrompt: (type === 'poem' && poemSource === 'search') ? userInput : undefined,
        language: language
      };
      
      setCollectedItems([...collectedItems, newItem]);
      
      setIsStampAnimating(true);
      setTimeout(() => setIsStampAnimating(false), 600);
      setToast({ show: true, message: T.toastCollected });
    }
  };

  const viewCollectionItem = (item: UserCollectionItem) => {
    if (item.type === 'poem') {
      setCurrentPoem(item.data as Poem);
      if (item.sourcePrompt) {
        setUserInput(item.sourcePrompt);
        setPoemSource('search');
      } else {
        setPoemSource('collection');
      }
      navigateTo(AppScreen.POEM_DISPLAY);
    } else if (item.type === 'card') {
      setCurrentCard(item.data as KeywordCard);
      navigateTo('SINGLE_CARD');
    } else if (item.type === 'letter') {
      setCurrentLetter(item.data as PoetLetter);
      navigateTo(AppScreen.LETTER);
    }
  };

  // --- Checkers ---
  const isCollected = (item: any, type: 'poem' | 'card' | 'letter') => {
      if (!item) return false;
      if (type === 'poem') return collectedItems.some(i => i.type === 'poem' && (i.data as Poem).title === item.title);
      if (type === 'card') return collectedItems.some(i => i.type === 'card' && (i.data as KeywordCard).term === item.term);
      if (type === 'letter') return collectedItems.some(i => i.type === 'letter' && (i.data as PoetLetter).content.substring(0,10) === item.content.substring(0,10));
      return false;
  };

  // --- Render Components ---

  const renderHome = () => (
    <div className="flex flex-col h-full p-6 animate-ink relative">
      <header className="flex justify-between items-center mb-12 transition-opacity duration-500" style={{ opacity: loading ? 0 : 1 }}>
        <h1 className={`text-3xl font-bold text-stone-900 ${language === 'zh' ? 'font-calligraphy' : 'font-serif tracking-widest'}`}>
            {T.title}
        </h1>
        <div className="cursor-pointer group" onClick={() => navigateTo(AppScreen.COLLECTION)}>
           <div className={`text-2xl text-stone-800 border-b-2 border-stone-300 pb-1 hover:text-stone-900 hover:border-stone-800 transition-colors ${language === 'zh' ? 'font-calligraphy' : 'font-serif'}`}>
              {T.myCollection}
           </div>
        </div>
      </header>

      <main className={`flex-1 flex flex-col justify-center items-center z-10 transition-opacity duration-500 ${loading ? 'opacity-0 pointer-events-none' : ''}`}>
        <div className="w-full max-w-md bg-white/50 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-stone-200">
          <textarea
            className="w-full bg-transparent border-none resize-none focus:ring-0 text-stone-700 font-serif text-lg placeholder:text-stone-400 h-32"
            placeholder={T.placeholder}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div className="mt-12 flex gap-6">
          <Button variant="secondary" onClick={handleRandomPoem} disabled={loading}>{T.randomBtn}</Button>
          <Button onClick={handleFindPoem} disabled={loading} icon={<SearchIcon />}>
            {T.searchBtn}
          </Button>
        </div>
      </main>
    </div>
  );

  const renderCollection = () => {
    // Filter items by current language to avoid mixing Chinese poems with English UI
    const langItems = collectedItems.filter(i => i.language === language);
    const poems = langItems.filter(i => i.type === 'poem');
    const cards = langItems.filter(i => i.type === 'card');
    const letters = langItems.filter(i => i.type === 'letter');

    const TabButton = ({ id, label }: { id: 'poems' | 'cards' | 'letters', label: string }) => {
        const isActive = collectionTab === id;
        return (
            <button 
                onClick={() => setCollectionTab(id)}
                className="relative px-3 sm:px-4 py-2 font-serif tracking-widest transition-all duration-300 flex flex-col items-center justify-center group shrink-0"
            >
                {/* Text */}
                <span className={`relative z-10 text-base sm:text-lg whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-stone-900 font-bold' : 'text-stone-400 group-hover:text-stone-600'}`}>
                    {label}
                </span>
                
                {/* Brush Stroke Underline */}
                <div className={`absolute -bottom-2 left-0 right-0 h-4 pointer-events-none transition-opacity duration-500 flex justify-center ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                   <svg viewBox="0 0 60 12" className="h-full w-auto max-w-[80%] overflow-visible" preserveAspectRatio="none">
                       <defs>
                           <filter id="rough-edge">
                               <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="2" result="noise" />
                               <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
                           </filter>
                       </defs>
                       <path 
                         d="M2,6 Q15,9 30,6 T58,6" 
                         stroke="currentColor" 
                         strokeWidth="4" 
                         fill="none" 
                         className="text-stone-800" 
                         strokeLinecap="round"
                         style={{ filter: 'url(#rough-edge)' }}
                       />
                   </svg>
                </div>
            </button>
        );
    }

    return (
      <div className="flex flex-col h-full bg-[#f5f5f4] animate-ink relative">
         <Toast show={toast.show} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
         
         {/* Minimal Header */}
         <div className="flex items-center justify-center pt-10 pb-4 relative shrink-0">
             <button onClick={goBack} className="absolute left-6 p-2 text-stone-500 hover:text-stone-900 transition">
                <ChevronLeft />
             </button>
             <h2 className={`text-4xl text-stone-900 ${language === 'zh' ? 'font-calligraphy' : 'font-serif tracking-widest'}`}>
                {T.myCollection}
             </h2>
         </div>
         
         {/* Clean Brush Tabs */}
         <div className="flex justify-center items-center gap-2 sm:gap-6 mb-8 shrink-0 border-b border-stone-200/50 pb-2 mx-4 overflow-x-auto no-scrollbar">
            <TabButton id="poems" label={T.tabPoems} />
            <TabButton id="cards" label={T.tabCards} />
            <TabButton id="letters" label={T.tabLetters} />
         </div>
  
         <div className="flex-1 overflow-y-auto px-6 pb-10 no-scrollbar">
            
            {/* --- POEMS TAB --- */}
            {collectionTab === 'poems' && (
              poems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-stone-400 gap-4">
                   <p className="font-serif tracking-widest opacity-50">{T.emptyPoems}</p>
                </div>
              ) : (
                <div className="space-y-6">
                   {poems.slice().reverse().map((item) => (
                     <div 
                       key={item.id} 
                       onClick={() => viewCollectionItem(item)}
                       className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer text-center border border-stone-100"
                     >
                        <h3 className="text-2xl font-bold text-stone-900 font-serif mb-3">
                           {(item.data as Poem).title}
                        </h3>
                        <div className="text-stone-500 text-sm font-serif mb-6">
                           {(item.data as Poem).dynasty} · {(item.data as Poem).author}
                        </div>
                        <div className="space-y-2 opacity-60">
                            {(item.data as Poem).content.slice(0, 2).map((line, i) => (
                                <p key={i} className="text-stone-800 font-serif text-lg">{line}</p>
                            ))}
                            {(item.data as Poem).content.length > 2 && <p className="text-stone-400 text-xs pt-2">......</p>}
                        </div>
                     </div>
                   ))}
                </div>
              )
            )}

            {/* --- CARDS TAB --- */}
            {collectionTab === 'cards' && (
               cards.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-64 text-stone-400 gap-4">
                    <p className="font-serif tracking-widest opacity-50">{T.emptyCards}</p>
                 </div>
               ) : (
                 <div className="space-y-6">
                   {cards.slice().reverse().map((item) => {
                      const cardData = item.data as KeywordCard;
                      return (
                        <div key={item.id} 
                             onClick={() => viewCollectionItem(item)}
                             className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-stone-50 relative overflow-hidden group cursor-pointer">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-baseline gap-3">
                                    <h4 className="text-2xl font-bold text-stone-900 font-serif">{cardData.term}</h4>
                                    <span className="text-xs text-stone-500 border border-stone-200 px-2 py-0.5 rounded-full">{cardData.category}</span>
                                </div>
                                <span className="opacity-0 group-hover:opacity-30 text-stone-400 transition"><MountainIcon /></span>
                            </div>
                            <p className="text-stone-600 text-sm leading-loose font-serif line-clamp-2">{cardData.description}</p>
                        </div>
                      );
                   })}
                 </div>
               )
            )}

            {/* --- LETTERS TAB --- */}
            {collectionTab === 'letters' && (
               letters.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-64 text-stone-400 gap-4">
                    <p className="font-serif tracking-widest opacity-50">{T.emptyLetters}</p>
                 </div>
               ) : (
                 <div className="space-y-6">
                   {letters.slice().reverse().map((item) => {
                      const letterData = item.data as PoetLetter;
                      return (
                        <div 
                          key={item.id} 
                          onClick={() => viewCollectionItem(item)}
                          className="bg-[#fcfaf5] p-6 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer border border-stone-200/60 relative"
                        >
                           <div className="absolute inset-0 opacity-30 pointer-events-none mix-blend-multiply z-0" 
                                style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='1' fill='%23a8a29e'/%3E%3C/svg%3E")`}}>
                           </div>
                           <div className="relative z-10">
                             <h3 className="text-lg font-bold text-stone-900 font-serif mb-2 flex items-center gap-2">
                                <span>{letterData.poet} {T.poetLetter}</span>
                                <span className="text-[10px] text-red-800 border border-red-800 px-1 rounded-sm opacity-70">
                                    {language === 'zh' ? `${letterData.poet[0]}印` : 'Seal'}
                                </span>
                             </h3>
                             <p className="text-stone-500 text-sm font-serif line-clamp-3 leading-loose">
                               {letterData.content}
                             </p>
                           </div>
                        </div>
                      );
                   })}
                 </div>
               )
            )}
  
         </div>
      </div>
    );
  };

  const renderPoemDisplay = () => {
    if (!currentPoem) return null;
    const isCollectedState = isCollected(currentPoem, 'poem');

    return (
      <div className="flex flex-col h-full relative animate-ink">
        <Toast show={toast.show} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
        
        <header className="flex items-center px-6 py-4 z-20 shrink-0">
           <button onClick={goBack} className="p-2 rounded-full hover:bg-stone-200 transition">
             <ChevronLeft />
           </button>
        </header>

        <main className="flex-1 w-full overflow-hidden relative z-10 flex justify-center px-4 pb-24">
           <div className="w-full max-w-lg bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-stone-100 flex flex-col relative overflow-hidden">
              
              {/* Seal Button */}
              <button 
                onClick={() => toggleCollection(currentPoem, 'poem')}
                className={`absolute top-4 right-4 z-30 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 
                  ${isCollectedState
                    ? 'bg-red-900/90 text-white border-none ring-2 ring-red-900 ring-offset-2' 
                    : 'bg-white/80 hover:bg-red-50 border-2 border-red-800 text-red-800'}
                  ${isStampAnimating ? 'scale-110 ring-4 ring-red-200' : 'hover:scale-105'}
                `}
                title={isCollectedState ? T.collected : T.collect}
              >
                 <div className={`w-10 h-10 rounded-full border border-red-800 flex items-center justify-center absolute ${isStampAnimating ? 'animate-ping opacity-50' : 'hidden'}`}></div>
                 <span className={`${language === 'zh' ? 'font-calligraphy text-2xl pt-1' : 'font-serif text-xs font-bold'}`}>
                    {T.stamp}
                 </span>
              </button>

              <div className="flex-1 overflow-y-auto no-scrollbar p-8 pt-12">
                  <div className="mb-10 text-center">
                    <h2 className="text-3xl font-bold text-stone-900 mb-3 font-serif tracking-wide">{currentPoem.title}</h2>
                    <div className="text-stone-500 text-sm font-serif">
                       {currentPoem.dynasty} · {currentPoem.author}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-4 text-center mb-8">
                    {currentPoem.content.map((line, i) => (
                      <p key={i} className="text-xl sm:text-2xl text-stone-800 font-serif tracking-widest leading-relaxed">
                        {line}
                      </p>
                    ))}
                  </div>
                  
                  <div className="border-t border-stone-200 pt-6">
                    {(poemSource === 'search' || poemSource === 'collection') && currentPoem.analysis ? (
                      <div className="space-y-3">
                        <p className="text-stone-600 text-sm leading-loose font-serif text-justify">
                          <span className="block text-stone-400 text-xs mb-1 uppercase tracking-wider">{T.resonance}</span>
                          {currentPoem.analysis}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                         <p className="text-stone-500 text-sm leading-loose font-serif text-justify opacity-80">
                          <span className="block text-stone-400 text-xs mb-1 uppercase tracking-wider">{T.context}</span>
                          {currentPoem.context}
                         </p>
                      </div>
                    )}
                  </div>

                  {/* User Input Echo */}
                  {(poemSource === 'search' || (poemSource === 'collection' && userInput)) && userInput && (
                     <div className="mt-6 p-4 bg-stone-50 rounded-lg border border-stone-100">
                        <span className="block text-stone-400 text-xs mb-2 uppercase tracking-wider">{T.yourFeeling}</span>
                        <p className="text-stone-500 italic text-sm font-serif">"{userInput}"</p>
                     </div>
                  )}
                  
                  <div className="h-8"></div>
              </div>
           </div>
        </main>

        {/* Bottom Nav */}
        <div className="absolute bottom-8 left-0 right-0 z-40 flex justify-center gap-16 pointer-events-none">
          <div className="flex flex-col items-center gap-2 cursor-pointer group pointer-events-auto" onClick={handleOpenShanHeZhi}>
             <div className="p-4 rounded-full bg-[#e8e6e1]/80 backdrop-blur-md shadow-lg border border-white/20 group-hover:bg-stone-300 transition-all duration-300 transform group-hover:-translate-y-1 text-stone-800">
               <MountainIcon />
             </div>
             <span className="text-xs font-serif text-stone-600 tracking-widest group-hover:text-stone-900 drop-shadow-sm">
                {T.navCards}
             </span>
          </div>
          
          <div className="flex flex-col items-center gap-2 cursor-pointer group pointer-events-auto" onClick={handleOpenLetter}>
             <div className="p-4 rounded-full bg-stone-800/90 backdrop-blur-md shadow-xl border border-white/10 group-hover:bg-stone-700 transition-all duration-300 transform group-hover:-translate-y-1 text-stone-100">
               <WineIcon />
             </div>
             <span className="text-xs font-serif text-stone-600 tracking-widest group-hover:text-stone-900 drop-shadow-sm">
                {T.navLetter}
             </span>
          </div>
        </div>
      </div>
    );
  };

  const renderShanHeZhi = () => (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex justify-end">
       <Toast show={toast.show} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
       <div className="w-full sm:w-96 bg-[#fdfbf7] h-full shadow-2xl p-6 flex flex-col animate-slide-in-right relative">
          <div className="flex justify-between items-center mb-8 shrink-0">
             <h3 className={`text-2xl text-stone-900 ${language === 'zh' ? 'font-calligraphy' : 'font-serif tracking-wider'}`}>
                {T.navCards}
             </h3>
             <button onClick={() => setCurrentScreen(AppScreen.POEM_DISPLAY)} className="p-2 hover:bg-stone-200 rounded-full"><CloseIcon /></button>
          </div>

          <div className="flex-1 overflow-y-auto relative no-scrollbar">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                  <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin"></div>
                  <p className="text-stone-500 font-serif animate-pulse">{T.loadingAnalysis}</p>
              </div>
            ) : (
              <div className="space-y-6 pb-6">
                {poemCards.map((card, idx) => {
                  const isCollectedState = isCollected(card, 'card');
                  return (
                    <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-stone-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition">
                          <MountainIcon />
                        </div>
                        <div className="flex items-baseline gap-2 mb-3">
                          <h4 className="text-xl font-bold text-stone-900 font-serif">{card.term}</h4>
                          <span className="text-xs text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">{card.category}</span>
                        </div>
                        <p className="text-sm text-stone-600 mb-3 leading-relaxed font-serif">{card.description}</p>
                        <div className="pt-3 border-t border-stone-100">
                          <p className="text-xs text-stone-500 italic">"{card.culturalSignificance}"</p>
                        </div>
                        <button 
                          onClick={() => toggleCollection(card, 'card')}
                          className={`mt-4 w-full py-2 text-xs rounded transition-all duration-300
                            ${isCollectedState 
                                ? 'bg-stone-800 text-stone-50 hover:bg-stone-700 border border-stone-800' 
                                : 'bg-stone-50 text-stone-600 border border-stone-200 hover:bg-stone-800 hover:text-stone-50 hover:border-stone-800'}
                          `}>
                          {isCollectedState ? T.removeCollect : T.collectCard}
                        </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
       </div>
    </div>
  );

  const renderSingleCard = () => {
      if (!currentCard) return null;
      const isCollectedState = isCollected(currentCard, 'card');
      return (
        <div className="flex flex-col h-full bg-[#f5f5f4] animate-ink relative items-center justify-center p-6">
            <Toast show={toast.show} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
            
            <header className="absolute top-0 left-0 w-full flex items-center px-6 py-6 z-20">
                <button onClick={goBack} className="p-2 rounded-full hover:bg-stone-200 transition">
                    <ChevronLeft />
                </button>
            </header>

            <div className="bg-white w-full max-w-sm p-8 rounded-2xl shadow-2xl border border-stone-200 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                     <MountainIcon />
                 </div>
                 
                 {/* Seal Button */}
                 <button 
                    onClick={() => toggleCollection(currentCard, 'card')}
                    className={`absolute top-4 right-4 z-30 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 
                    ${isCollectedState
                        ? 'bg-red-900/90 text-white border-none ring-2 ring-red-900 ring-offset-2' 
                        : 'bg-white hover:bg-red-50 border-2 border-red-800 text-red-800'}
                    `}
                    title={isCollectedState ? T.collected : T.collect}
                >
                    <span className={`${language === 'zh' ? 'font-calligraphy text-lg pt-0.5' : 'font-serif text-xs font-bold'}`}>
                        {T.stamp}
                    </span>
                </button>

                 <div className="flex items-baseline gap-3 mb-6 mt-4">
                    <h4 className="text-3xl font-bold text-stone-900 font-serif">{currentCard.term}</h4>
                    <span className="text-sm text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">{currentCard.category}</span>
                 </div>
                 
                 <p className="text-lg text-stone-700 mb-6 leading-loose font-serif">{currentCard.description}</p>
                 
                 <div className="pt-6 border-t border-stone-100">
                    <span className="block text-stone-400 text-xs mb-2 uppercase tracking-wider">{T.cardCultural}</span>
                    <p className="text-stone-600 italic font-serif">"{currentCard.culturalSignificance}"</p>
                 </div>
            </div>
        </div>
      );
  };

  const renderLetter = () => {
      const isCollectedState = currentLetter ? isCollected(currentLetter, 'letter') : false;
      
      return (
        <div className="flex flex-col h-full bg-[#f5f5f4] animate-ink relative">
            <Toast show={toast.show} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
            
            <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-multiply z-0" 
                    style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper)' opacity='0.3'/%3E%3C/svg%3E")`
                    }}>
            </div>

            <header className="bg-[#fcfaf5] p-4 shadow-sm flex items-center sticky top-0 z-30 border-b border-stone-200">
                <button onClick={goBack} className="p-2 mr-2 rounded-full hover:bg-stone-200 transition"><ChevronLeft/></button>
                <div className="flex flex-col">
                    <span className="font-bold text-stone-900 font-serif tracking-widest">
                    {currentLetter ? `${currentLetter.poet}${T.poetLetter}` : T.letterTitle}
                    </span>
                </div>
                
                {currentLetter && (
                    <button 
                        onClick={() => toggleCollection(currentLetter, 'letter')}
                        className={`ml-auto w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 
                        ${isCollectedState
                            ? 'bg-red-900/90 text-white border-none ring-1 ring-red-900 ring-offset-1' 
                            : 'bg-transparent hover:bg-red-50 border-2 border-red-800 text-red-800'}
                        ${isStampAnimating ? 'scale-110' : ''}
                        `}
                        title={isCollectedState ? T.collected : T.collect}
                    >
                        <span className={`${language === 'zh' ? 'font-calligraphy text-lg pt-0.5' : 'font-serif text-xs font-bold'}`}>
                            {T.stamp}
                        </span>
                    </button>
                )}
            </header>

            <div className="flex-1 overflow-y-auto p-6 z-10 flex justify-center no-scrollbar">
                {currentLetter ? (
                    <div className="w-full max-w-lg bg-[#fcfaf5] p-8 shadow-lg border border-stone-200 min-h-[60vh] relative">
                        <div className="absolute inset-2 border border-stone-300 pointer-events-none"></div>
                        
                        <div className="relative z-10 font-serif text-stone-800 space-y-6">
                        <p className="text-lg leading-loose tracking-widest text-justify whitespace-pre-wrap">
                            {currentLetter.content}
                        </p>
                        
                        <div className="mt-12 flex flex-col items-end gap-2">
                            <span className={language === 'zh' ? 'font-calligraphy text-2xl' : 'font-serif text-xl italic'}>{currentLetter.poet}</span>
                            <div className="w-6 h-6 border border-red-800 text-red-800 flex items-center justify-center text-[10px]">
                                {language === 'zh' ? `${currentLetter.poet[0]}印` : 'Seal'}
                            </div>
                        </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-stone-400 gap-2">
                        <div className="animate-pulse">{T.loadingLetter}</div>
                    </div>
                )}
            </div>
        </div>
      );
  };

  // Splash Screen Logic
  if (currentScreen === AppScreen.SPLASH) {
      return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className="w-full h-screen bg-[#f5f5f4] text-stone-800 overflow-hidden font-serif selection:bg-stone-300 selection:text-stone-900">
      <InkBackground />
      
      {loading && <LoadingOverlay message={currentScreen === AppScreen.LETTER ? T.loadingLetter : (poemSource === 'random' ? T.loadingRandom : T.loadingSearch)} />}

      <div className="relative z-10 h-full max-w-md mx-auto bg-[#f5f5f4] shadow-2xl overflow-hidden sm:border-x sm:border-stone-200">
        {currentScreen === AppScreen.HOME && renderHome()}
        {currentScreen === AppScreen.COLLECTION && renderCollection()}
        {currentScreen === AppScreen.POEM_DISPLAY && renderPoemDisplay()}
        {currentScreen === AppScreen.SHAN_HE_ZHI && renderShanHeZhi()}
        {currentScreen === AppScreen.LETTER && renderLetter()}
        {currentScreen === 'SINGLE_CARD' && renderSingleCard()}
      </div>
    </div>
  );
}

export default App;
