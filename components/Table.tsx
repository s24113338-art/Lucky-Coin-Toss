
import React, { useRef, useEffect } from 'react';
import { GRID_CONFIG } from '../types';

interface TableProps {
  onCellPosition: (id: number, pos: { x: number; y: number }) => void;
  winningId: number | null;
  selectedNumbers: number[];
  onToggleNumber: (num: number) => void;
  disabled: boolean;
}

const Table: React.FC<TableProps> = ({ onCellPosition, winningId, selectedNumbers, onToggleNumber, disabled }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    const updatePositions = () => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const centerX = containerRect.left + containerRect.width / 2;
      const centerY = containerRect.top + containerRect.height / 15;

      GRID_CONFIG.numbers.forEach(num => {
        const cell = cellRefs.current[num];
        if (cell) {
          const rect = cell.getBoundingClientRect();
          onCellPosition(num, {
            x: (rect.left + rect.width / 2) - centerX,
            y: (rect.top + rect.height / 2) - centerY
          });
        }
      });
    };

    updatePositions();
    window.addEventListener('resize', updatePositions);
    return () => window.removeEventListener('resize', updatePositions);
  }, [onCellPosition]);

  return (
    <div className="relative w-full max-w-4xl aspect-[16/10] premium-rim rounded-[4.5rem] p-4 flex items-center justify-center overflow-visible shadow-2xl">
      {/* Decorative Studs around the rim */}
      <div className="brass-stud top-6 left-6"></div>
      <div className="brass-stud top-6 right-6"></div>
      <div className="brass-stud bottom-6 left-6"></div>
      <div className="brass-stud bottom-6 right-6"></div>
      
      {/* Brass Inlay Line */}
      <div className="absolute inset-2 border-2 border-amber-600/30 rounded-[4rem] pointer-events-none"></div>

      {/* Main Table Surface */}
      <div 
        ref={containerRef}
        className="relative w-full h-full felt-surface rounded-[3.5rem] p-10 overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"
      >
        {/* Decorative Grid Inlay (Shadow) */}
        <div className="absolute inset-10 border border-black/20 rounded-[2.5rem] pointer-events-none"></div>

        <div className="grid grid-cols-4 grid-rows-3 gap-8 w-full h-full relative z-10">
          {GRID_CONFIG.numbers.map((num) => {
            const isSelected = selectedNumbers.includes(num);
            const isWinner = winningId === num;
            
            return (
              <div
                key={num}
                ref={el => cellRefs.current[num] = el}
                onClick={() => !disabled && onToggleNumber(num)}
                className={`
                  relative flex items-center justify-center rounded-[2rem] cell-base
                  ${isSelected ? 'selected-state' : ''}
                  ${isWinner ? 'winning-state' : ''}
                  ${disabled && !isSelected ? 'opacity-10 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {/* Internal Brass Rim */}
                <div className={`absolute inset-1 border border-white/5 rounded-[1.8rem] pointer-events-none ${isWinner ? 'border-white/40' : ''}`}></div>
                
                {/* Number Design */}
                <span className={`
                  text-6xl md:text-8xl font-black font-['Bungee'] transition-all duration-500 select-none
                  ${isWinner 
                    ? 'text-white drop-shadow-[0_6px_10px_rgba(0,0,0,0.5)] scale-105' 
                    : isSelected 
                      ? 'text-yellow-200 drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]' 
                      : 'number-etch'
                  }
                `}>
                  {num}
                </span>

                {/* Surface Shine */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none rounded-[2rem]"></div>

                {/* Animated Chip Marker */}
                {isSelected && !isWinner && (
                    <div className="absolute -top-6 -right-2 px-4 py-1.5 bg-yellow-500 rounded-xl border-2 border-amber-200 flex items-center justify-center shadow-2xl transform rotate-12 animate-bounce z-30">
                        <span className="text-[11px] font-black text-amber-950 uppercase tracking-tighter">WAGERED</span>
                    </div>
                )}
                
                {/* Win Flare */}
                {isWinner && (
                  <div className="absolute inset-0 animate-pulse rounded-[2rem] bg-white/30 blur-2xl pointer-events-none"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Table;
