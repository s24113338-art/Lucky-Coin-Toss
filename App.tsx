
import React, { useState, useCallback, useRef, useEffect } from 'react';
import Table from './components/Table';
import Coin from './components/Coin';
import { GameState, GRID_CONFIG } from './types';
import { getDealerCommentary } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<GameState>({
    isTossing: false,
    result: null,
    history: [],
    dealerMessage: "RELOAD BANK, SELECT YOUR NUMBERS, WIN BIG!",
    balance: 0,
    betAmount: 10,
    isBetPlaced: false,
    selectedNumbers: [],
    streak: 0,
    logs: []
  });

  const cellPositions = useRef<{ [key: number]: { x: number; y: number } }>({});
  const [currentTarget, setCurrentTarget] = useState<{ x: number; y: number } | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const totalWager = state.betAmount * state.selectedNumbers.length;

  // Auto-scroll log to bottom
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.logs]);

  const handleCellPosition = useCallback((id: number, pos: { x: number; y: number }) => {
    cellPositions.current[id] = pos;
  }, []);

  const handleToggleNumber = (num: number) => {
    if (state.isBetPlaced || state.isTossing) return;
    
    setState(prev => {
      const isSelected = prev.selectedNumbers.includes(num);
      if (isSelected) {
        return { ...prev, selectedNumbers: prev.selectedNumbers.filter(n => n !== num) };
      }
      if (prev.selectedNumbers.length >= 3) return prev; // Limit to 3 numbers
      return { ...prev, selectedNumbers: [...prev.selectedNumbers, num] };
    });
  };

  const addLog = (msg: string) => {
    setState(prev => ({
      ...prev,
      logs: [msg, ...prev.logs].slice(0, 50)
    }));
  };

  const handleTopUp = (amount: number) => {
    setState(prev => ({ 
      ...prev, 
      balance: prev.balance + amount,
      dealerMessage: `BANKROLL UPDATED! +$${amount} CREDITS.`
    }));
    addLog(`CASH IN: +$${amount}`);
  };

  const adjustBet = (delta: number) => {
    if (state.isBetPlaced || state.isTossing) return;
    setState(prev => ({
      ...prev,
      betAmount: Math.max(10, prev.betAmount + delta)
    }));
  };

  const handlePlaceBet = () => {
    if (state.selectedNumbers.length === 0) {
      setState(prev => ({ ...prev, dealerMessage: "SELECT YOUR NUMBERS ON THE TABLE!" }));
      return;
    }
    if (state.balance < totalWager) {
      setState(prev => ({ ...prev, dealerMessage: "INSUFFICIENT BALANCE!" }));
      addLog("!! ALERT: BALANCE INSUFFICIENT !!");
      return;
    }
    setState(prev => ({
      ...prev,
      balance: prev.balance - totalWager,
      isBetPlaced: true,
      dealerMessage: `WAGER LOCKED: $${totalWager}. GOOD LUCK!`
    }));
    addLog(`WAGER: $${totalWager} ON [${state.selectedNumbers.join(', ')}]`);
  };

  const tossCoin = () => {
    if (state.isTossing || !state.isBetPlaced) return;

    // Randomize result (1-12)
    const newResult = Math.floor(Math.random() * 12) + 1;
    const target = cellPositions.current[newResult];

    setState(prev => ({
      ...prev,
      isTossing: true,
      result: null,
    }));
    setCurrentTarget(target);
  };

  const onAnimationEnd = async () => {
    const finalResult = GRID_CONFIG.numbers.find(n => 
        cellPositions.current[n].x === currentTarget?.x && 
        cellPositions.current[n].y === currentTarget?.y
    ) || null;

    const isWin = finalResult ? state.selectedNumbers.includes(finalResult) : false;
    
    // Payout Multipliers: 1 Pick = 10x, 2 Picks = 4x, 3 Picks = 2x
    const baseMultiplier = state.selectedNumbers.length === 1 ? 10 : (state.selectedNumbers.length === 2 ? 4 : 2);
    
    let newStreak = isWin ? state.streak + 1 : 0;
    if (newStreak > 5) newStreak = 5;

    const streakBonus = isWin && newStreak > 1 ? newStreak : 1;
    const winAmount = isWin ? (state.betAmount * baseMultiplier * streakBonus) : 0;
    
    const logEntry = isWin 
      ? `PROFIT: +$${winAmount} (WINNER! x${newStreak})`
      : `LOSS: -$${totalWager} (BET FAILED)`;

    setState(prev => ({
      ...prev,
      isTossing: false,
      result: finalResult,
      balance: prev.balance + winAmount,
      isBetPlaced: false,
      streak: newStreak,
      history: finalResult ? [finalResult, ...prev.history].slice(0, 8) : prev.history,
      logs: [logEntry, ...prev.logs].slice(0, 50),
      dealerMessage: isWin ? `WINNER! STREAK x${newStreak}! +$${winAmount}` : "TOUGH TOSS. GO AGAIN?"
    }));

    if (finalResult) {
      const commentary = await getDealerCommentary(finalResult, isWin);
      setState(prev => ({ ...prev, dealerMessage: commentary }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 arcade-floor">
      {/* Top Laser Accent */}
      <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-600 via-amber-400 to-red-600 shadow-[0_0_25px_rgba(251,191,36,0.6)] z-20"></div>

      <div className="relative w-full max-w-7xl flex flex-col gap-10 z-10">
        
        {/* Dynamic Header HUD */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900/60 rounded-[3.5rem] p-10 border border-white/5 backdrop-blur-3xl gap-10 shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
            <div className="text-center md:text-left">
                <h1 className="font-['Bungee'] text-6xl text-white tracking-[0.15em] drop-shadow-[0_6px_0_#92400e] italic uppercase">STREET COIN</h1>
                <div className="flex items-center justify-center md:justify-start gap-5 mt-4">
                    <div className="flex items-center gap-3 text-[11px] font-black text-amber-500 uppercase tracking-[0.5em]">
                        <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping shadow-[0_0_12px_#f59e0b]"></span>
                        VERIFIED ARENA
                    </div>
                    {state.streak > 0 && (
                      <div className="bg-gradient-to-r from-amber-600 to-orange-700 px-6 py-2 rounded-full text-white font-['Bungee'] text-sm animate-bounce shadow-[0_0_25px_rgba(245,158,11,0.6)] border border-amber-300/40">
                        WIN STREAK: x{state.streak}
                      </div>
                    )}
                </div>
            </div>
            
            <div className="bg-black/80 px-14 py-8 rounded-[3rem] border border-white/10 flex-1 max-w-2xl text-center shadow-inner relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <p className="text-amber-100 font-bold italic text-3xl leading-tight tracking-tight relative z-10">
                    &ldquo;{state.dealerMessage}&rdquo;
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Sidebar: Transaction Logs */}
            <div className="lg:col-span-3 panel-glass rounded-[3rem] p-10 flex flex-col h-[550px] border-l-[12px] border-amber-600 shadow-2xl">
                <span className="text-[12px] font-black text-amber-400 uppercase tracking-[0.5em] mb-10 flex items-center gap-4">
                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full shadow-[0_0_12px_#f59e0b]"></span>
                    FEEDER
                </span>
                <div className="flex-1 overflow-y-auto space-y-5 pr-4 scrollbar-none">
                    {state.logs.length === 0 && (
                        <div className="text-slate-800 text-xs italic text-center mt-24 font-black uppercase tracking-widest opacity-25">STATION IDLE...</div>
                    )}
                    {state.logs.map((log, i) => (
                        <div key={i} className={`p-6 rounded-[1.8rem] text-[11px] font-bold border transition-all duration-500 transform hover:scale-[1.02] ${
                          log.includes('PROFIT') ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 
                          log.includes('LOSS') ? 'bg-red-500/15 border-red-500/40 text-red-400' : 
                          log.includes('INSUFFICIENT') ? 'bg-yellow-500/30 border-yellow-500/60 text-yellow-500 animate-pulse font-black scale-105' :
                          'bg-white/5 border-white/15 text-slate-400'
                        }`}>
                            {log}
                        </div>
                    ))}
                    <div ref={logEndRef} />
                </div>
            </div>

            {/* Main Center: Table Board */}
            <div className="lg:col-span-9 relative flex flex-col items-center">
                <Table 
                    onCellPosition={handleCellPosition} 
                    winningId={state.isTossing ? null : state.result}
                    selectedNumbers={state.selectedNumbers}
                    onToggleNumber={handleToggleNumber}
                    disabled={state.isBetPlaced || state.isTossing}
                />
                <Coin 
                    isTossing={state.isTossing} 
                    targetPos={currentTarget} 
                    onAnimationEnd={onAnimationEnd} 
                />
            </div>
        </div>

        {/* Console: HUD Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 bg-slate-900/95 p-10 rounded-[4rem] border-t border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative z-10">
            {/* Bank Display */}
            <div className="flex flex-col gap-4 p-6 rounded-[2.5rem] bg-black/50 border border-white/5 shadow-inner">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] text-center">BANKROLL</span>
                <div className="flex-1 flex flex-col items-center justify-center">
                    <span className="text-6xl font-['Bungee'] text-white drop-shadow-lg glow-cyan">
                        ${state.balance}
                    </span>
                    <span className="text-[10px] font-black text-slate-700 tracking-[0.3em] mt-3 uppercase">USD CREDITS</span>
                </div>
            </div>

            {/* Cash-In Buttons */}
            <div className="flex flex-col gap-4 p-6 rounded-[2.5rem] bg-black/50 border border-white/5">
                <span className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.5em] text-center">DEPOSIT</span>
                <div className="flex gap-4 flex-1">
                    <button onClick={() => handleTopUp(10)} className="flex-1 bg-emerald-900 hover:bg-emerald-800 text-white font-['Bungee'] text-sm rounded-[1.5rem] shadow-[0_8px_0_#064e3b] active:shadow-none active:translate-y-2 transition-all">+$10</button>
                    <button onClick={() => handleTopUp(50)} className="flex-1 bg-emerald-800 hover:bg-emerald-700 text-white font-['Bungee'] text-sm rounded-[1.5rem] shadow-[0_8px_0_#065f46] active:shadow-none active:translate-y-2 transition-all">+$50</button>
                    <button onClick={() => handleTopUp(100)} className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white font-['Bungee'] text-sm rounded-[1.5rem] shadow-[0_8px_0_#047857] active:shadow-none active:translate-y-2 transition-all">+$100</button>
                </div>
            </div>

            {/* Wager Settings */}
            <div className="md:col-span-1 flex flex-col gap-4 p-6 rounded-[2.5rem] bg-black/50 border border-white/5">
                <span className="text-[11px] font-black text-amber-500 uppercase tracking-[0.5em] text-center">STAKE</span>
                <div className="flex gap-5 h-full">
                    <div className="flex flex-col gap-3">
                      <button onClick={() => adjustBet(10)} disabled={state.isBetPlaced || state.isTossing} className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white text-sm p-3 rounded-t-[1.5rem] transition-colors">▲</button>
                      <div className="bg-black/70 border border-white/10 rounded-2xl w-24 h-14 flex items-center justify-center font-['Bungee'] text-2xl text-amber-400 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] glow-amber">${state.betAmount}</div>
                      <button onClick={() => adjustBet(-10)} disabled={state.isBetPlaced || state.isTossing || state.betAmount <= 10} className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white text-sm p-3 rounded-b-[1.5rem] transition-colors">▼</button>
                    </div>

                    <button
                        onClick={handlePlaceBet}
                        disabled={state.isBetPlaced || state.isTossing || state.selectedNumbers.length === 0}
                        className={`
                            flex-1 rounded-[2rem] font-['Bungee'] text-sm leading-tight uppercase transition-all flex flex-col items-center justify-center border-4 border-transparent
                            ${state.isBetPlaced 
                                ? 'bg-cyan-900/70 text-cyan-300 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.4)]' 
                                : 'bg-amber-600 text-white shadow-[0_10px_0_#78350f] hover:bg-amber-500 active:shadow-none active:translate-y-2'}
                            disabled:opacity-40
                        `}
                    >
                        <span className="text-2xl tracking-widest">{state.isBetPlaced ? 'LOCKED' : 'BET'}</span>
                        <span className="text-[11px] font-black opacity-80 tracking-[0.2em] mt-3 uppercase">SUM: ${totalWager}</span>
                    </button>
                </div>
            </div>

            {/* Action Button */}
            <div className="flex items-stretch">
                <button
                    onClick={tossCoin}
                    disabled={state.isTossing || !state.isBetPlaced}
                    className={`
                        w-full rounded-[3.5rem] font-['Bungee'] text-4xl tracking-tighter transition-all relative overflow-hidden group
                        ${state.isTossing || !state.isBetPlaced
                            ? 'bg-slate-800 text-slate-700 cursor-not-allowed shadow-none'
                            : 'bg-gradient-to-br from-yellow-400 via-amber-500 to-amber-700 text-white shadow-[0_12px_0_#78350f] hover:scale-[1.05] active:shadow-none active:translate-y-3'}
                    `}
                >
                    <span className="relative z-10">{state.isTossing ? 'BOUNCING...' : 'TOSS COIN'}</span>
                    {!state.isTossing && state.isBetPlaced && (
                        <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors animate-pulse z-0"></div>
                    )}
                </button>
            </div>
        </div>

        {/* History & Active Slots Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-16 px-16 py-10">
            <div className="flex items-center gap-10">
                <span className="text-[12px] font-black text-slate-600 uppercase tracking-[0.6em]">PLAYER SLOTS</span>
                <div className="flex gap-6">
                    {[0, 1, 2].map(i => (
                        <div key={i} className={`w-20 h-20 rounded-[2rem] flex items-center justify-center font-['Bungee'] text-3xl border-4 transition-all duration-700 ${state.selectedNumbers[i] ? 'bg-indigo-900/80 border-amber-400 text-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.4)]' : 'bg-black/50 border-white/5 text-slate-800 shadow-inner'}`}>
                            {state.selectedNumbers[i] || '?'}
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="flex items-center gap-10 bg-black/60 px-16 py-10 rounded-[4rem] border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.7)] relative">
                <span className="text-[12px] font-black text-slate-600 uppercase tracking-[0.6em]">REEL HISTORY</span>
                <div className="flex items-center gap-8">
                    {state.history.length === 0 && <span className="text-slate-800 text-[12px] font-black tracking-widest uppercase opacity-40">WAITING FOR LANDING...</span>}
                    {state.history.map((h, i) => (
                        <div 
                          key={i} 
                          className={`
                            rounded-[1.8rem] flex items-center justify-center font-['Bungee'] transition-all duration-1000
                            ${i === 0 
                              ? 'w-28 h-28 bg-gradient-to-br from-yellow-300 to-amber-600 text-white text-7xl border-4 border-white shadow-[0_0_60px_rgba(251,191,36,0.7)] scale-125 z-10' 
                              : 'w-14 h-14 bg-white/5 text-slate-600 text-xl border border-white/10 opacity-30 blur-[1px]'
                            }
                          `}
                        >
                            {h}
                        </div>
                    ))}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default App;
