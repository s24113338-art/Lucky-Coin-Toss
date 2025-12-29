
import React from 'react';

interface CoinProps {
  isTossing: boolean;
  targetPos: { x: number; y: number } | null;
  onAnimationEnd: () => void;
}

const Coin: React.FC<CoinProps> = ({ isTossing, targetPos, onAnimationEnd }) => {
  const style = React.useMemo(() => {
    if (!targetPos) return {};
    
    // Initial throw values
    const startX = 0;
    const startY = 500; // Come from further down

    // Bounce Simulation: Distinct landing points on the board
    const b1x = (targetPos.x * 0.1) + (Math.random() * 120 - 60);
    const b1y = -200 + (Math.random() * 60);
    
    const b2x = (targetPos.x * 0.4) + (Math.random() * 160 - 80);
    const b2y = 150 + (Math.random() * 80);
    
    const b3x = (targetPos.x * 0.6) + (Math.random() * 100 - 50);
    const b3y = -80 + (Math.random() * 40);
    
    const b4x = (targetPos.x * 0.8) + (Math.random() * 60 - 30);
    const b4y = 80 + (Math.random() * 30);

    return {
      '--start-x': `${startX}px`,
      '--start-y': `${startY}px`,
      '--b1-x': `${b1x}px`,
      '--b1-y': `${b1y}px`,
      '--b2-x': `${b2x}px`,
      '--b2-y': `${b2y}px`,
      '--b3-x': `${b3x}px`,
      '--b3-y': `${b3y}px`,
      '--b4-x': `${b4x}px`,
      '--b4-y': `${b4y}px`,
      '--end-x': `${targetPos.x}px`,
      '--end-y': `${targetPos.y}px`,
    } as React.CSSProperties;
  }, [targetPos]);

  return (
    <>
      {/* Hand Flick Visual */}
      {isTossing && (
        <div className="absolute left-1/2 bottom-[5%] -translate-x-1/2 z-[70] flick-action pointer-events-none">
            <svg width="180" height="180" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 11V7C18 5.89543 17.1046 5 16 5C15.751 5 15.5135 5.04546 15.2952 5.12817C14.922 4.4443 14.2173 4 13.4 4C12.9234 4 12.4925 4.15344 12.1417 4.41219C11.8385 3.56825 11.0263 3 10.0667 3C8.92528 3 8 3.89543 8 5V12.2847C7.68307 12.1023 7.31169 12 6.91667 12C5.85812 12 5 12.8581 5 13.9167C5 15.228 5.76023 16.3615 6.86602 16.8913L10.3377 20.4485C11.103 21.2325 12.1558 21.6833 13.2625 21.6833H16.1404C17.653 21.6833 18.9959 20.6277 19.3496 19.1539L20.2687 15.3244C20.6121 13.8937 19.7289 12.4557 18.2982 12.1124L18 12.0411V11Z" fill="#fcd34d" stroke="#78350f" strokeWidth="1.5" />
                <path d="M12 4V2" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
            </svg>
        </div>
      )}

      {/* The Lucky Coin */}
      <div 
        className={`absolute z-[60] pointer-events-none ${isTossing ? 'coin-physics' : ''}`}
        style={{
          ...style,
          left: '50%',
          top: '15%',
          display: targetPos || isTossing ? 'block' : 'none'
        }}
        onAnimationEnd={onAnimationEnd}
      >
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 to-amber-600 border-[6px] border-yellow-100 shadow-[0_0_40px_rgba(251,191,36,0.9),inset_0_4px_10px_rgba(255,255,255,0.8)] flex items-center justify-center transform-gpu">
          <div className="w-12 h-12 rounded-full border-2 border-amber-900/10 flex items-center justify-center bg-yellow-400/80 shadow-inner">
              <span className="text-amber-950 font-black text-3xl select-none font-['Bungee']">$</span>
          </div>
          {/* High-end specular reflections */}
          <div className="absolute top-2 left-3 w-6 h-3 bg-white/60 rounded-full blur-[1px] rotate-[-35deg]"></div>
          <div className="absolute bottom-2 right-4 w-3 h-3 bg-white/20 rounded-full blur-[2px]"></div>
        </div>
      </div>
    </>
  );
};

export default Coin;
